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
const Bundler = require('parcel-bundler')
const fs = require('fs-extra')
const path = require('path')

const config = require('./script.config')
const utils = require('./script.utils')

async function buildUI () {
  // clean/create needed dirs
  fs.emptyDirSync(config.distUIRemoteDir)

  // 1. generate config
  require('./generate.config')

  // 2. build UI files
  const bundler = new Bundler(path.join(config.srcUIDir, 'index.html'), {
    cache: false,
    outDir: config.distUIRemoteDir,
    publicUrl: './',
    watch: false,
    detailedReport: true
  })

  await bundler.bundle()
  console.log('UI Build succeeded!')
}

utils.runAsScript(buildUI)
