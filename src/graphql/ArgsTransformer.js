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
 * Used for transforming arguments of one GraphQL schema into another.
 * 
 * The ArgsTransformer class transforms arguments of all objects as defined in the argsFunctions.
 */
class ArgsTransformer {

    /**
     * @param {object}    argsFunctions            of form {argument name: handler function}
     * @param {object}    [checkArgsOnFields]      of form {field name, [check arguments]} for those fields,
     *                                             the arguments in the array will be called in any case
     * @param {string}    [argsFieldName = '__args'] name of the arguments property ('__args' by default)
     * 
     */
    constructor(argsFunctions, checkArgsOnFields = {}, argsFieldName = '__args') {
        this.arguments = argsFunctions;
        this.fields = checkArgsOnFields;
        this.args = argsFieldName;
    }

    /**
     * Transforms arguments as defined in the argsFunctions object
     * 
     * @param {object} obj          object of which to transform the arguments
     * @param {string} [objName]    name of the object (root), in case of checkArgsOnFields
     */
    transform(obj, objName = '') {
        let args = obj[this.args] ? JSON.parse(JSON.stringify(obj[this.args])) : {};      //check if the object has an arguments property               
        Object.keys(args).forEach(a => {
            let f = this.arguments[a];              //transform argument if declared
            if (f) {
                f(args);
            }
        });
        if (objName && this.fields[objName]) {       //check absent enforced arguments
            this.fields[objName].forEach(a => {
                // only execute if not already treated
                if (!obj[this.args][a]) {
                    this.arguments[a](args);
                }
            });
        }
        if (Object.keys(args).length !== 0) {
            obj[this.args] = args;
        }
    }

    /**
     * Transforms arguments of object and its sub properties as well
     * 
     * @param {object} obj      to transform recursively
     * @param {string} objName  name of the object (root), in case of checkArgsOnFields 
     */
    transformRecursive(obj, objName = '') {
        Object.keys(obj).forEach(prop => {
            if (obj[prop] && typeof obj[prop] === 'object') { //null could also be an object
                let field = obj[prop].__cifName || obj[prop].__aliasFor || prop;
                this.transformRecursive(obj[prop], field);
            }
        });
        this.transform(obj, objName);
    }
}

module.exports = ArgsTransformer;