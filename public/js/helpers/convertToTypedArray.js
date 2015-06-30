/**
 * typed array convertor
 */
define(function() {
    'use strict';

    return function(arr, TypedArray) {
        var typedArray;

        if ('object' === typeof typedArray) {
            // TODO: throw exception
        }

        typedArray = new TypedArray(arr.length);

        arr.forEach(function(value, i) {
            typedArray[i] = value;
        });

        return typedArray;
    };
});