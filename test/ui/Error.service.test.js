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

import { AppError, RequestValidationError } from '../../web-src/src/services/Errors'

describe('Error Service', () => {
  it('should throw an error with custom format', () => {
    const error = new AppError('Reponse from server could not be parsed.', 500)
    expect(error.name).toEqual('AppError')
    expect(error.message).toEqual('Reponse from server could not be parsed.')
    expect(error.status).toEqual(500)
  })

  it('should throw an error with json', () => {
    const error = new AppError({ message: 'Reponse from server could not be parsed.' }, 500)
    expect(JSON.parse(error.message).message).toEqual('Reponse from server could not be parsed.')
    expect(error.json.message).toEqual('Reponse from server could not be parsed.')
  })

  it('should throw an error with fields', () => {
    const error = new RequestValidationError({ actionName: 'TestAction' })
    expect(error.fields.actionName).toEqual('TestAction')
    expect(error.name).toEqual('RequestValidationError')
    expect(error.status).toEqual(400)
  })
})
