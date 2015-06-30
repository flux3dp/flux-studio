/**
 * simply check the string is json format
 */
define(function() {
    'use strict';

    return function(str) {
        try {
            JSON.parse(str);
            return true;
        }
        catch(e) {
            return false;
        }
    };
});