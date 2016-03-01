/**
 * ghost log reader
 */
define(['jquery'], function($) {
    'use strict';

    return function() {
        return $.ajax('message.log');
    };
});