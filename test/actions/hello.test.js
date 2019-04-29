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
/* eslint-env mocha */

const assert = require('assert')
const action = require('../../actions/hello')

describe('Action: hello', () => {
  describe('main', () => {
    it('should return content type json', () => {
      const response = action.main({})
      assert.strictEqual(response.headers['content-type'], 'application/json')
    })

    it('should return default message', () => {
      const response = action.main({})
      assert.strictEqual(response.body.message, 'you didn\'t tell me who you are.')
    })

    it('should greet with name', () => {
      const response = action.main({ name: 'Atreus' })
      assert.strictEqual(response.body.message, 'hello Atreus!')
    })

    it('should return error', () => {
      const response = action.main({ name: '!Atreus' })
      assert.strictEqual(response.statusCode, 400)
      assert.strictEqual(response.body.error, 'Atreus')
    })
  })
})
