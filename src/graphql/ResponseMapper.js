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

/**
 * Transforms the response of a transformed GraphQL request into a response that will match the
 * data requested in the original request.
 */
class ResponseMapper {

    /**
     * @param { object } mappers The mapper functions used to transform the response
     */
    constructor(mappers) {
        this.mappers = mappers;
    }

    /**
     * For each root field of the original GraphQL request, this function will call (if any) the 
     * mapper function that will transform the dataObject into a response that matches the data requested
     * in the original request.
     * 
     * @param {object} originalRequest   The original graphQL request in Javascript object format
     * @param {object} dataObject        The object response from which to extract the data
     * 
     * @return {object}                  The tranformed response that will match the original request
     */
    map(originalRequest, dataObject) {
        let result = {};
        Object.keys(originalRequest).map(key => {
            let field = originalRequest[key].__aliasFor || key;
            //don't pass originalObject[key] directly since it could need data from another rootfield
            result[key] = this.mappers[field](originalRequest, dataObject, key);
        });
        return result;
    }
}

module.exports = ResponseMapper;