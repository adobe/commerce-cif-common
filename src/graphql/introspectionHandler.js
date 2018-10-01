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

const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const graphqlSchema = require('@adobe/commerce-cif-model').graphqlSchema;

const validateAndParseQuery = require('./utils').validateAndParseQuery;
const schema = makeExecutableSchema({ typeDefs: graphqlSchema });

/**
 * This action handles CIF introspection queries and the validation of the queries based on the CIF GraphQL schema.
 * For data queries, it delegates the processing to the given dataQueryHandler.
 * 
 * @param   {object}   args              The arguments object from the Openwhisk action invocation.
 * @param   {Source}   args.query        The args object must contain the JSON 'query' of the GraphQL request.
 * @param   {Function} dataQueryHandler  A function that will process GraphQL data queries. It will be called with the 'args' argument.
 * @return  {Promise.<ExecutionResult>}
 */
function introspectionHandler(args, dataQueryHandler) {
    let query = args.query;
    // DocumentNode of query or encountered errors
    let document = validateAndParseQuery(schema, query);

    if (document.errors || query.includes("__schema") || query.includes("__types")) {
        //let graphql function handle errors and IntrospectionQueries
        return graphql(schema, query, null, null, args.variables, args.operationName)
            .then(result => {
                let headers = {};
                if (args.DEBUG) {
                    headers['OW-Activation-Id'] = process.env.__OW_ACTIVATION_ID;
                }
                args['response'] = { 'statusCode': 200, 'body': result, 'headers': headers };
                return args;
            })
            .catch(e => {
                if (args.DEBUG) {
                    args.headers = args.headers || {};
                    args.headers['OW-Activation-Id'] = process.env.__OW_ACTIVATION_ID;
                }
                args['response'] = { 'error': e, 'errorType': 'graphql' };
                return args;
            });
    } else {
        return dataQueryHandler(args);
    }
}

module.exports.main = introspectionHandler;