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
const mime = require('mime')

const config = require('./script.config')

/**
 * Express Route handler for triggering actions
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */

module.exports = async (req, res, next) => {
  const url = req.params[0]
  const parts = url.split('/')
  const actionName = parts[0]
  const requestPath = url.replace(actionName, '')

  let params = {
    __ow_body: req.body,
    __ow_headers: req.headers,
    __ow_path: requestPath,
    __ow_query: req.query,
    __ow_method: req.method.toLowerCase(),
    ...req.query,
    ...(req.is('application/json') ? req.body : {})
  }
  params['__ow_headers']['x-forwarded-for'] = '127.0.0.1'

  // disallow access to UI action -> avoids getting wrong path pointing to
  // remote action folder. This is a tmp fix which will be solved once html is
  // not served by action for remote
  let action = config.wskManifestActions[actionName]
  if (!action) {
    return res.status(404)
      .send({ error: '404: Action ' + actionName + ' not found' })
  }

  const actionPath = action.function
  const actionFunction = require(path.join(config.rootDir, actionPath)).main

  try {
    let response = await actionFunction(params)
    const headers = response.headers
    const status = response.statusCode

    headers['Content-Type'] = headers['Content-Type'] || headers['content-type'] || mime.getType(requestPath)
    return res
      .set(headers || {})
      .status(status || 200)
      .send(response.body)
  } catch (e) {
    return res
      .status(500)
      .send({ error: e.message })
  }
}
