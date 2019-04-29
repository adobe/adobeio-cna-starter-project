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
import assert from 'assert'

import { AppError, RequestValidationError } from '../../web-src/src/services/Errors'

describe('Error Service', () => {
  it('should throw an error with custom format', () => {
    const error = new AppError('Reponse from server could not be parsed.', 500)
    assert.strictEqual(error.name, 'AppError')
    assert.strictEqual(error.message, 'Reponse from server could not be parsed.')
    assert.strictEqual(error.status, 500)
  })

  it('should throw an error with json', () => {
    const error = new AppError({ message: 'Reponse from server could not be parsed.' }, 500)
    assert.strictEqual(JSON.parse(error.message).message, 'Reponse from server could not be parsed.')
    assert.strictEqual(error.json.message, 'Reponse from server could not be parsed.')
  })

  it('should throw an error with fields', () => {
    const error = new RequestValidationError({ actionName: 'TestAction' })
    assert.strictEqual(error.fields.actionName, 'TestAction')
    assert.strictEqual(error.name, 'RequestValidationError')
    assert.strictEqual(error.status, 400)
  })
})
