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
 * The ObjectMapper takes a filterAndMapper object as an argument and passes the root fields
 * of the original request to the rootField handler function of the object.
 */
class ObjectMapper {

    /**
     * 
     * @param { object } filterAndMapper 
     */
    constructor(filterAndMapper) {
        this.filterAndMapper = filterAndMapper;
    }

    /**
     * This function is responsible for delegating the rootFields to the right mapper
     * 
     * @param {object} originalObject   the original graphQL source in object format
     * @param {object} dataObject       the result object from which to extract the data
     * 
     * @return {object}                 original query with data filled in as defined in filterAndMapper object
     */
    map(originalObject, dataObject) {
        let result = {};
        Object.keys(originalObject).map(key => {
            let field = originalObject[key].__aliasFor || key;
            //don't pass originalObject[key] directly since it could need data from another rootfield
            result[key] = this.filterAndMapper[field](originalObject, dataObject, key);
        });
        return result;
    }
}

module.exports = ObjectMapper;