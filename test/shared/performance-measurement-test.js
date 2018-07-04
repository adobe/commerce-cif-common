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
const sinon = require('sinon');
const PerformanceMeasurement = require('../../src/shared/performance-measurement.js');

describe('Performance Measurement', () => {

    describe('Unit tests', () => {

        afterEach(() => {
            sinon.reset();
            sinon.restore();
        });

        it('decorates an OpenWhisk action', () => {
            let action = sinon.spy();

            let wrapped = PerformanceMeasurement.decorateActionForSequence(action);
            assert.notDeepEqual(wrapped, action, "Action was not wrapped");

            wrapped();
            assert.isTrue(action.calledOnce);
        });

        it('adds a start sequence header to a wrapped action', () => {
            sinon.spy(PerformanceMeasurement, "startSequence");
            let action = sinon.spy();
            let wrapped = PerformanceMeasurement.decorateActionForSequence(action);
            wrapped({});

            assert.deepEqual(PerformanceMeasurement.startSequence.firstCall.args[0], {seqStart: true});
            assert.isTrue(PerformanceMeasurement.startSequence.calledOnce);
        });

        it('adds a start sequence header', () => {
            let args = {
                __ow_headers: {
                    [PerformanceMeasurement.const.PERF_ACTIVATE]: "YES",
                    [PerformanceMeasurement.const.PERF_ACTION_ID]: "my-id"
                }
            };
            console.log(PerformanceMeasurement.startSequence);
            PerformanceMeasurement.startSequence(args);
            let expectedHeaderName = PerformanceMeasurement.const.PERF_SEQ_START + '-my-id';
            assert.isDefined(args.response.headers[expectedHeaderName]);
            assert.equal(args.backendRequestCount, 0);
        });

        it('adds an end sequence header with lower case headers', () => {
            let args = {
                __ow_headers: {
                    [PerformanceMeasurement.const.PERF_ACTIVATE.toLowerCase()]: "YES",
                    [PerformanceMeasurement.const.PERF_ACTION_ID.toLowerCase()]: "my-id"
                }
            };
            PerformanceMeasurement.endSequence(args);
            let expectedHeaderName = PerformanceMeasurement.const.PERF_SEQ_END + '-my-id';
            assert.isDefined(args.response.headers);
            assert.isDefined(args.response.headers[expectedHeaderName]);
        });

        it('does not add a header if the performance header is not set', () => {
            let args = {__ow_headers: {}};
            PerformanceMeasurement.endSequence(args);
            assert.isUndefined(args.headers);
        });

        it('is not active if performance headers are not set', () => {
            let result = PerformanceMeasurement.isActive({});
            assert.isFalse(result);
        });

        it('adds a start backend request header', () => {
            let args = {
                [PerformanceMeasurement.const.PERF_ACTIVATE.toLowerCase()]: "YES"
            }
            PerformanceMeasurement.startBackendRequest(args, 0, "my-id", "http://host");
            
            let expectedTimeHeaderName = PerformanceMeasurement.const.PERF_BACKEND_REQ_OUT + '-my-id-0';
            assert.isDefined(args.response.headers);
            assert.isDefined(args.response.headers[expectedTimeHeaderName]);

            let expectedUrlHeaderName = PerformanceMeasurement.const.PERF_BACKEND_REQ_URL + '-my-id-0';
            assert.isDefined(args.response.headers[expectedUrlHeaderName]);
        });

        it('adds an end backend request header', () => {
            let args = {
                [PerformanceMeasurement.const.PERF_ACTIVATE.toLowerCase()]: "YES"
            }
            PerformanceMeasurement.endBackendRequest(args, 0, "my-id");
            
            let expectedTimeHeaderName = PerformanceMeasurement.const.PERF_BACKEND_REQ_IN + '-my-id-0';
            assert.isDefined(args.response.headers);
            assert.isDefined(args.response.headers[expectedTimeHeaderName]);
        });

        it('wraps a node rest client', () => {
            sinon.stub(PerformanceMeasurement, 'isActive').callsFake(() => { return true });
            sinon.spy(PerformanceMeasurement, 'startBackendRequest');
            sinon.spy(PerformanceMeasurement, 'endBackendRequest');

            let spy = sinon.spy((url, parameter, callback) => { callback(); });
            let client = {
                'get': spy
            }

            client = PerformanceMeasurement.decorateNodeRestClient(client, {__ow_headers: {}});
            client.get("url", "parameters", () => {});
            assert.isTrue(spy.calledOnce);
            assert.isTrue(PerformanceMeasurement.startBackendRequest.calledOnce);
            assert.isTrue(PerformanceMeasurement.endBackendRequest.calledOnce);
        });

        it('skips wrapping a node rest client if performance headers are not set', () => {
            sinon.stub(PerformanceMeasurement, 'isActive').callsFake(() => { return false });
            let originalMethod = () => {};
            let client = {
                'get': originalMethod
            }
            client = PerformanceMeasurement.decorateNodeRestClient(client, {});
            assert.deepEqual(client.get, originalMethod);
        });

    });
});
