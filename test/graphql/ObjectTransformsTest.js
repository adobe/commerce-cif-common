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

const ObjectTransformer = require('../../src/graphql/ObjectTransformer');

const transforms = require('../resources/object-transforms');

describe('ObjectTransformer', () => {

    describe('Unit tests', () => {

        Object.keys(transforms).forEach(t => {
            it('transforms an object according to ' + t + " rules", () => {
                let object = transforms[t];
                const transformer = new ObjectTransformer(object.transformRules);
                transformer.transform(object.initialRequest);
                assert.deepEqual(object.initialRequest, object.transformedRequest);
            });
        });
    });
});