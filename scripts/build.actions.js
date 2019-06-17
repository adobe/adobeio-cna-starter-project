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
const fs = require('fs')
const path = require('path')
const Bundler = require('parcel-bundler')

const config = require('./script.config')
const utils = require('./script.utils')

async function buildActions () {
  // installs dependencies in zip actions,
  // we create the zip right after
  require('./install.zip.actions.dep') // sync

  const build = async function (name, action) {
    const actionPath = path.join(config.rootDir, action.function)

    if (fs.statSync(actionPath).isDirectory()) {
      // if directory zip it
      const outZip = path.join(config.distActionsDir, name + '.zip')
      await utils.zipFolder(actionPath, outZip)
      console.log(path.relative(config.rootDir, outZip))
    } else {
      // if not directory => package and minify to single file
      const bundler = new Bundler(actionPath, {
        outDir: config.distActionsDir,
        outFile: name + '.js',
        cache: false,
        watch: false,
        target: 'node',
        contentHash: false,
        minify: true,
        sourceMaps: false,
        bundleNodeModules: true,
        logLevel: 4
      })
      // promise
      return bundler.bundle()
    }
  }

  // build all sequentially
  for (let [name, action] of Object.entries(config.wskManifestActions)) {
    await build(name, action)
  }
  console.log()
  console.log('Action Build succeeded!')
}

utils.runAsScript(buildActions)
