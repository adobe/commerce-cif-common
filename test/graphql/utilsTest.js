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
    const {
        simpleAlias, variousRootFieldAlias,
        rootFieldArgs, fieldArgs, nestedArgs, arrayArgs,
        inlineFrags, mergeRecursive, backToGraphql } = require('../resources/AliasAndArgsQueries');

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

        it('handles simple alias correctly', () => {
            let actualObject = gqlToObject(parse(simpleAlias.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, simpleAlias.expectedObject);
            assert.deepEqual(actualObject, simpleAlias.expectedObject);
        });

        it('supports various aliases for same field correctly', () => {
            let actualObject = gqlToObject(parse(variousRootFieldAlias.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, variousRootFieldAlias.expectedObject);
            assert.deepEqual(actualObject, variousRootFieldAlias.expectedObject);
        });

        it('parses root field args correctly', () => {
            let actualObject = gqlToObject(parse(rootFieldArgs.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, rootFieldArgs.expectedObject);
            assert.deepEqual(actualObject, rootFieldArgs.expectedObject);
        });

        it('parses simple field args correctly', () => {
            let actualObject = gqlToObject(parse(fieldArgs.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, fieldArgs.expectedObject);
            assert.deepEqual(actualObject, fieldArgs.expectedObject);
        });

        it('parses nested args correctly', () => {
            let actualObject = gqlToObject(parse(nestedArgs.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, nestedArgs.expectedObject);
            assert.deepEqual(actualObject, nestedArgs.expectedObject);
        });

        it('parses array args correctly', () => {
            let actualObject = gqlToObject(parse(arrayArgs.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, arrayArgs.expectedObject);
            assert.deepEqual(actualObject, arrayArgs.expectedObject);
        });

        it('parses inline fragments correctly', () => {
            let actualObject = gqlToObject(parse(inlineFrags.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, inlineFrags.expectedObject);
            assert.deepEqual(actualObject, inlineFrags.expectedObject);
        });

        it('merges objects recursively', () => {
            let actualObject = recursiveMerge(mergeRecursive.obj1, mergeRecursive.obj2);
            assert.hasAllDeepKeys(actualObject, mergeRecursive.expectedObject);
            assert.deepEqual(actualObject, mergeRecursive.expectedObject);
        });

        it('transforms object back to gql format', () => {
            let resultString = makeGraphqlQuery(backToGraphql.object);
            assert.equal(resultString, backToGraphql.expectedQuery);
        });
    });
});