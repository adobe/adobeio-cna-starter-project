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
const aws = require('aws-sdk')
const utils = require('./script.utils')
const config = require('./script.config')

async function undeployStaticS3 () {
  const creds = config.s3Creds || await utils.getTmpS3Credentials(config.tvmUrl, config.owNamespace, config.owAuth, config.credsCacheFile)
  const s3 = new aws.S3(creds)

  if (!(await utils.s3.folderExists(s3, config.s3DeploymentFolder))) {
    throw new Error(`Cannot undeploy UI files, S3 folder ${config.s3DeploymentFolder} does not exist.`)
  }
  console.info(`Removing static web files from S3...`)
  await utils.s3.emptyFolder(s3, config.s3DeploymentFolder)

  console.log('Succesfully undeployed UI !')
}

utils.runAsScript(undeployStaticS3)
