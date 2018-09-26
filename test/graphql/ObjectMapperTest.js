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
const assert = chai.assert;

const ObjectMapper = require('../../src/graphql/ObjectMapper');

const {
    noTransformsObject, aliasObject, multipleAliasForSameField
} = require('../resources/object-filtersAndMappers');

describe('ObjectMapper', () => {

    let object = {};

    describe('Unit tests', () => {

        it('filters right fields without alias', () => {
            object = noTransformsObject;
            const mapper = new ObjectMapper(object.filterAndMappers);
            mapper.map(object.originalObject, object.resultsObject);
            assert.deepEqual(object.originalObject, object.expectedObject());
        });

        it('maps alias object to right ', () => {
            object = aliasObject;
            const mapper = new ObjectMapper(object.filterAndMappers);
            mapper.map(object.originalObject, object.resultsObject);
            assert.deepEqual(object.originalObject, object.expectedObject());
        });

        it('gets data for multiple same fields ', () => {
            object = multipleAliasForSameField;
            const mapper = new ObjectMapper(object.filterAndMappers);
            mapper.map(object.originalObject, object.resultsObject);
            assert.deepEqual(object.originalObject, object.expectedObject());
        });


    });
});