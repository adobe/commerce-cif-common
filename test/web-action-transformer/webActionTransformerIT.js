/*******************************************************************************
 *
 *    Copyright 2018 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const assert = require('chai').assert;
const setup = require('../lib/setupIT.js').setup;
const openwhisk = require('openwhisk');
const sampleCommerceServiceSuccess = require('../resources/sample-commerce-service-success');
const sampleCommerceServiceError = require('../resources/sample-commerce-service-error');

describe('web action transformer integration tests', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        const ow = openwhisk({
            apihost: env.apihost,
            namespace: env.namespace,
            api_key: env.api_key,
            ignore_certs: env.ignore_certs
        });
        const blocking = env.blocking || true;
        const result = env.result || true;

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        it('web action transformer success', function() {
            const actionName = `${env.actionPrefix}/main`;
            const params = sampleCommerceServiceSuccess;
            return ow.actions.invoke({actionName, blocking, result, params}).then(response => {
                assert.strictEqual(response.headers['Cache-Control'], 'public, max-age=300');
                assert.isDefined(response.headers['Perf-Ow-Seq-In-']);
                assert.isDefined(response.headers['Perf-Ow-Seq-End-12345']);
                assert.isDefined(response.body);
            });
        });

        it('web action transformer error', function() {
            const actionName = `${env.actionPrefix}/main`;
            const params = sampleCommerceServiceError;
            return ow.actions.invoke({actionName, blocking, result, params}).then(response => {
                assert.strictEqual(response.statusCode, 404);
                assert.strictEqual(response.headers['Cache-Control'], 'no-cache, no-store, no-transform, must-revalidate');
                assert.isDefined(response.body);
            });
        });

        it('sets the Vary header', () => {
            const actionName = `${env.actionPrefix}/main`;
            const params = sampleCommerceServiceSuccess;
            return ow.actions.invoke({actionName, blocking, result, params}).then(response => {
                assert.strictEqual(response.headers['Vary'], 'Accept-Language');
            });
        });
    });
});
