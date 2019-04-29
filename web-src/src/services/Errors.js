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
class AppError extends Error {
  constructor (message, status) {
    if (typeof message === 'object') {
      super(JSON.stringify(message))
      this.json = message
    } else {
      super(message)
    }

    this.name = this.constructor.name
    this.stack = Error().stack // Error.captureStackTrace(this, this.constructor)

    this.status = status || 500
  }
}

class RequestValidationError extends AppError {
  constructor (fields) {
    super('Request validation failed, ' + JSON.stringify(fields), 400)
    this.fields = fields || {}
  }
}

module.exports = { AppError, RequestValidationError }
