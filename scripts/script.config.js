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
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const utils = require('./script.utils')

const rootDir = path.join(__dirname, '..')

const packagejson = require(path.join(rootDir, 'package.json'))

// env variables
require('dotenv').config({ path: path.join(rootDir, '.env') })

// config
const config = {}
/// dotenv
if (!process.env.WHISK_APIHOST) throw new Error('Missing WHISK_APIHOST env variable')
if (!process.env.WHISK_AUTH) throw new Error('Missing WHISK_AUTH env variable')
if (!process.env.WHISK_NAMESPACE) throw new Error('Missing WHISK_NAMESPACE env variable')
process.env.WHISK_APIVERSION = process.env.WHISK_APIVERSION || 'v1'

config.owApihost = process.env.WHISK_APIHOST
config.owNamespace = process.env.WHISK_NAMESPACE
config.owAuth = process.env.WHISK_AUTH
config.owApiversion = process.env.WHISK_APIVERSION
/// either tvmUrl
config.tvmUrl = process.env.TVM_URL
/// or long term creds
config.s3Creds = (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_BUCKET) && {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  params: { Bucket: process.env.S3_BUCKET }
}
if (!(config.tvmUrl || config.s3Creds)) throw new Error('Missing s3 credentials or TVM_URL env variable')

/// env
config.remoteActions = !!process.env.REMOTE_ACTIONS
/// package.json
config.version = packagejson.version || '0.0.1'
config.name = packagejson.name || 'unnamed-cna'
/// project paths
config.rootDir = rootDir
config.srcActionDir = path.join(config.rootDir, 'actions')
config.srcUIDir = path.join(config.rootDir, 'web-src')
config.srcWskManifestFile = path.join(config.rootDir, 'manifest.yml')
config.distDir = path.join(config.rootDir, 'dist')
config.distActionsDir = path.join(config.distDir, 'actions')
config.distUIRemoteDir = path.join(config.distDir, 'ui-remote')
config.distUILocalDir = path.join(config.distDir, 'ui-local')
config.distWskManifestFile = path.join(config.rootDir, '.manifest-dist.yml')
config.uiConfigFile = path.join(config.srcUIDir, 'src', 'config.json')
/// wskManifest config
config.wskManifestPackagePlaceholder = '__CNA_PACKAGE__'
config.wskManifest = yaml.safeLoad(fs.readFileSync(config.srcWskManifestFile, 'utf8'))
config.wskManifestPackage = config.wskManifest.packages[config.wskManifestPackagePlaceholder]
config.wskManifestActions = config.wskManifestPackage.actions
/// deployment
config.owDeploymentPackage = `${config.name}-${config.version}`
config.s3DeploymentFolder = utils.urlJoin(config.owNamespace, config.owDeploymentPackage)
// credentials cache
config.credsCacheFile = path.join(rootDir, '.aws.tmp.creds.json')

// action urls {name: url}, if dev url is /actions/name
config.actionUrls = Object.entries(config.wskManifestActions).reduce((obj, [name, action]) => {
  const webArg = action['web-export'] || action['web']
  const webUri = (webArg && webArg !== 'no' && webArg !== 'false') ? 'web' : ''
  obj[name] = (config.remoteActions || process.env['NODE_ENV'] === 'production')
    ? utils.urlJoin(config.owApihost, 'api', config.owApiversion, webUri, config.owNamespace, config.owDeploymentPackage, name)
    : utils.urlJoin('/actions', name) // local url if NODE_ENV!=prod and REMOTE_ACTIONS not set
  return obj
}, {})

module.exports = config
