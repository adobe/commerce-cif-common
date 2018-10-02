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

const recursiveMerge = require('./utils').recursiveMerge;

/**
 * This class transforms a Javascript representation of a GraphQL query based on a set of transformation rules.
 * The following rules are currently supported:
 * * adders: an array of 'adder' rules, where each 'adder' defines the 'adder.add' array of fields that will be added if the
 * 'adder.when' field is present (of the object itself or its sub-objects, depending how it is defined). If 'adder.when' is missing,
 * all the 'adder.add' fields will be added.
 * 
 * * removers: an array of fields that will be removed from the query. When a field is removed, its parent object will also
 * be removed if it becomes empty because of the removal operation. 
 * 
 * * movers: an array of 'mover' rules, when each 'mover' defines the 'mover.from' root location from where the 'mover.fields' should be moved,
 * and the 'mover.to' location where fields should be moved. If 'mover.fields' is not specified, allfields are moved. If 'mover.from' is not
 * specified, the entire object (where the mover is defined) is moved.
 * 
 * * alias: specifies the GraphQL alias that should be used when requesting a field.
 * 
 * * args: defines an array of arguments that should be added to a field when transforming the query.
 * 
 * * inlineFragments: adds inline fragments to the object if any of the inline fragment field is present.
 */
class ObjectTransformer {

    /**
     * @param {object} transformRules     Object representation of graphql schema containing the transformation rules.
     */
    constructor(transformRules) {
        this.transformRules = transformRules || {};
    }

    /**
     * Transforms/modifies the toTransform object according to the transformRules
     * 
     * 1. adders
     * 2. transforms on subobjects
     * 3. args
     * 4. ignore
     * 5. move
     * 6. alias
     * 7. inlineFragments
     * 
     * @param {object} toTransform         object to be transformed
     * 
     * @returns {boolean} indicating if the object results in an empty object (should never be the case for main query)
     */
    transform(toTransform) {
        this._transform(toTransform, this.transformRules);
    }

    /**
     * @private 
     */
    _transform(toTransform, transformRules) {
        let transforms = transformRules || this.transformRules;

        if (transforms.adders) {
            this._addFields(toTransform, transforms.adders);
        }

        Object.keys(toTransform).forEach(key => {
            let field = toTransform[key].__aliasFor || key;
            if (transforms[field] && this._transform(toTransform[key], transforms[field])) {
                delete toTransform[field];
            }
        });

        if (transforms.args) {
            let args = toTransform.__args || {};
            args = Object.assign(args, transforms.args)
            toTransform.__args = args;
        }
        if (transforms.removers) {
            this._removeFields(toTransform, transforms.removers);
        }
        if (transforms.movers) {
            this._moveFields(toTransform, transforms.movers);
        }
        if (transforms.alias) {
            toTransform.__initialAlias = toTransform.__aliasFor || null;
            toTransform.__aliasFor = transforms.alias;
        }
        if (transforms.inlineFragments) {
            this._addInlineFragments(toTransform, transforms.inlineFragments);
        }

        return Object.keys(toTransform).length === 0;
    }

    /**
     * @private
     * 
     * Adds inlineFragments to the object
     * 
     * @param {object} object 
     * @param {object[]} inlineFrags
     * @param {string} inlineFrags[].typeName      name of the inline fragment type
     * @param {string[]} inlineFrags[].fields      fields that belong into the inline fragment
     */
    _addInlineFragments(object, inlineFrags) {
        object.__on = [];
        inlineFrags.forEach(inf => {
            // for loop because one cannot break out of forEach
            for (let fieldName of inf.fields) {
                let field = this._includesField(object, fieldName)
                if (field) {
                    let moveFields = [{
                        fields: inf.fields,
                        to: "tempInFrag"
                    }];
                    this._moveFields(object, moveFields);
                    object.__on.push(
                        Object.assign({ __typeName: inf.typeName }, object.tempInFrag)
                    );
                    delete object.tempInFrag;
                    return; //to next inlineFragment
                }
            }
        });
        if (object.__on.length === 0) {
            delete object.__on;
        }
    }

    /**
     * @private
     * 
     * For each adder:
     * adds all the fields in the 'add' array to the object if any of 'when' is present or completely omitted
     * 
     * @param {object} object                       object in which to add fields
     * @param {object[]} adders                     array with all the specified adders for the object
     * @param {string | string[]} [adders[].when]   check for presence of fields
     * @param {string | string[]} adders[].add      add fields if any when field is present
     */
    _addFields(object, adders) {
        adders.forEach(adder => {
            let forFields = Array.isArray(adder.when) ? adder.when : [adder.when];
            for (let forField of forFields) { // for loop because cannot break out of forEach
                if (this._addFunction(forField, adder.add, object)) {
                    return; //straight to next adder
                }
            }
        });
    }

    /**
     * @private
     * 
     * @param {string | undefined} forField     check for presence of this field
     * @param {string | string[]}  add          possibly add this fields
     * @param {object} object                   check and add in this object
     * 
     * @returns {boolean}                       indicating whether something was added or not
     */
    _addFunction(forField, add, object) {
        let pathFor = forField ? forField.split('.') : [];
        //check subfields recursively
        let fieldObj = this._checkAndGetSubField(object, pathFor);
        if (fieldObj) {
            let adders = Array.isArray(add) ? add : [add];
            adders.forEach(toAdd => {
                let path = toAdd.split('.');
                this._addField(object, path);
            });
            return true;
        }
        return false;
    }

