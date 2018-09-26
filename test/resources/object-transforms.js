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
    transformObject: {
        searchProducts: {
            alias: "products"
        }
    },
    actualObject: {
        searchProducts: {
            total: {}
        }
    },
    expectedObject: {
        searchProducts: {
            total: {},
            __aliasFor: "products",
            __cifName: null
        }
    }
};

const aliasFieldAlias = {
    transformObject: {
        searchProducts: {
            alias: "products"
        }
    },
    actualObject: {
        searchProducts: {
            __aliasFor: "searchProducts",
            total: {}
        }
    },
    expectedObject: {
        searchProducts: {
            total: {},
            __aliasFor: "products",
            __cifName: "searchProducts"
        }
    }
};

const ignoreFields = {
    transformObject: {
        searchProducts: {
            ignore: ["total"]
        }
    },
    actualObject: {
        searchProducts: {
            total: {},
            offset: {}
        }
    },
    expectedObject: {
        searchProducts: {
            offset: {}
        }
    }
};

const deleteEmptyObject = {
    transformObject: {
        searchProducts: {
            results: {
                ignore: ["sku"]
            }
        }
    },
    actualObject: {
        searchProducts: {
            total: {},
            results: {
                sku: {}
            }
        }
    },
    expectedObject: {
        searchProducts: {
            total: {}
        }
    }
};

const deleteConditionalEmptyObject = {
    transformObject: {
        searchProducts: {
            results: {
                ignore: ["sku"]
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                sku: {}
            }
        }
    },
    expectedObject: {}
};

const addSameLevelField = {
    transformObject: {
        searchProducts: {
            results: {
                adders: [{
                    for: "masterVariantId",
                    add: ["sku"]
                }]
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                masterVariantId: {}
            }
        }
    },
    expectedObject: {
        searchProducts: {
            results: {
                masterVariantId: {},
                sku: {}
            }
        }
    }
};

const addFromSublevel = {
    transformObject: {
        searchProducts: {
            results: {
                adders: [{
                    for: "masterVariant.id",
                    add: ["sku"]
                }]
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                masterVariant: {
                    id: {}
                }
            }
        }
    },
    expectedObject: {
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
    transformObject: {
        searchProducts: {
            results: {
                adders: [{
                    for: "masterVariantId",
                    add: ["masterVariant.id"]
                }]
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                masterVariantId: {}
            }
        }
    },
    expectedObject: {
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
    transformObject: {
        searchProducts: {
            results: {
                adders: [{
                    for: "masterVariantId",
                    add: ["sku", "masterVariant.id"]
                }]
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                masterVariantId: {}
            }
        }
    },
    expectedObject: {
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
    transformObject: {
        searchProducts: {
            results: {
                adders: [
                    {
                        for: "masterVariantId",
                        add: ["sku", "masterVariant.id"]
                    },
                    {
                        for: "SpongeBob",
                        add: ["Patrick"]
                    }
                ]
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                masterVariantId: {},
                SpongeBob: {}
            }
        }
    },
    expectedObject: {
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
    transformObject: {
        searchProducts: {
            results: {
                adders: [{
                    for: "masterVariantId",
                    add: ["sku"]
                }]
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                id: {}
            }
        }
    },
    expectedObject: {
        searchProducts: {
            results: {
                id: {}
            }
        }
    }
};

const moveAllFields = {
    transformObject: {
        searchProducts: {
            results: {
                moveFields: [{
                    from: "variants",
                    to: "variants.variantsName"
                }]
            }
        }
    },
    actualObject: {
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
    expectedObject: {
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
    transformObject: {
        searchProducts: {
            results: {
                moveFields: [{
                    from: 'variants',
                    fields: ["sku", "id"],
                    to: "moved"
                }]
            }
        }
    },
    actualObject: {
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
    expectedObject: {
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
    transformObject: {
        searchProducts: {
            results: {
                moveFields: [{
                    fields: ["sku", "id"],
                    to: "moved"
                }]
            }
        }
    },
    actualObject: {
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
    expectedObject: {
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

const deltesEmptyFieldAfterMove = {
    transformObject: {
        searchProducts: {
            moveFields: [{
                from: "results",
                fields: ["sku", "id"],
                to: "moved"
            }]
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                id: {},
                sku: {}
            }
        }
    },
    expectedObject: {
        searchProducts: {
            moved: {
                id: {},
                sku: {}
            },
        }
    }
};

const deltesConditionalEmptyFieldAfterMove = {
    transformObject: {
        searchProducts: {
            moveFields: [{
                from: "results.product.fields",
                fields: ["sku", "id"],
                to: "moved"
            }]
        }
    },
    actualObject: {
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
    expectedObject: {
        searchProducts: {
            moved: {
                id: {},
                sku: {}
            }
        }
    }
};

const addsArgs = {
    transformObject: {
        searchProducts: {
            args: {
                text: "shorts"
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                id: {},
                sku: {}
            }
        }
    },
    expectedObject: {
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
    transformObject: {
        searchProducts: {
            args: {
                limit: 20
            }
        }
    },
    actualObject: {
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
    expectedObject: {
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

const removesEmptyObjectAfterIgnore = {
    transformObject: {
        searchProducts: {
            ignore1: {
                ignore: ["id"]
            }
        }
    },
    actualObject: {
        searchProducts: {
            ignore1: {
                id: {}
            },
            field2: {}
        }
    },
    expectedObject: {
        searchProducts: {
            field2: {}
        }
    }
};


const inlineFragments = {
    transformObject: {
        searchProducts: {
            results: {
                inlineFragments: [
                    {
                        fragmentName: "configurableResult",
                        fields: ["variants"]
                    }
                ]
            }
        }
    },
    actualObject: {
        searchProducts: {
            results: {
                id: {},
                variants: {
                    id: {}
                }
            }
        }
    },
    expectedObject: {
        searchProducts: {
            results: {
                id: {},
                __on: [{
                    __fragmentName: "configurableResult",
                    variants: {
                        id: {}
                    }
                }]
            }
        }
    }
};

const allTransforms = {
    transformObject: {
        searchProducts: {
            results: {
                args: {
                    text: "argsText"
                },
                moveFields: [{
                    from: "variants",
                    to: "variantsPlace.variantsName"
                }],
                ignore: ["customField", "masterVariantId"],
                alias: "items",
                adders: [{
                    for: "masterVariantId",
                    add: ["masterVariant", "masterVariant.id"]
                }],
                anotherField: {
                    ignore: ["whatever"],
                    alias: "AnotherField",
                }
            }
        }
    },
    actualObject: {
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
    expectedObject: {
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
                    __cifName: null
                },
                __cifName: null
            }
        }
    }
};

module.exports = {
    aliasField, aliasFieldAlias,
    ignoreFields, deleteEmptyObject, deleteConditionalEmptyObject, removesEmptyObjectAfterIgnore,
    addSameLevelField, addFromSublevel, addToSublevel, addMultipleFields, multipleAdders, ignoresNotPresentAdders,
    moveAllFields, moveSelectedField, moveWithoutFrom, deltesEmptyFieldAfterMove, deltesConditionalEmptyFieldAfterMove,
    addsArgs, mergeArgs,
    inlineFragments, allTransforms
}