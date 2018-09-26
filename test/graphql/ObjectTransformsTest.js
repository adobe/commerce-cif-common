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

const {
    aliasField, aliasFieldAlias,
    ignoreFields, deleteEmptyObject, deleteConditionalEmptyObject, removesEmptyObjectAfterIgnore,
    addSameLevelField, addFromSublevel, addToSublevel, multipleAdders, ignoresNotPresentAdders,
    moveAllFields, moveSelectedField, moveWithoutFrom, deltesEmptyFieldAfterMove, deltesConditionalEmptyFieldAfterMove,
    addsArgs, mergeArgs,
    inlineFragments ,allTransforms
} = require('../resources/object-transforms');

describe('ObjectTransformer', () => {

    let object = {};

    describe('Unit tests', () => {

        beforeEach(() => {
            object = {};
        });

        it('aliases CIF field', () => {
            object = aliasField;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('aliases CIF field with alias', () => {
            object = aliasFieldAlias;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('ignores fields', () => {
            object = ignoreFields;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('deletes object with all fields ignored', () => {
            object = deleteEmptyObject;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('deletes conditional empty objects', () => {
            object = deleteConditionalEmptyObject;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('removes empty object after ignore', () => {
            object = removesEmptyObjectAfterIgnore;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('adds fields on same level', () => {
            object = addSameLevelField;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('adds fields to subfields', () => {
            object = addToSublevel;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('adds fields from subfields', () => {
            object = addFromSublevel;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('supports multiple adders', () => {
            object = multipleAdders;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('ignores not present adders', () => {
            object = ignoresNotPresentAdders;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('move all selections of one field to another', () => {
            object = moveAllFields;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('move only selected fields', () => {
            object = moveSelectedField;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('move without from path', () => {
            object = moveWithoutFrom;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('move and delete empty field', () => {
            object = deltesEmptyFieldAfterMove;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('move and delete conditional empty field', () => {
            object = deltesConditionalEmptyFieldAfterMove;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('adds args to fields', () => {
            object = addsArgs;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('merges new args with present ones', () => {
            object = mergeArgs;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('takes all transforms into account', () => {
            object = allTransforms;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });

        it('inline frags', () => {
            object = inlineFragments;
            const transformer = new ObjectTransformer(object.transformObject);
            transformer.transform(object.actualObject);
            assert.deepEqual(object.actualObject, object.expectedObject);
        });
    });
});