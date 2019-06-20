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
const config = require('@adobe/aio-cli-config')

function isEmpty (s) {
  return s === null || s === undefined || s.length === 0
}

function getApiKey () {
  const jwtAuth = config.get('jwt-auth')
  if (!jwtAuth) {
    throw new Error('missing config data: jwt-auth')
  }
  const apiKey = jwtAuth.client_id
  if (!apiKey) {
    throw new Error('missing config data: jwt-auth.client_id')
  }
  return apiKey
}

function getAccessToken () {
  const jwtAuth = config.get('jwt-auth')
  if (!jwtAuth) {
    throw new Error('missing config data: jwt-auth')
  }
  const accessToken = jwtAuth.access_token
  if (!accessToken) {
    throw new Error('missing config data: jwt-auth.access_token')
  }
  return accessToken
}

module.exports = {
  getApiKey,
  getAccessToken,
  isEmpty
}
