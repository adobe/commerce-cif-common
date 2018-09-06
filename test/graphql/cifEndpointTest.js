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

const { invalidField, syntaxError, introSpectionQuery } = require('../resources/graphqlQueries');

const endpoint = require('../../src/graphql/cifEndpoint').main;

const TestClient = {
    _handleSuccess: (body) => {
        return {
            response: {
                body: body
            }
        }
    },
    _handleError: (error) => {
        throw error;
    }
}

const customEndpoint = () => {
    return Promise.resolve("reached custom endpoint");
}

describe('CIF common graphql endpoint', () => {

    describe('Unit Tests', () => {

        it('performs schema introspection', () => {
            return endpoint({
                query: introSpectionQuery,
            }, TestClient, null)
                .then(result => {
                    assert.isDefined(result.response.body);
                    assert.isDefined(result.response.body.data);
                });
        });

        it('returns an error body for syntax errors', () => {
            return endpoint({
                query: syntaxError
            }, TestClient, null)
            .then(result => {
                assert.isDefined(result.response.body.errors);
                assert.isArray(result.response.body.errors);
                let error = result.response.body.errors[0];
                assert.startsWith(error.message, "Syntax Error");
            });
        });

        it('returns an error body for invalid fields', () => {
            return endpoint({
                query: invalidField
            }, TestClient, null).then(result => {
                assert.isDefined(result.response.body.errors);
                assert.isArray(result.response.body.errors);
                let error = result.response.body.errors[0];
                assert.startsWith(error.message, "Cannot query field");
            });
        });

        it('delegates errors to client', () => {
            return endpoint({
                query: introSpectionQuery,
                variables: "asd"
            }, TestClient, null)
            .catch(err => {
                assert.isDefined(err);
            });
        });

        it('delegates validated data queries to custom endpoint', () => {
            return endpoint({
                query: 
                    ` { searchProducts { total } }`
            }, TestClient, customEndpoint)
            .then(result => {
                assert.deepEqual(result, "reached custom endpoint");
            });
        });
    });
});