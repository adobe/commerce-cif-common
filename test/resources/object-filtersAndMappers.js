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

const noTransformsObject = {
    filterAndMappers: {
        searchProducts: (originalObject, resultsObject, fieldName) => {
            let searchProducts = originalObject[fieldName];
            let products = resultsObject[fieldName];
            if (searchProducts.total) {
                searchProducts.total = products.total;
            }
            return searchProducts;
        }
    },
    originalObject: {
        searchProducts: {
            total: {}
        }
    },
    resultsObject: {
        searchProducts: {
            total: 50
        }
    },
    expectedObject: function() {
        return { searchProducts: this.filterAndMappers.searchProducts(this.originalObject, this.resultsObject, "searchProducts") };
    }
};

const aliasObject = {
    filterAndMappers: {
        searchProducts: (originalObject, resultsObject, fieldName) => {
            let searchProducts = originalObject[fieldName];
            let products = resultsObject[fieldName];
            if (searchProducts.total) {
                searchProducts.total = products.total;
            }
            return searchProducts;
        }
    },
    originalObject: {
        products: {
            __aliasFor: "searchProducts",
            total: {}
        }
    },
    resultsObject: {
        products: {
            total: 50
        }
    },
    expectedObject: function() {
        return { products: this.filterAndMappers.searchProducts(this.originalObject, this.resultsObject, "products") };
    }
};

const multipleAliasForSameField = {
    filterAndMappers: {
        searchProducts: (originalObject, resultsObject, fieldName) => {
            let searchProducts = originalObject[fieldName];
            let products = resultsObject[fieldName];
            if (searchProducts.total) {
                searchProducts.total = products.total;
            }
            return searchProducts;
        }
    },
    originalObject: {
        products: {
            __aliasFor: "searchProducts",
            total: {}
        },
        products2: {
            __aliasFor: "searchProducts",
            total: {}
        }
    },
    resultsObject: {
        products: {
            total: 50
        },
        products2: {
            total: 50
        }
    },
    expectedObject: function() {
        return { 
            products: this.filterAndMappers.searchProducts(this.originalObject, this.resultsObject, "products"),
            products2: this.filterAndMappers.searchProducts(this.originalObject, this.resultsObject, "products2")
        }
    }
};



module.exports = { noTransformsObject, aliasObject, multipleAliasForSameField };