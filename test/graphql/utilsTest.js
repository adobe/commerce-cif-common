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
const { gqlToObject, validateAndParseQuery } = require('../../src/graphql/utils');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;
  
describe('GraphQL utilities', () => {

   const { gqlQuery, typeDefs } = require('../resources/utilsResources');
   const { simpleAlias, variousRootFieldAlias, rootFieldArgs, fieldArgs, nestedArgs, arrayArgs } = require('../resources/AliasAndArgsQueries');

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
            assert.hasAllDeepKeys(actualObject, simpleAlias.object);
            assert.deepEqual(actualObject, simpleAlias.object);
        });

        it('supports various aliases for same field correctly', () => {
            let actualObject = gqlToObject(parse(variousRootFieldAlias.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, variousRootFieldAlias.object);
            assert.deepEqual(actualObject, variousRootFieldAlias.object);
        });

        it('parses root field args correctly', () => {
            let actualObject = gqlToObject(parse(rootFieldArgs.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, rootFieldArgs.object);
            assert.deepEqual(actualObject, rootFieldArgs.object);
        });

        it('parses simple field args correctly', () => {
            let actualObject = gqlToObject(parse(fieldArgs.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, fieldArgs.object);
            assert.deepEqual(actualObject, fieldArgs.object);
        });

        it('parses nested args correctly', () => {
            let actualObject = gqlToObject(parse(nestedArgs.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, nestedArgs.object);
            assert.deepEqual(actualObject, nestedArgs.object);
        });

        it('parses array args correctly', () => {
            let actualObject = gqlToObject(parse(arrayArgs.query).definitions[0]);
            assert.hasAllDeepKeys(actualObject, arrayArgs.object);
            assert.deepEqual(actualObject, arrayArgs.object);
        });
    });
});