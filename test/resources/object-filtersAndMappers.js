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

const simpleFieldsMapper = {
    mappers: {
        searchProducts: (originalRequest, dataObject, fieldName) => {
            let searchProducts = originalRequest[fieldName];
            let products = dataObject[fieldName];
            let response = {};
            if (searchProducts.total) {
                response.total = products.total;
            }
            return response;
        }
    },

    originalRequest: {
        searchProducts: {
            total: {}
        }
    },

    dataObject: {
        searchProducts: {
            total: 50
        }
    },

    expectedResponse: {
        searchProducts: {
            total: 50
        }
    }
};

const aliasMapper = {
    mappers: {
        searchProducts: (originalRequest, dataObject, fieldName) => {
            let searchProducts = originalRequest[fieldName];
            let products = dataObject[fieldName];
            let response = {};
            if (searchProducts.total) {
                response.total = products.total;
            }
            return response;
        }
    },

    originalRequest: {
        products: {
            __aliasFor: "searchProducts",
            total: {}
        }
    },

    dataObject: {
        products: {
            total: 50
        }
    },
    
    expectedResponse: {
        products: {
            total: 50
        }
    }
};

const multipleAliasForSameField = {
    mappers: {
        searchProducts: (originalRequest, dataObject, fieldName) => {
            let searchProducts = originalRequest[fieldName];
            let products = dataObject[fieldName];
            let response = {};
            if (searchProducts.total) {
                response.total = products.total;
            }
            return response;
        }
    },

    originalRequest: {
        products: {
            __aliasFor: "searchProducts",
            total: {}
        },
        products2: {
            __aliasFor: "searchProducts",
            total: {}
        }
    },

    dataObject: {
        products: {
            total: 50
        },
        products2: {
            total: 50
        }
    },

    expectedResponse: {
        products: {
            total: 50
        },
        products2: {
            total: 50
        }
    },
};



module.exports = { simpleFieldsMapper, aliasMapper, multipleAliasForSameField };