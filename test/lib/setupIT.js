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

module.exports.setup = function () {

    let env = {};
    env.slow = 10000;
    env.timeout = 30000;

    env.apihost = process.env.WSK_API_HOST;
    env.namespace = process.env.CORE_WSK_NAMESPACE;
    env.api_key = process.env.CORE_WSK_AUTH_STRING;
    env.ignore_certs = true;

    env.actionPrefix = `/${env.namespace}/web-action-transformer@latest`;
    env.blocking = true;
    env.result = true;

    return env;

};
