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

const aliasField = {
    initialRequest: {
        searchProducts: {
            total: {}
        }
    },
    transformRules: {
        searchProducts: {
            alias: "products"
        }
    },
    transformedRequest: {
        searchProducts: {
            total: {},
            __aliasFor: "products",
            __initialAlias: null
        }
    }
};

const aliasFieldAlias = {
    initialRequest: {
        myProducts: {
            __aliasFor: "searchProducts",
            total: {}
        }
    },
    transformRules: {
        searchProducts: {
            alias: "products"
        }
    },
    transformedRequest: {
        myProducts: {
            total: {},
            __aliasFor: "products",
            __initialAlias: "searchProducts"
        }
    }
};

const ignoreFields = {
    initialRequest: {
        searchProducts: {
            total: {},
            offset: {}
        }
    },
    transformRules: {
        searchProducts: {
            removers: ["total"]
        }
    },
    transformedRequest: {
        searchProducts: {
            offset: {}
        }
    }
};

const deleteEmptyObject = {
    initialRequest: {
        searchProducts: {
            total: {},
            results: {
                sku: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                removers: ["sku"]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            total: {}
        }
    }
};

const deleteConditionalEmptyObject = {
    initialRequest: {
        searchProducts: {
            results: {
                sku: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                removers: ["sku"]
            }
        }
    },
    transformedRequest: {}
};

const addSameLevelField = {
    initialRequest: {
        searchProducts: {
            results: {
                masterVariantId: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                adders: [{
                    when: "masterVariantId",
                    add: ["sku"]
                }]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                masterVariantId: {},
                sku: {}
            }
        }
    }
};

const addFromSublevel = {
    initialRequest: {
        searchProducts: {
            results: {
                masterVariant: {
                    id: {}
                }
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                adders: [{
                    when: "masterVariant.id",
                    add: ["sku"]
                }]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                masterVariant: {
                    id: {}
                },
                sku: {}
            }
        }
    }
};

const addToSublevel = {
    initialRequest: {
        searchProducts: {
            results: {
                masterVariantId: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                adders: [{
                    when: "masterVariantId",
                    add: ["masterVariant.id"]
                }]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                masterVariantId: {},
                masterVariant: {
                    id: {}
                }
            }
        }
    }
};

const addMultipleFields = {
    initialRequest: {
        searchProducts: {
            results: {
                masterVariantId: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                adders: [{
                    when: "masterVariantId",
                    add: ["sku", "masterVariant.id"]
                }]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                sku: {},
                masterVariantId: {},
                masterVariant: {
                    id: {}
                }
            }
        }
    }
};

const multipleAdders = {
    initialRequest: {
        searchProducts: {
            results: {
                masterVariantId: {},
                SpongeBob: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                adders: [
                    {
                        when: "masterVariantId",
                        add: ["sku", "masterVariant.id"]
                    },
                    {
                        when: "SpongeBob",
                        add: ["Patrick"]
                    }
                ]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                sku: {},
                masterVariantId: {},
                masterVariant: {
                    id: {}
                },
                SpongeBob: {},
                Patrick: {}
            }
        }
    }
};

const ignoresNotPresentAdders = {
    initialRequest: {
        searchProducts: {
            results: {
                id: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                adders: [{
                    when: "masterVariantId",
                    add: ["sku"]
                }]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                id: {}
            }
        }
    }
};

const moveAllFields = {
    initialRequest: {
        searchProducts: {
            results: {
                variants: {
                    id: {},
                    sku: {},
                    ghost: {
                        name: {}
                    }
                }
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                movers: [{
                    from: "variants",
                    to: "variants.variantsName"
                }]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                variants: {
                    variantsName: {
                        id: {},
                        sku: {},
                        ghost: {
                            name: {}
                        }
                    }
                }
            }
        }
    }
};

const moveSelectedField = {
    initialRequest: {
        searchProducts: {
            results: {
                variants: {
                    id: {},
                    sku: {},
                    ghost: {
                        name: {}
                    }
                }
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                movers: [{
                    from: 'variants',
                    fields: ["sku", "id"],
                    to: "moved"
                }]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                moved: {
                    id: {},
                    sku: {}
                },
                variants: {
                    ghost: {
                        name: {}
                    }
                }
            }
        }
    }
};

const moveWithoutFrom = {
    initialRequest: {
        searchProducts: {
            results: {
                id: {},
                sku: {},
                ghost: {
                    name: {}
                }
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                movers: [{
                    fields: ["sku", "id"],
                    to: "moved"
                }]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                moved: {
                    id: {},
                    sku: {}
                },
                ghost: {
                    name: {}
                }
            }
        }
    }
};

const deletesEmptyFieldAfterMove = {
    initialRequest: {
        searchProducts: {
            results: {
                id: {},
                sku: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            movers: [{
                from: "results",
                fields: ["sku", "id"],
                to: "moved"
            }]
        }
    },
    transformedRequest: {
        searchProducts: {
            moved: {
                id: {},
                sku: {}
            },
        }
    }
};

const deletesConditionalEmptyFieldAfterMove = {
    initialRequest: {
        searchProducts: {
            results: {
                product: {
                    fields: {
                        id: {},
                        sku: {}
                    }
                }
            }
        }
    },
    transformRules: {
        searchProducts: {
            movers: [{
                from: "results.product.fields",
                fields: ["sku", "id"],
                to: "moved"
            }]
        }
    },
    transformedRequest: {
        searchProducts: {
            moved: {
                id: {},
                sku: {}
            }
        }
    }
};

const addsArgs = {
    initialRequest: {
        searchProducts: {
            results: {
                id: {},
                sku: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            args: {
                text: "shorts"
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            __args: {
                text: "shorts"
            },
            results: {
                id: {},
                sku: {}
            }
        }
    }
};

const mergeArgs = {
    initialRequest: {
        searchProducts: {
            __args: {
                text: "meskwielt"
            },
            results: {
                id: {},
                sku: {}
            }
        }
    },
    transformRules: {
        searchProducts: {
            args: {
                limit: 20
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            __args: {
                text: "meskwielt",
                limit: 20
            },
            results: {
                id: {},
                sku: {}
            }
        }
    }
};

const inlineFragments = {
    initialRequest: {
        searchProducts: {
            results: {
                id: {},
                variants: {
                    id: {}
                }
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                inlineFragments: [
                    {
                        typeName: "configurableResult",
                        fields: ["variants"]
                    }
                ]
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                id: {},
                __on: [{
                    __typeName: "configurableResult",
                    variants: {
                        id: {}
                    }
                }]
            }
        }
    }
};

const allTransforms = {
    initialRequest: {
        searchProducts: {
            results: {
                sku: {},
                variants: {
                    id: {},
                    attributes: {
                        id: {}
                    }
                },
                masterVariantId: {},
                nonCustomField: {
                    __aliasFor: "customField"
                },
                anotherField: {
                    heySanta: {},
                    whatever: {}
                }
            }
        }
    },
    transformRules: {
        searchProducts: {
            results: {
                args: {
                    text: "argsText"
                },
                movers: [{
                    from: "variants",
                    to: "variantsPlace.variantsName"
                }],
                removers: ["customField", "masterVariantId"],
                alias: "items",
                adders: [{
                    when: "masterVariantId",
                    add: ["masterVariant", "masterVariant.id"]
                }],
                anotherField: {
                    removers: ["whatever"],
                    alias: "AnotherField",
                }
            }
        }
    },
    transformedRequest: {
        searchProducts: {
            results: {
                __args: {
                    text: "argsText"
                },
                sku: {},
                variantsPlace: {
                    variantsName: {
                        id: {},
                        attributes: {
                            id: {}
                        }
                    }
                },
                masterVariant: {
                    id: {}
                },
                __aliasFor: "items",
                anotherField: {
                    heySanta: {},
                    __aliasFor: "AnotherField",
                    __initialAlias: null
                },
                __initialAlias: null
            }
        }
    }
};

module.exports = {
    aliasField, aliasFieldAlias,
    ignoreFields, deleteEmptyObject, deleteConditionalEmptyObject,
    addSameLevelField, addFromSublevel, addToSublevel, addMultipleFields, multipleAdders, ignoresNotPresentAdders,
    moveAllFields, moveSelectedField, moveWithoutFrom, deletesEmptyFieldAfterMove, deletesConditionalEmptyFieldAfterMove,
    addsArgs, mergeArgs,
    inlineFragments, allTransforms
}