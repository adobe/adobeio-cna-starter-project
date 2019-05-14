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
const spawn = require('cross-spawn')
const config = require('./script.config')
const utils = require('./script.utils')

function deployActionsSync () {
  if (!fs.existsSync(config.distActionsDir) || !fs.statSync(config.distActionsDir).isDirectory() || !fs.readdirSync(config.distActionsDir).length) {
    throw new Error(`./${path.relative(config.rootDir, config.distActionsDir)}/ should not be empty, maybe you forgot to build your actions ?`)
  }

  console.log(`Deploying actions to ${config.owApihost} ...`)

  // rewrite wskManifest config
  const wskManifestCopy = { ...config.wskManifest }
  const wskManifestPackage = wskManifestCopy.packages[config.wskManifestPackagePlaceholder]

  wskManifestPackage.version = config.version

  Object.entries(wskManifestPackage.actions).forEach(([name, action]) => {
    const actionPath = path.join(config.rootDir, action.function)
    // change path to built action
    if (fs.statSync(actionPath).isDirectory()) {
      action.function = path.join(path.relative(config.rootDir, config.distActionsDir), name + '.zip')
    } else {
      action.function = path.join(path.relative(config.rootDir, config.distActionsDir), name + '.js')
      action.main = 'module.exports.' + (action.main || 'main')
    }
  })

  // replace package name
  const wskManifestString = yaml.safeDump(wskManifestCopy).replace(config.wskManifestPackagePlaceholder, config.owDeploymentPackage)

  // write the new wskManifest yaml
  fs.writeFileSync(config.distWskManifestFile, wskManifestString)

  // invoke wskManifest command

  // for now this is a tmp hack so that ~/.wskprops does not interfer with WHISK_* properties defined in .env
  const fakeWskProps = '.fake-wskprops'
  fs.writeFileSync(fakeWskProps, '')
  process.env['WSK_CONFIG_FILE'] = fakeWskProps
  // aio reads env WHISK_* properties
  const aio = spawn.sync(
    `aio`,
    [
      'runtime', 'deploy',
      '-m', config.distWskManifestFile
    ],
    { cwd: config.rootDir }
  )
  // hack end remove fake props file
  fs.unlinkSync(fakeWskProps)

  if (aio.error) throw aio.error
  if (aio.status !== 0) throw new Error(aio.stderr.toString())

  // show list of deployed actions
  Object.keys(config.wskManifestActions).forEach(an => {
    console.log(`  -> ${an}: ${config.actionUrls[an]}`)
  })

  console.log('Succesfully deployed actions 🎉')
}

utils.runAsScript(deployActionsSync)
