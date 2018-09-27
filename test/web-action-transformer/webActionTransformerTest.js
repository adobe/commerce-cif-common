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
const HttpResponse = require('../../src/web-action-transformer/http-response');
const HttpStatusCodes = require('http-status-codes');
const TransformerPipeline = require('../../src/web-action-transformer/transformer-pipeline').TransformerPipeline;
const ITransformerPipelineAction = require(
    '../../src/web-action-transformer/transformer-pipeline').ITransformerPipelineAction;
const ExceptionMapperTransformerPipelineAction =
    require('../../src/web-action-transformer/exception-mapper-transformer');
const PerformanceHeadersTransformerPipelineAction =
    require('../../src/web-action-transformer/performance-headers-transformer');
const CachingHeadersTransformerPipelineAction = require('../../src/web-action-transformer/caching-headers-transformer');
const transformer = require('../../src/web-action-transformer/index').main;
const sampleCommerceServiceSuccess = require('../resources/sample-commerce-service-success');
const sampleCommerceServiceError = require('../resources/sample-commerce-service-error');

describe('webActionTransformer', () => {

    describe('Unit tests', () => {

        describe('HttpResponse', () => {

            it('Constructor with empty body', () => {
                const httpResponse = new HttpResponse(undefined);
                assert.isUndefined(httpResponse.body);
                assert.isUndefined(httpResponse.error);
                assert.strictEqual(httpResponse.statusCode, 200);
                assert.isDefined(httpResponse.headers);
                assert.strictEqual(httpResponse.headers['Content-Type'], 'application/json');
            });

            it('Constructor with body', () => {
                const httpResponse = new HttpResponse({'response': 'yes'});
                assert.strictEqual(httpResponse.body, 'eyJyZXNwb25zZSI6InllcyJ9');
                assert.strictEqual(httpResponse.statusCode, 200);
            });

            it('Constructor with different status code', () => {
                const httpResponse = new HttpResponse({'error': 'yes'}, 404);
                assert.strictEqual(httpResponse.statusCode, 404);
            });

            it('Constructor with headers set', () => {
                const httpResponse = new HttpResponse({'error': 'yes'}, 200, {'some-header': 'yes'});
                assert.isDefined(httpResponse.headers);
                assert.strictEqual(httpResponse.headers['Content-Type'], 'application/json');
                assert.strictEqual(httpResponse.headers['some-header'], 'yes');
            });

            it('set body', () => {
                const httpResponse = new HttpResponse({'response': 'yes'});
                assert.strictEqual(httpResponse.body, 'eyJyZXNwb25zZSI6InllcyJ9');
                httpResponse.setBody({'response': 'no'});
                assert.strictEqual(httpResponse.body, 'eyJyZXNwb25zZSI6Im5vIn0=');
            });

            it('toJson', () => {
                const httpResponse = new HttpResponse({'response': 'yes'});
                httpResponse.error = new Error();
                const json = httpResponse.toJson();
                assert.isDefined(json);
                assert.strictEqual(json.body, httpResponse.body);
                assert.strictEqual(json.statusCode, httpResponse.statusCode);
                assert.deepEqual(json.headers, httpResponse.headers);
                assert.isUndefined(json.error);
            });
        });

        describe('TransformerPipeline', () => {
            it('Success response - no transformer', () => {
                const transformer = new TransformerPipeline();
                const transformerInput = {
                    'response': {
                        'body': {
                            'such-response': 'much-wow'
                        }
                    },
                    'something-else': 'I am here'
                };

                const response = transformer.perform(transformerInput);
                assert.isDefined(response);
                assert.isUndefined(response['something-else']);
                assert.isDefined(response.body);
                assert.isDefined(response.headers);
                assert.strictEqual(response.statusCode, 200);
            });

            it('Created response - no transformer', () => {
                const transformer = new TransformerPipeline();
                const transformerInput = {
                    'response': {
                        'body': {
                        },
                        'statusCode': 201
                    },
                };

                const response = transformer.perform(transformerInput);
                assert.isDefined(response);
                assert.strictEqual(response.statusCode, 201);
            });

            it('Error response - no transformer', () => {
                const transformer = new TransformerPipeline();
                const transformerInput = {
                    'response': {
                        'error': new Error()
                    },
                    'something-else': 'I am here'
                };

                const response = transformer.perform(transformerInput);
                assert.isDefined(response);
                assert.isDefined(response.error);
                assert.isUndefined(response['something-else']);
            });

            it('Unknown input', () => {
                const transformer = new TransformerPipeline();
                const transformerInput = {
                    'unexpected-input': {
                        'hello': 'world'
                    }
                };

                const response = transformer.perform(transformerInput);
                assert.isDefined(response);
                assert.strictEqual(response.statusCode, 500);
            });

            it('Pipeline steps', () => {
                // Prepare
                const transformer = new TransformerPipeline();
                const transformerInput = {
                    'response': {
                        'body': {
                            'such-response': 'much-wow'
                        },
                        'headers': {
                            'something': 'First header'
                        }
                    },
                    'something-else': 'I am here'
                };

                class ActionA extends ITransformerPipelineAction {
                    //eslint-disable-next-line no-unused-vars
                    transform(httpResponse, resultFromOwSequence) {
                        httpResponse.setBody({'from-transformer': 'yes'});
                        httpResponse.statusCode = 207;
                        return httpResponse;
                    }
                }

                class ActionB extends ITransformerPipelineAction {
                    transform(httpResponse, resultFromOwSequence) {
                        httpResponse.headers['something-else'] = resultFromOwSequence['something-else'];
                        return httpResponse;
                    }
                }

                transformer.pushTransformer(new ActionA());
                transformer.pushTransformer(new ActionB());

                // Perform
                const response = transformer.perform(transformerInput);

                // Asert
                assert.isDefined(response);
                assert.strictEqual(response.body, 'eyJmcm9tLXRyYW5zZm9ybWVyIjoieWVzIn0=');
                assert.strictEqual(response.statusCode, 207);
                assert.strictEqual(response.headers['something-else'], 'I am here');
                assert.strictEqual(response.headers['something'], 'First header');
            });

        });

        describe('ExceptionMapperTransformerPipelineAction', () => {
            const transformerAction = new ExceptionMapperTransformerPipelineAction();

            it('Response does not contain error', () => {
                const fromOw = {
                    'response': {
                        'body': {
                            'such-response': 'much-wow'
                        }
                    },
                    'something-else': 'I am here'
                };
                const httpResponse = new HttpResponse(fromOw.response.body, 200, fromOw.headers);

                transformerAction.transform(httpResponse, fromOw);

                // No error, then status code remains the same.
                assert.strictEqual(httpResponse.statusCode, 200);
            });

            const errorNameToStatusCodeMap = {
                'InvalidArgumentError': 400,
                'MissingPropertyError': 400,
                'CommerceServiceResourceNotFoundError': 404,
                'CommerceServiceBadRequestError': 400,
                'CommerceServiceForbiddenError': 403,
                'SomethingThatIsNotMapped': 500
            };

            for (let errorName in errorNameToStatusCodeMap) {
                it(`Map ${errorName} to ${errorNameToStatusCodeMap[errorName]}`, () => {
                    const httpResponse = new HttpResponse({});
                    httpResponse.error = {'name': errorName, 'cause': {'message': 'error'}};
                    transformerAction.transform(httpResponse, {});
                    assert.strictEqual(httpResponse.statusCode, errorNameToStatusCodeMap[errorName]);
                    let body = JSON.parse(Buffer.from(httpResponse.body, 'base64'));
                    assert.equal(body.reason, 'error');
                    if (errorName === 'SomethingThatIsNotMapped') {
                        assert.isTrue(body.message.startsWith('UnexpectedError'));
                    } else {
                        assert.isTrue(body.message.startsWith(errorName));
                    }
                });
            }

            it('Error type is passed to ErrorResponse', () => {
                const fromOw = {
                    'response': {
                        'errorType': 'sample-error-type'
                    }
                };
                const httpResponse = new HttpResponse({});
                httpResponse.error = {'name': 'SomeError', 'cause': {'message': 'error'}};

                transformerAction.transform(httpResponse, fromOw);

                // Decode base64 from response body and parse it as JSON.
                const responseBody = JSON.parse(Buffer.from(httpResponse.body, 'base64').toString());
                assert.strictEqual(responseBody.type, 'sample-error-type');
            });
        });

        describe('CachingHeadersTransformerPipelineAction', () => {
            const transformAction = new CachingHeadersTransformerPipelineAction();

            it('cacheControl set from previous action', () => {
                const httpResponse = new HttpResponse({});
                const fromOw = {'cacheControl': 'I am here'};
                transformAction.transform(httpResponse, fromOw);
                assert.strictEqual(httpResponse.headers['Cache-Control'], 'I am here');
            });

            it('cachetime set from previous action', () => {
                const httpResponse = new HttpResponse({});
                const fromOw = {'cachetime': 111};
                transformAction.transform(httpResponse, fromOw);
                assert.strictEqual(httpResponse.headers['Cache-Control'], 'public, max-age=111');

                assert.isDefined(httpResponse.headers['Expires']);
                const expectedExpires = new Date(Date.now() + 111000).getTime();
                const actualExpires = Date.parse(httpResponse.headers['Expires']);
                assert.isTrue(Math.abs(actualExpires - expectedExpires) < 1000);
            });

            it('sets vary header when there is none set from a previous action', () => {
                const httpResponse = new HttpResponse({});
                transformAction.transform(httpResponse, {});
                assert.strictEqual(httpResponse.headers['Vary'], 'Accept-Language');
            });

            it('copies the vary header from a previous action', () => {
                const httpResponse = new HttpResponse({});
                const fromOw = {'vary': 'I am here'};
                transformAction.transform(httpResponse, fromOw);
                assert.strictEqual(httpResponse.headers['Vary'], 'I am here');
            });

            it('http status code NOT FOUND', () => {
                const httpResponse = new HttpResponse({});
                const fromOw = {'cachetime': 111};
                httpResponse.statusCode = HttpStatusCodes.NOT_FOUND;
                transformAction.transform(httpResponse, fromOw);
                assert.strictEqual(httpResponse.statusCode, HttpStatusCodes.NOT_FOUND);
                assert.strictEqual(httpResponse.headers['Cache-Control'], 'no-cache, no-store, no-transform, must-revalidate');
            });

            it('http status code BAD REQUEST', () => {
                const httpResponse = new HttpResponse({});
                const fromOw = {'cachetime': 111};
                httpResponse.statusCode = HttpStatusCodes.BAD_REQUEST;
                transformAction.transform(httpResponse, fromOw);
                assert.strictEqual(httpResponse.statusCode, HttpStatusCodes.BAD_REQUEST);
                assert.strictEqual(httpResponse.headers['Cache-Control'], 'no-cache, no-store, no-transform, must-revalidate');
            });

            it('http status code not mapped', () => {
                const httpResponse = new HttpResponse({});
                const fromOw = {'cachetime': 111};
                httpResponse.statusCode = 999;
                transformAction.transform(httpResponse, fromOw);
                assert.strictEqual(httpResponse.statusCode, 999);
                assert.isUndefined(httpResponse.headers['Cache-Control']);
                assert.isUndefined(httpResponse.headers['Expires']);
            });
        });

        describe('PerformanceHeadersTransformerPipelineAction', () => {
            const transformerAction = new PerformanceHeadersTransformerPipelineAction();

            it('Performance headers are copied', () => {
                const httpResponse = new HttpResponse({});
                const fromOw = {
                    '__ow_headers': {
                        'perf-header1': 'value1',
                        'something-else': 'who cares',
                        'perf-header2': 'value2'
                    }
                };

                transformerAction.transform(httpResponse, fromOw);
                assert.strictEqual(httpResponse.headers['perf-header1'], 'value1');
                assert.strictEqual(httpResponse.headers['perf-header2'], 'value2');
                assert.isUndefined(httpResponse.headers['something-else']);
            });
        });

        describe('pipeline transformers', () => {

            it('Performance, Cache headers are copied', () => {
                let response = transformer(sampleCommerceServiceSuccess);
                assert.strictEqual(response.headers['Cache-Control'], 'public, max-age=300');
                assert.isDefined(response.headers['Perf-Ow-Seq-In-']);
                assert.isDefined(response.headers['Perf-Ow-Seq-End-12345']);
            });

            it('Error headers are copied', () => {
                let response = transformer(sampleCommerceServiceError);
                assert.strictEqual(response.statusCode, 404);
                assert.strictEqual(response.headers['Cache-Control'], 'no-cache, no-store, no-transform, must-revalidate');
            });

        });

    });
});
