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

const gqlQuery = `
    query {
        pets {
            name
            age
            owner {
                gender
                age
            }
        }
    }
`;
const gqlObj = {
    pets: {
        name: true,
        age: true,
        owner: {
            gender: true,
            age: true
        }
    }
};
const typeDefs = `
    type Query {
        pets: [Animal]
        quro(text: String, filter: [String]): Human
    }

    type Animal {
        kind: String!
        name: String!
        age: Int
        owner: Human
    }

    type Human {
        gender: String
        name: String!
        age: Int
    }
`;

module.exports = { gqlQuery, gqlObj, typeDefs };