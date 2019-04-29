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
import React from 'react'
import Action from '../services/Action'
import logo from '../../resources/adobe-logo.png'

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      greeting: 'Hello there',
      name: '',
      errorMsg: ''
    }

    this.inputChange = this.inputChange.bind(this)
    this.hello = this.hello.bind(this)
  }

  inputChange (event) {
    const name = event.target.value
    this.setState({
      name
    })
  }

  async hello () {
    try {
      const json = await Action.webInvoke('hello', { name: this.state.name }, true)
      this.setState({
        greeting: json.message,
        errorMsg: ''
      })
    } catch (e) {
      this.setState({
        errorMsg: (e.status || 'Error') + ': ' + e.message
      })
    }
  }

  render () {
    return <div style={{ textAlign: 'center' }}>
      <div >
        <img src={logo} height='75px' />
      </div>
      <h1>{this.state.greeting}</h1>
      <div>
        <input type='text' onChange={this.inputChange} value={this.state.name} placeholder='Text here' />
        <button onClick={this.hello} variant='primary'>Greet</button>
      </div>
      {this.state.errorMsg &&
        <div style={{ color: 'red' }}>
          <div variant='error'>{this.state.errorMsg}</div>
        </div>
      }
    </div>
  }
}