    /**
     * @private
     * 
     * adds path to the obj
     * 
     * @param {object} object
     * @param {string[]} path
     * 
     * @returns {object}        leaf object of path
     */
    _addField(object, path) {
        if (path.length > 0) {
            //ignore the fact that this overwrites a field with alias of another fieldname
            object[path[0]] = object[path[0]] || {};
            return this._addField(object[path.shift()], path);
        }
        return object;
    }

    /**
     * @private
     * 
     * checks if the path exists in object
     * 
     * @param {object} object
     * @param {string[]} path   
     * @param {boolean} [del=false]   whether to delete the leaf object when found (used for moving fields)
     * 
     * @returns {object|undefined}    leaf field if found
     */
    _checkAndGetSubField(object, path, del = false) {
        if (path.length === 0) {
            return object;
        }
        let field = this._includesField(object, path[0]);
        if (field && path.length > 1) {
            path.shift();
            return this._checkAndGetSubField(object[field], path);
        }
        let fieldObject = field ? object[field] : undefined;
        if (del && field) {
            delete object[field];
        }
        return fieldObject;
    }

    /**
     * @private
     * 
     * ignores all the specified fields
     * 
     * @param {object}             object
     * @param {string|string[]}    ignore   fields to be ignored
     */
    _removeFields(object, ignore) {
        let ignoreFields = Array.isArray(ignore) ? ignore : [ignore];
        ignoreFields.forEach(toIgnore => {
            let field = this._includesField(object, toIgnore);
            if (field) {
                delete object[field];
            }
        });
    }

    /**
     * @private
     */
    _checkAllNames(initialAlias, ctAlias, fieldName) {
        return (!initialAlias && !ctAlias || initialAlias === null || !initialAlias && ctAlias === fieldName);
    }

    /**
     * @private
     * 
     * checks if the object has has the fieldName property or an alias to it
     * 
     * @param {object} object
     * @param {string} fieldName
     * 
     * @returns {string|undefined} name of the fieldName property if present
     */
    _includesField(object, fieldName) {
        //shortCut for non-alias fields
        if (object[fieldName] && this._checkAllNames(object[fieldName].__initialAlias, object[fieldName].__aliasFor, fieldName)) {
            return fieldName;
        }
        //cannot use forEach because cannot break out of it
        for (let key in object) {
            if (object[key]) {
                let field = object[key].__cifName !== null ? object[key].__cifName || object[key].__aliasFor : null;
                if (fieldName === field) {
                    return key;
                }
            }
        }
        return;
    }

    /**
     * @private
     * 
     * moves fields from one field to another
     * 
     * @param {object} object               object in which to move fields around
     * @param {object[]} movers             array of movers
     * @param {string} [movers[].from]      path from object persepective from which to extract the fields (own fields if ommitted)
     * @param {string[]} [movers[].fields]  which fields to be moved (all fields if omitted)
     * @param {string} movers[].to          path to which the fields should be moved to
     */
    _moveFields(object, movers) {
        movers.forEach(mover => {
            let pathFor = mover.from ? mover.from.split('.') : [];
            let fieldObj = this._checkAndGetSubField(object, pathFor.slice(0), !mover.fields);
            if (fieldObj) {
                let path = mover.to ? mover.to.split('.') : [];
                if (mover.fields) {
                    let mergefield = {};
                    mover.fields.forEach(field => {
                        let key = this._includesField(fieldObj, field);
                        if (key) {
                            mergefield[key] = fieldObj[key];
                            delete fieldObj[key];
                        }
                    });
                    if (Object.keys(mergefield).length === 0) return; //goes to next mover
                    if (ObjectTransformer._emptyField(fieldObj)) {
                        this._removeEmptyFields(object, pathFor);
                    }
                    this._addAndMerge(object, path, mergefield);
                } else {
                    let copySubField = {};
                    
                    recursiveMerge(copySubField, fieldObj); //copy all field except for '__' fields
                    // don't worry about object being empty because you add a path
                    Object.keys(copySubField).map(key => {delete fieldObj[key]});
                    this._addAndMerge(object, path, copySubField);
                }
            }
        });
    }

     /**
      * @private
      * 
     * checks if the field is empty (ignores all the fields starting with __)
     * 
     * @param {object} object 
     */
    static _emptyField(object) {
        if (Object.keys(object).length === 0) {
            return true;
        } else {
            let keys = 0;
            Object.keys(object).forEach(key => {
                if (!key.startsWith('__')) {
                    ++keys;
                }
            });
            return keys === 0;
        }
    }

    /**
     * @private
     * 
     * removes all empty fields in the path from the object
     * 
     * @param {object} object 
     * @param {string[]} path 
     */
    _removeEmptyFields(object, path) {
        if (path.length === 0) {
            return;
        } else {
            let field = this._includesField(object, path[0]);
            let subObj = field ? object[field] : {};
            if (field && path.length > 1) {
                path.shift()
                this._removeEmptyFields(subObj, path);
            }
            if (field && ObjectTransformer._emptyField(subObj)) {
                delete object[field];
            }
        }
    }

    /**
     * @private
     * 
     * adds the path to obj and merges the leaf field with the mergeWith object
     * 
     * @param {object}      obj 
     * @param {string[]}    path 
     * @param {object}      mergeWith 
     * 
     * @returns {object}    merged object
     */
    _addAndMerge(obj, path, mergeWith) {
        let mergeObject = this._addField(obj, path);
        mergeObject = recursiveMerge(mergeObject, mergeWith);
        return mergeObject;
    }
}

module.exports = ObjectTransformer;