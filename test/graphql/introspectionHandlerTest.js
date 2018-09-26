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

const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

const { invalidField, syntaxError, introspectionQuery } = require('../resources/graphqlQueries');

const graphqlBase = require('../../src/graphql/introspectionHandler').main;

const customEndpoint = () => {
    return Promise.resolve("reached custom endpoint");
}

describe('CIF common graphql base', () => {

    describe('Unit Tests', () => {

        it('performs schema introspection', () => {
            return graphqlBase({
                query: introspectionQuery,
            }, null)
                .then(result => {
                    assert.isDefined(result.response.body);
                    assert.isDefined(result.response.body.data);
                    assert.isDefined(result.response.body.data.__schema);
                });
        });

        it('includes ow-activation-id in debug mode', () => {
            return graphqlBase({
                query: introspectionQuery,
                DEBUG: true
            }, null)
                .then(result => {
                    assert.hasAllKeys(result.response.headers, 'OW-Activation-Id');
                    assert.isDefined(result.response.body);
                    assert.isDefined(result.response.body.data);
                    assert.isDefined(result.response.body.data.__schema);
                });
        });

        it('returns an error body for syntax errors', () => {
            return graphqlBase({
                query: syntaxError
            }, null)
                .then(result => {
                    assert.isDefined(result.response.body.errors);
                    assert.isArray(result.response.body.errors);
                    let error = result.response.body.errors[0];
                    assert.startsWith(error.message, "Syntax Error");
                });
        });

        it('returns an error body for invalid fields', () => {
            return graphqlBase({
                query: invalidField
            }, null).then(result => {
                assert.isDefined(result.response.body.errors);
                assert.isArray(result.response.body.errors);
                let error = result.response.body.errors[0];
                assert.startsWith(error.message, "Cannot query field");
            });
        });

        it('returns errors and errorType when variables in not an object', () => {
            return graphqlBase({
                query: introspectionQuery,
                variables: "asd"
            }, null)
                .catch(err => {
                    assert.isDefined(err.response.error);
                    assert.isDefined(err.response.errorType);
                    assert.deepEqual(err.response.errorType, 'graphql');
                });
        });

        it('includes ow-activation-id for error in debug mode', () => {
            return graphqlBase({
                query: introspectionQuery,
                variables: "asd",
                DEBUG: true
            }, null)
                .catch(err => {
                    assert.hasAllKeys(err.response.headers, 'OW-Activation-Id');
                    assert.isDefined(err.response.error);
                    assert.isDefined(err.response.errorType);
                    assert.deepEqual(err.response.errorType, 'graphql');
                });
        });

        it('delegates validated data queries to custom graphqlBase', () => {
            return graphqlBase({
                query:
                    ` { searchProducts { total } }`
            }, customEndpoint)
                .then(result => {
                    assert.deepEqual(result, "reached custom endpoint");
                });
        });
    });
});