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
const { isEmpty } = require('./adobe-helpers')

function isValidOfferName (offerName) {
  return !isEmpty(offerName) && offerName.length <= 250
}

function isValidOfferContent (offerContent) {
  return !isEmpty(offerContent)
}

function isValidWorkspace (workspace) {
  return isEmpty(workspace) || workspace.length <= 250
}

function getTenantName () {
  const targetConfig = config.get('target')
  if (!targetConfig) {
    throw new Error('missing config data: target')
  }
  const tenantName = targetConfig.tenantName
  if (!tenantName) {
    throw new Error('missing config data: target.tenantName')
  }
  return tenantName
}

module.exports = {
  getTenantName,
  isValidOfferName,
  isValidOfferContent,
  isValidWorkspace
}
