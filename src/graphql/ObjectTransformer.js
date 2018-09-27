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
 * An ObjectTransformer transforms objects according to their transform rules:
 * 
 * adders on objects will add all the fields in adder.add if adder.when is present (to the object itself or subObjects)
 * (it will add all the fields in adder.add in anycase if adder.when is not specified)
 * 
 * ignore on objects will remove all the ignore fields if present (of the object itself)
 * 
 * moveFields on objects will move all the mover.fields (or all the present fields if mover.fileds is not specified)
 * from mover.from (or from the object itself if mover.from is not specified) to the mover.to field
 * 
 * alias on objects will set the property '__aliasFor' of this object equal to it's value
 * 
 * args on objects will add the args fields to the '__args' property of the object
 * 
 * inlineFragments adds inline fragments to the object if any of the inline fragment field is present
 */
class ObjectTransformer {

    /**
     * 
     * @param {object} transformRules     object represantation of graphql schema containing the transforms
     */
    constructor(transformRules) {
        this.transformRules = transformRules || {};
    }

    /**
     * transforms/modifies the toTransform object according to the transformRules
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
     * @param {object} transformRules      object with all the relevant transforms for the current object
     * 
     * @returns {boolean} indicating if the object results in an empty object (should never be the case for main query)
     */
    transform(toTransform, transformRules) {
        let transforms = transformRules || this.transformRules;

        if (transforms.adders) {
            this.addFields(toTransform, transforms.adders);
        }

        Object.keys(toTransform).forEach(key => {
            let field = toTransform[key].__aliasFor || key;
            if (transforms[field] && this.transform(toTransform[key], transforms[field])) {
                delete toTransform[field];
            }
        });

        if (transforms.args) {
            let args = toTransform.__args || {};
            args = Object.assign(args, transforms.args)
            toTransform.__args = args;
        }
        if (transforms.ignore) {
            this.ignoreFields(toTransform, transforms.ignore);
        }
        if (transforms.moveFields) {
            this.moveFields(toTransform, transforms.moveFields);
        }
        if (transforms.alias) {
            toTransform.__initialAlias = toTransform.__aliasFor || null;
            toTransform.__aliasFor = transforms.alias;
        }
        if (transforms.inlineFragments) {
            this.addInlineFragments(toTransform, transforms.inlineFragments);
        }

        return Object.keys(toTransform).length === 0;
    }

