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
/**
 * Proxy server for e2e tests
 */
const express = require('express')
const ActionRunner = require('./runner')
const createTestCafe = require('testcafe')
const config = require('./script.config')
const testcafeConfig = require('../test/.testcaferc.json')
let testcafe = null

// Set up express server
const app = express()
app.use(express.json())

// config.distUIRemoteDir is the output of build.ui.js,
// this is a bit hacky way to retrieve the output..
app.use(express.static(config.distUIRemoteDir))
app.all(
  '/actions/*',
  ActionRunner
)
const port = Number(process.env.PORT || 9000)
app.listen(port)
console.log('Serving on port', port)

/**
 * Run tests
 */
createTestCafe('localhost', 1337, 1338)
  .then(tc => {
    testcafe = tc
    const runner = testcafe.createRunner()

    return runner
      .src(testcafeConfig.src)
      .browsers(testcafeConfig.browsers)
      .run()
  })
  .then(failedCount => {
    testcafe.close()
    process.exit(!!failedCount)
  })
