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
 * The ResponseMapper takes an object with mapper functions and delegates
 * the own properties of an object to the corresponding mapper function.
 */
class ResponseMapper {

    /**
     * 
     * @param { object } mappers 
     */
    constructor(mappers) {
        this.mappers = mappers;
    }

    /**
     * This function is responsible for delegating the rootFields to the right mapper
     * 
     * @param {object} originalRequest   the original graphQL request in object format
     * @param {object} dataObject        object from which to extract the data
     * 
     * @return {object}                  object with requested data
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