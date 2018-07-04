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

const assert = require('chai').assert;
const InputValidator = require('../../src/shared/input-validator');

describe('Input validator', () => {

    describe('Unit tests', () => {

        it('Mandatory parameter', () => {
            const validator = new InputValidator({'mandatory': 1});
            validator.mandatoryParameter('mandatory');
            assert.isNull(validator.error);
            validator.mandatoryParameter('other');
            assert.isDefined(validator.error);
        });

        it('Curency code', () => {
            const validator = new InputValidator({'currency': 'USD', 'not-currency-1': 'US1', 'not-currency-2': 'USD1'});
            validator.isCurrencyCode('currency');
            assert.isNull(validator.error);

            validator.isCurrencyCode('not-existing-prop');
            assert.isNull(validator.error);

            validator.isCurrencyCode('not-currency-1');
            assert.isDefined(validator.error);

            validator.error = null;
            validator.isCurrencyCode('not-currency-2');
            assert.isDefined(validator.error);
        });

        it('Integer', () => {
            const validator = new InputValidator({'integer-1': '1', 'integer-2': 1, 'not-integer-1': '1.1', 'not-integer-2': 'hello'});
            validator.isInteger('integer-1');
            assert.isNull(validator.error);

            validator.isInteger('integer-2');
            assert.isNull(validator.error);

            validator.isInteger('not-existing');
            assert.isNull(validator.error);

            validator.isInteger('not-integer-1');
            assert.isDefined(validator.error);

            validator.error = null;
            validator.isInteger('not-integer-2');
            assert.isDefined(validator.error);
        });

        it('Inside interval', () => {
            const params = {'a': 2, 'b': 2.3, 'c': '2', 'd': '2.3'}
            const validator = new InputValidator(params);

            validator.isInsideInterval('non-existing');
            assert.isNull(validator.error);
            validator.isInsideInterval('non-existing', 7);
            assert.isNull(validator.error);
            validator.isInsideInterval('non-existing', undefined, 0);
            assert.isNull(validator.error);
            validator.isInsideInterval('non-existing', 6, 7);
            assert.isNull(validator.error);

            Object.keys(params).forEach(paramName => {
                validator.isInsideInterval(paramName);
                assert.isNull(validator.error);
                validator.isInsideInterval(paramName, 0);
                assert.isNull(validator.error);
                validator.isInsideInterval(paramName, undefined, 5);
                assert.isNull(validator.error);
                validator.isInsideInterval(paramName, 0, 5);
                assert.isNull(validator.error);

                validator.isInsideInterval(paramName, 7);
                assert.isDefined(validator.error);
                validator.error = null;

                validator.isInsideInterval(paramName, 0, 1);
                assert.isDefined(validator.error);
                validator.error = null;

                validator.isInsideInterval(paramName, undefined, 1);
                assert.isDefined(validator.error);
                validator.error = null;
            });

            validator.isInsideInterval('a', 7);
            assert.strictEqual(validator.error.message, "Parameter 'a' must be greater or equal to 7");
            validator.error = null;

            validator.isInsideInterval('a', undefined, 0);
            assert.strictEqual(validator.error.message, "Parameter 'a' must be lower or equal to 0");
            validator.error = null;

            validator.isInsideInterval('a', 7, 9);
            assert.strictEqual(validator.error.message, "Parameter 'a' must be in interval [7, 9]");
        });

        it('Regexp', () => {
            const validator = new InputValidator({'param': 'abc1'});
            validator.matchRegexp('non-existing', /a/);
            assert.isNull(validator.error);

            validator.matchRegexp('param', /[a-z0-9]*/);
            assert.isNull(validator.error);

            validator.matchRegexp('param', /[a-z]*/);
            assert.isDefined(validator.error);
        });

        it('Argumets are present', () => {
            let validator = new InputValidator({});
            validator.checkArguments();
            assert.isNull(validator.error);

            validator = new InputValidator();
            validator.checkArguments();
            assert.isDefined(validator.error);
        });

        it('At least one parameter is present', () => {
            const validator = new InputValidator({'a': 1, 'b': 1});
            validator.atLeastOneParameter(['a']);
            assert.isNull(validator.error);
            validator.atLeastOneParameter(['a', 'c']);
            assert.isNull(validator.error);

            validator.atLeastOneParameter(['c']);
            assert.isDefined(validator.error);
            validator.error = null;

            validator.atLeastOneParameter(['c', 'd']);
            assert.isDefined(validator.error);
        });

        it('Build error response', () => {
            const validator = new InputValidator({'param': 1}, 'The-Type');
            validator.error = 'Some error';
            return validator.buildErrorResponse().then(args => {
                assert.isDefined(args);
                assert.strictEqual(args.param, 1);
                assert.isDefined(args.response);
                assert.strictEqual(args.response.error, 'Some error');
                assert.strictEqual(args.response.errorType, 'The-Type');
            });
        });

        it('Chaining calls', () => {
            const validator = new InputValidator({'param': 10});
            validator.isInteger('param');
            assert.isNull(validator.error);

            validator.isInsideInterval('param', 0, 5);
            assert.isDefined(validator.error);
            validator.error = null;

            validator.isInteger('param').isInsideInterval('param', 0, 5);
            assert.isDefined(validator.error);
        });
    });
});
