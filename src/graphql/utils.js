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

const { parse } = require('graphql');
const { validate } = require('graphql/validation');
const jsonToQuery = require('json-to-graphql-query').jsonToGraphQLQuery;

/**
 * Transforms an AST into a javascript object
 * 
 * @param {DefinitionNode} node         DefinitionNode of parsed GraphQL source
 * 
 * @returns {Object}                    javascript object representing a GraphQL source
 */
function gqlToObject(node) {
    let object = {};
    if (node.selectionSet) {
        let selections = node.selectionSet.selections;
        selections.forEach(sel => {
            if (sel.kind === "Field" || sel.kind === "SelectionSet") {
                let name = sel.name.value;
                let alias = sel.alias ? sel.alias.value : undefined
                let field = alias || name;
                object[field] = object[field] ? recursiveMerge(object[field], gqlToObject(sel)) : gqlToObject(sel);
                if (alias !== undefined) {
                    object[field].__aliasFor = name;
                }
                if (sel.arguments.length > 0) {
                    object[field].__args = _parseArguments(sel.arguments);
                }
            } else if (sel.kind === "InlineFragment") {
                let name = sel.typeCondition.name.value;
                object.__on = object.__on || [];
                let fragFields = gqlToObject(sel);
                fragFields.__fragmentName = name;
                object.__on.push(fragFields);
            }
        });
    }
    return object;
}

/**
 * @private
 */
function _parseArguments(args) {
    let argsObj = {};
    args.forEach(arg => {
        if (arg.value.fields) {
            argsObj[arg.name.value] = _parseArguments(arg.value.fields);
        } else {
            argsObj[arg.name.value] = arg.value.value || arg.value.values.map(a => a.value);
        }
    });
    return argsObj;
}

/**
 * merges obj2 with obj1:
 * adds or overwrites all the keys from obj2 to obj1 recursively
 * 
 * @param {object} obj1 
 * @param {object} obj2 
 */
function recursiveMerge(obj1, obj2) {
    if(obj2) {
        Object.keys(obj2).forEach(key => {
            if (typeof obj2[key] === 'object') {
                obj1[key] = obj1[key] ? recursiveMerge(obj1[key], obj2[key]) : obj2[key];
            } else {
                if(!key.startsWith('__')) {
                    obj1[key] = obj2[key]; //overwrite
                }
            }
        });
    }
    return obj1;
}

/**
 * validates a GraphQL {@link Source} and parses it into a Document {@see DocumentNode}
 * 
 * @param {GraphQLSchema} schema    GraphQLSchema to validate the source against
 * @param {Source} source           Query | Mutation | Subscription
 * 
 * @return array of encountered errors or the source's Document if no errors encountered
 */
function validateAndParseQuery(schema, source) {
    let document;
    let err;
    try {
        document = parse(source);
    } catch (e) {
        err = e;
    }
    let errorObject = { errors: document ? validate(schema, document) : [err] };
    return errorObject.errors.length > 0 ? errorObject : document;
}

/**
 * transforms object (according to {@link json-to-graphql-query} format) into graphql query
 * 
 * @param {object} object  object representation of query
 * 
 * @return {string}        graphql query
 */
function makeGraphqlQuery(object) {
    let query = jsonToQuery(object, { ignoreFields: ['__cifName'] });
    return "{ " + query + " }";
}

module.exports = { gqlToObject, validateAndParseQuery, recursiveMerge, makeGraphqlQuery };