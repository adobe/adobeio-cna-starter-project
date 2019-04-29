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
import { Selector } from 'testcafe'

/* global fixture:true, test:true */

fixture`Welcome Page`
  .page`http://localhost:9080`

/**
 * Check if the homepage content loads
 */
test('Welcome Page Loads', async t => {
  await t
    // Check for h1 tag
    .expect(Selector('#root h1').innerText).eql('Hello there')
    // Check for input tag
    .expect(Selector('#root input[type="text"]').exists).ok()
    // Check for submit button
    .expect(Selector('#root button').exists).ok()
})

/**
 * Test submitting the form without data
 */
test('Test greeting form: empty input', async t => {
  await t
    // Click submit button
    .click(Selector('#root button'))
    .expect(Selector('#root h1').innerText).eql('you didn\'t tell me who you are.')
})

test('Test greeting form: with name', async t => {
  await t
    // Input name
    .typeText(Selector('#root input[type="text"]'), 'Atreus', { replace: true })
    // Click submit button
    .click(Selector('#root button'))
    .expect(Selector('#root h1').innerText).eql('hello Atreus!')
})
