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
/* eslint-env jest */
const action = require('../../actions/hello')

describe('Action: hello', () => {
  describe('main', () => {
    test('should return content type json', () => {
      const response = action.main({})
      expect(response.headers['content-type']).toBe('application/json')
    })

    test('should return default message', () => {
      const response = action.main({})
      expect(response.body.message).toBe('you didn\'t tell me who you are.')
    })

    test('should greet with name', () => {
      const response = action.main({ name: 'Atreus' })
      expect(response.body.message).toBe('hello Atreus!')
    })

    test('should return error', () => {
      const response = action.main({ name: '!Atreus' })
      expect(response.statusCode).toBe(400)
      expect(response.body.error).toBe('Atreus')
    })
  })
})
