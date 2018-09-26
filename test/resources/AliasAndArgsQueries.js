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

let simpleAlias = {
    query: `{
        dogs {
            dogsName: name
            age
        }
    }`,
    expectedObject: {
        dogs: {
            dogsName: {
                __aliasFor: "name"
            },
            age: {}
        }
    }
};

let variousRootFieldAlias = {
    query: `{
        dogNames: dogs {
            name
        }
        dogAges: dogs {
            age
        }
    }`,
    expectedObject: {
        dogNames: {
            __aliasFor: "dogs",
            name: {},
        },
        dogAges: {
            __aliasFor: "dogs",
            age: {},
        }
    }
};

let rootFieldArgs = {
    query: `{
        search(text: "dogs") {
            name
        }
    }`,
    expectedObject: {
        search: {
            __args: {
                text: "dogs"
            },
            name: {}
        }
    }
};

let fieldArgs = {
    query: `{
        dogs {
            name(format: "capitalLetters")
            age
        }
    }`,
    expectedObject: {
        dogs: {
            name: {
                __args: {
                    format: "capitalLetters"
                }
            },
            age: {}
        }
    }
};

let nestedArgs = {
    query: `{
        search(filter: {animal: "dog"}){
            name
        }
    }`,
    expectedObject: {
        search: {
            __args: {
                filter: {
                    animal: "dog"
                }
            },
            name: {}
        }
    }
};

let arrayArgs = {
    query: `{
        search(filter: ["dogs", "cats"]){
            name
        }
    }`,
    expectedObject: {
        search: {
            __args: {
                filter: ["dogs", "cats"]
            },
            name: {}
        }
    }
};

let inlineFrags = {
    query: `{
        search{
            ... on ConfigSearch {
                id
            },
            label
        }
    }`,
    expectedObject: {
        search: {
            __on: [{
                __fragmentName: "ConfigSearch",
                id: {}
            }],
            label: {}
        }
    }
};

let mergeRecursive = {
    obj1: {
        search: {
            overwrite: "toOverwrite",
            __aliasFor: "textSearch",
            something1: {
                subSomething1: {}
            }
        }
    },
    obj2: {
        search: {
            overwrite: "overwritten",
            __doNotMerge: "shouldn't be merged",
            something1: {
                subSomething2: {}
            },
            otherField: {}
        }
    },
    expectedObject: {
        search: {
            overwrite: "overwritten",
            __aliasFor: "textSearch",
            something1: {
                subSomething1: {},
                subSomething2: {}
            },
            otherField: {}
        }
    }
};

let backToGraphql = {
    object: {
        rootField: {
            __args: {
                arg1: "firstArgument",
                arg2: "secondArgument"
            },
            field1: {},
            nestedField: {
                field2: {
                    __aliasFor: "inNestedObject"
                }
            }
        }
    },
    expectedQuery: '{ rootField (arg1: "firstArgument", arg2: "secondArgument") { field1 nestedField { field2: inNestedObject } } }'
};

module.exports =
    {
        simpleAlias, variousRootFieldAlias,
        rootFieldArgs, fieldArgs, nestedArgs, arrayArgs,
        inlineFrags, mergeRecursive, backToGraphql
    };