    /**
     * adds inlineFragments to the object
     * 
     * @param {object} object 
     * @param {object[]} inlineFrags
     * @param {string} inlineFrags[].typeName      name of the inline fragment type
     * @param {string[]} inlineFrags[].fields      fields that belong into the inline fragment
     */
    addInlineFragments(object, inlineFrags) {
        object.__on = [];
        inlineFrags.forEach(inf => {
            // for loop because one cannot break out of forEach
            for (let fieldName of inf.fields) {
                let field = this.includesField(object, fieldName)
                if (field) {
                    let moveFields = [{
                        fields: inf.fields,
                        to: "tempInFrag"
                    }];
                    this.moveFields(object, moveFields);
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
     * for each adder:
     * adds all the fields in the 'add' array to the object if any of 'when' is present or completely omitted
     * 
     * @param {object} object                       object in which to add fields
     * @param {object[]} adders                     array with all the specified adders for the object
     * @param {string | string[]} [adders[].when]   check for presence of fields
     * @param {string | string[]} adders[].add      add fields if any when field is present
     */
    addFields(object, adders) {
        adders.forEach(adder => {
            let forFields = Array.isArray(adder.when) ? adder.when : [adder.when];
            for (let forField of forFields) { // for loop because cannot break out of forEach
                if (this.addFunction(forField, adder.add, object)) {
                    return; //straight to next adder
                }
            }
        });
    }

    /**
     * 
     * @param {string | undefined} forField     check for presence of this field
     * @param {string | string[]}  add          possibly add this fields
     * @param {object} object                   check and add in this object
     * 
     * @returns {boolean}                       indicating whether something was added or not
     */
    addFunction(forField, add, object) {
        let pathFor = forField ? forField.split('.') : [];
        //check subfields recursively
        let fieldObj = this.checkAndGetSubField(object, pathFor);
        if (fieldObj) {
            let adders = Array.isArray(add) ? add : [add];
            adders.forEach(toAdd => {
                let path = toAdd.split('.');
                this.addField(object, path);
            });
            return true;
        }
        return false;
    }

    /**
     * adds path to the obj
     * 
     * @param {object} object
     * @param {string[]} path
     * 
     * @returns {object}        leaf object of path
     */
    addField(object, path) {
        if (path.length > 0) {
            //ignore the fact that this overwrites a field with alias of another fieldname
            object[path[0]] = object[path[0]] || {};
            return this.addField(object[path.shift()], path);
        }
        return object;
    }

    /**
     * checks if the path exists in object
     * 
     * @param {object} object
     * @param {string[]} path   
     * @param {boolean} [del=false]   whether to delete the leaf object when found (used for moving fields)
     * 
     * @returns {object|undefined}    leaf field if found
     */
    checkAndGetSubField(object, path, del = false) {
        if (path.length === 0) {
            return object;
        }
        let field = this.includesField(object, path[0]);
        if (field && path.length > 1) {
            path.shift();
            return this.checkAndGetSubField(object[field], path);
        }
        let fieldObject = field ? object[field] : undefined;
        if (del && field) {
            delete object[field];
        }
        return fieldObject;
    }

    /**
     * ignores all the specified fields
     * 
     * @param {object}             object
     * @param {string|string[]}    ignore   fields to be ignored
     */
    ignoreFields(object, ignore) {
        let ignoreFields = Array.isArray(ignore) ? ignore : [ignore];
        ignoreFields.forEach(toIgnore => {
            let field = this.includesField(object, toIgnore);
            if (field) {
                delete object[field];
            }
        });
    }

    /**
     * 
     * @private
     */
    checkAllNames(initialAlias, ctAlias, fieldName) {
        return (!initialAlias && !ctAlias || initialAlias === null || !initialAlias && ctAlias === fieldName);
    }

    /**
     * checks if the object has has the fieldName property or an alias to it
     * 
     * @param {object} object
     * @param {string} fieldName
     * 
     * @returns {string|undefined} name of the fieldName property if present
     */
    includesField(object, fieldName) {
        //shortCut for non-alias fields
        if (object[fieldName] && this.checkAllNames(object[fieldName].__initialAlias, object[fieldName].__aliasFor, fieldName)) {
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
     * moves fields from one field to another
     * 
     * @param {object} object               object in which to move fields around
     * @param {object[]} movers             array of movers
     * @param {string} [movers[].from]      path from object persepective from which to extract the fields (own fields if ommitted)
     * @param {string[]} [movers[].fields]  which fields to be moved (all fields if omitted)
     * @param {string} movers[].to          path to which the fields should be moved to
     */
    moveFields(object, movers) {
        movers.forEach(mover => {
            let pathFor = mover.from ? mover.from.split('.') : [];
            let fieldObj = this.checkAndGetSubField(object, pathFor.slice(0), !mover.fields);
            if (fieldObj) {
                let path = mover.to ? mover.to.split('.') : [];
                if (mover.fields) {
                    let mergefield = {};
                    mover.fields.forEach(field => {
                        let key = this.includesField(fieldObj, field);
                        if (key) {
                            mergefield[key] = fieldObj[key];
                            delete fieldObj[key];
                        }
                    });
                    if (Object.keys(mergefield).length === 0) return; //goes to next mover
                    if (ObjectTransformer.emptyField(fieldObj)) {
                        this.removeEmptyFields(object, pathFor);
                    }
                    this.addAndMerge(object, path, mergefield);
                } else {
                    let copySubField = {};
                    
                    recursiveMerge(copySubField, fieldObj); //copy all field except for '__' fields
                    // don't worry about object being empty because you add a path
                    Object.keys(copySubField).map(key => {delete fieldObj[key]});
                    this.addAndMerge(object, path, copySubField);
                }
            }
        });
    }

     /**
     * checks if the field is empty (ignores all the fields starting with __)
     * 
     * @param {object} object 
     */
    static emptyField(object) {
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
     * removes all empty fields in the path from the object
     * 
     * @param {object} object 
     * @param {string[]} path 
     */
    removeEmptyFields(object, path) {
        if (path.length === 0) {
            return;
        } else {
            let field = this.includesField(object, path[0]);
            let subObj = field ? object[field] : {};
            if (field && path.length > 1) {
                path.shift()
                this.removeEmptyFields(subObj, path);
            }
            if (field && ObjectTransformer.emptyField(subObj)) {
                delete object[field];
            }
        }
    }

    /**
     * adds the path to obj and merges the leaf field with the mergeWith object
     * 
     * @param {object}      obj 
     * @param {string[]}    path 
     * @param {object}      mergeWith 
     * 
     * @returns {object}    merged object
     */
    addAndMerge(obj, path, mergeWith) {
        let mergeObject = this.addField(obj, path);
        mergeObject = recursiveMerge(mergeObject, mergeWith);
        return mergeObject;
    }
}

module.exports = ObjectTransformer;