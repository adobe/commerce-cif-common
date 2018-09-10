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
 * This action handles IntroSpection Queries and GraphQL Syntax Errors for the CIF GrahphQL Endpoint
 * and delegates the rest of the GraphQL requests to a custom Endpoint
 * @param   {GraphQLQuery}   args.query      //entering GraphQL query
 * @param   {ClientBase}     client          //custom client requires _handleSuccess and _handleError functions
 * @return  {Promise.<ExecutionResult>}
 */
function cifEndpoint(args, customEndpoint) {
    let query = args.query || "";
    // DocumentNode of query or encountered errors
    let document = validateAndParseQuery(schema, query);

    if (document.errors || query.includes("__schema") || query.includes("__types")) {
        //let graphql function handle errors and IntrospectionQueries
        return graphql(schema, query, null, null, args.variables, args.operationName)
            .then(result => {
                let headers = args.headers || {};
                headers['OW-Activation-Id'] = process.env.__OW_ACTIVATION_ID;
                args['response'] = { 'statusCode': 200, 'body': result, 'headers': headers };
                return args;
            })
            .catch(e => {
                args['response'] = { 'error': e, 'errorType': 'graphql' };
                return args;
            });
    } else {
        return customEndpoint(args);
    }
}

module.exports.main = cifEndpoint;