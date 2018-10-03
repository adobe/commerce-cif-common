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

const { parse } = require('../../src/graphql/node_modules/graphql');
const { makeExecutableSchema } = require('../../src/graphql/node_modules/graphql-tools');
const { gqlToObject, validateAndParseQuery, makeGraphqlQuery, recursiveMerge } = require('../../src/graphql/utils');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

describe('GraphQL utilities', () => {

    const { gqlQuery, typeDefs } = require('../resources/utilsResources');

    const sameTestObjects = require('../resources/AliasAndArgsQueries').sameTestObjects;
    const { mergeRecursive, backToGraphql } = require('../resources/AliasAndArgsQueries').differentTestObjects;

    describe('Unit Tests', () => {

        it('returns document of a valid query', () => {
            let doc = validateAndParseQuery(makeExecutableSchema({ typeDefs }), gqlQuery);
            assert.deepEqual(doc, parse(gqlQuery));
        });

        it('throws syntax error', () => {
            let doc = validateAndParseQuery(makeExecutableSchema({ typeDefs }), '{pets { pets }');
            assert.hasAllKeys(doc, 'errors');
            let errors = doc.errors;
            assert.isArray(errors);
            let err = errors[0];
            assert.startsWith(err.message, "Syntax Error:");
        });

        it('Throws error for invalid field', () => {
            let doc = validateAndParseQuery(makeExecutableSchema({ typeDefs }), '{ pets { animals } }');
            assert.hasAllKeys(doc, 'errors');
            let errors = doc.errors;
            assert.isArray(errors);
            let err = errors[0];
            assert.startsWith(err.message, "Cannot query field");
        });

        Object.keys(sameTestObjects).forEach(o => {
            it('transforms correctly from query to object according to :' + o, () => {
                let initialObject = gqlToObject(parse(sameTestObjects[o].query).definitions[0]);
                assert.hasAllDeepKeys(initialObject, sameTestObjects[o].expectedObject);
                assert.deepEqual(initialObject, sameTestObjects[o].expectedObject);
            });
        });

        it('merges objects recursively', () => {
            let initialObject = recursiveMerge(mergeRecursive.obj1, mergeRecursive.obj2);
            assert.hasAllDeepKeys(initialObject, mergeRecursive.expectedObject);
            assert.deepEqual(initialObject, mergeRecursive.expectedObject);
        });

        it('transforms object back to gql format', () => {
            let resultString = makeGraphqlQuery(backToGraphql.object);
            assert.equal(resultString, backToGraphql.expectedQuery);
        });
    });
});