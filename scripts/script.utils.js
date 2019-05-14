/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const fs = require('fs-extra') // promises
const path = require('path')
const mime = require('mime-types')
const request = require('request-promise')

// s3 utils
/**
 * Checks if s3 prefix exists
 * @param  {} s3Client with bucket configured
 * @param  {string} [prefix = '']
 */
async function folderExists (s3Client, prefix = '') {
  const listParams = {
    Prefix: prefix
  }
  const listedObjects = await s3Client.listObjectsV2(listParams).promise()
  return listedObjects.Contents.length !== 0
}
/**
 * Deletes all files in a s3 prefix location
 * @param  {} s3Client with bucket configured
 * @param  {string} [prefix = '']
 */
async function emptyFolder (s3Client, prefix = '') {
  const listParams = {
    Prefix: prefix
  }
  const listedObjects = await s3Client.listObjectsV2(listParams).promise()
  if (listedObjects.Contents.length === 0) return
  const deleteParams = {
    Delete: { Objects: [] }
  }
  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key })
  })
  await s3Client.deleteObjects(deleteParams).promise()
  if (listedObjects.IsTruncated) await emptyFolder()
}
/**
 * Uploads a file to s3
 * @param  {string} file
 * @param  {string} [prefix = ''] - s3 prefix to upload the file to
 */
async function uploadFile (s3Client, file, prefix = '') {
  const content = await fs.readFile(file)
  const uploadParams = {
    Key: urlJoin(prefix, path.basename(file)),
    Body: content,
    ACL: 'public-read',
    // s3 misses some mime types like for css files
    ContentType: mime.lookup(path.extname(file))
  }
  return s3Client.upload(uploadParams).promise()
}
/**
 * Uploads all files in a dir to s3 - flat, no recursion support
 * @param  {} s3Client with bucket configured
 * @param  {string} [prefix = ''] - s3 prefix to upload the dir to
 * @param  {string} dir - directory with files to upload
 * @param  {function} [postFileUploadCallback] - called for each uploaded file
 */
async function uploadDir (s3Client, prefix = '', dir, postFileUploadCallback) {
  async function _filterFiles (files) {
    const bools = await Promise.all(files.map(async f => (await fs.stat(f)).isFile()))
    return files.filter(f => bools.shift())
  }

  const files = await _filterFiles((await fs.readdir(dir)).map(f => path.join(dir, f)))

  // parallel upload
  return Promise.all(files.map(async f => {
    const s3Res = await uploadFile(s3Client, f, prefix)
    if (postFileUploadCallback) postFileUploadCallback(f)
    return s3Res
  }))
}
/**
 * @param  {string} tvmUrl
 * @param  {string} owNamespace
 * @param  {string} owAuth
 * @param  {string} cacheCredsFile=''
 */
async function getTmpS3Credentials (tvmUrl, owNamespace, owAuth, cacheCredsFile = '') {
  async function _cacheCredentialsToFile (cacheCredsFile, cacheKey, creds) {
    if (!cacheCredsFile) return null

    let allCreds
    try {
      allCreds = require(cacheCredsFile)
    } catch (e) {
      allCreds = {} // cache file does not exist
    }

    // need to store by namespace in case user changes namespace in config
    allCreds[cacheKey] = creds
    fs.writeFileSync(cacheCredsFile, JSON.stringify(allCreds))

    return true
  }
  async function _getCredentialsFromTVM (tvmUrl, owNamespace, owAuth) {
    return request(tvmUrl, {
      json: {
        owNamespace: owNamespace,
        owAuth: owAuth
      }
    })
  }
  function _getCredentialsFromCacheFile (cacheCredsFile, cacheKey) {
    if (!cacheCredsFile) return null

    let creds
    try {
      creds = require(cacheCredsFile)[cacheKey]
    } catch (e) {
      return null // cache file does not exist
    }
    if (!creds) return null // credentials for namespace do not exist
    if (Date.parse(creds.expiration) < (Date.now() - 60000)) return null
    return creds
  }
  const cacheKey = `${owNamespace}-${tvmUrl}`
  let creds = _getCredentialsFromCacheFile(cacheCredsFile, cacheKey)
  if (!creds) {
    creds = await _getCredentialsFromTVM(tvmUrl, owNamespace, owAuth)
    _cacheCredentialsToFile(cacheCredsFile, cacheKey, creds)
  }
  return creds
}

/**
 * Zip a folder using archiver
 * @param {String} dir
 * @param {String} out
 * @returns {Promise}
 */
function zipFolder (dir, out) {
  const archive = require('archiver')('zip', { zlib: { level: 9 } })
  const stream = fs.createWriteStream(out)

  return new Promise((resolve, reject) => {
    archive
      .directory(dir, false)
      .on('error', err => reject(err))
      .pipe(stream)

    stream.on('close', () => resolve())
    archive.finalize()
  })
}

/**
 * Joins url path parts
 * @param {...string} args url parts
 * @returns {string}
 */
function urlJoin (...args) {
  let start = ''
  if (args[0] && args[0].startsWith('/')) start = '/'
  return start + args.map(a => a && a.replace(/(^\/|\/$)/g, '')).filter(a => a).join('/')
}
/**
 * Wraps a function and makes sure to exit the process with an error code if
 * there is an error
 * @param  {function} f can be sync or async
 * @returns {Promise}
 */
async function runAsScript (f) {
  try {
    await f()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

module.exports = {
  s3: {
    folderExists: folderExists,
    emptyFolder: emptyFolder,
    uploadFile: uploadFile,
    uploadDir: uploadDir
  },
  getTmpS3Credentials: getTmpS3Credentials,
  zipFolder: zipFolder,
  urlJoin: urlJoin,
  runAsScript: runAsScript
}
