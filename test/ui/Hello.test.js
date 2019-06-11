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

import React from 'react'
import sinon from 'sinon'
import { mount } from 'enzyme'
import Hello from '../../web-src/src/pages/Hello'
import Action from '../../web-src/src/services/Action'

describe('Page <Hello />', () => {
  beforeAll(() => {
    sinon.stub(Action, 'webInvoke')
      .callsFake((action, params) => {
        console.log(`hello ${params.name}!`)
        return `hello ${params.name}!`
      })
  })

  afterAll(() => {
    Action.webInvoke.restore()
  })

  test('should display h1 tag', () => {
    const wrapper = mount(<Hello />)
    const h1 = wrapper.find('h1')
    expect(h1).toHaveLength(1)
    expect(h1.text()).toEqual('Hello there')
  })

  test('should call action with input data', () => {
    const wrapper = mount(<Hello />)
    const input = wrapper.find('input[type="text"]')
    const submit = wrapper.find('button')
    // const h1 = wrapper.find('h1')
    // input.simulate('change', { target: { value: 'Atreus' } })
    input.getDOMNode().value = 'Atreus'
    input.simulate('change')
    expect(input.text()).toEqual('Atreus')
    submit.simulate('click')
  })
})
