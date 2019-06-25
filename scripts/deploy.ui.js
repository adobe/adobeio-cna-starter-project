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
const path = require('path')
const fs = require('fs')
const aws = require('aws-sdk')
const open = require('open')
const utils = require('./script.utils')
const config = require('./script.config')

async function deployStaticS3 () {
  if (!fs.existsSync(config.distUIRemoteDir) || !fs.statSync(config.distUIRemoteDir).isDirectory() || !fs.readdirSync(config.distUIRemoteDir).length) {
    throw new Error(`./${path.relative(config.rootDir, config.distUIRemoteDir)}/ should not be empty, maybe you forgot to build your UI ?`)
  }
  console.log(`Uploading static web files to S3...`)

  const creds = config.s3Creds || await utils.getTmpS3Credentials(config.tvmUrl, config.owNamespace, config.owAuth, config.credsCacheFile)
  const s3 = new aws.S3(creds)

  if (await utils.s3.folderExists(s3, config.s3DeploymentFolder)) {
    console.info(`An already existing deployment for version ${config.version} will be overwritten`)
    await utils.s3.emptyFolder(s3, config.s3DeploymentFolder)
  }
  await utils.s3.uploadDir(s3, config.s3DeploymentFolder,
    config.distUIRemoteDir, f => console.log(`  -> ${path.basename(f)}`))

  const url = `https://s3.amazonaws.com/${creds.params.Bucket}/${config.s3DeploymentFolder}/index.html`

  console.log(url)
  console.log('Succesfully deployed UI 🎉')
  open(url)
}

utils.runAsScript(deployStaticS3)
