define([
    'jquery',
    'helpers/local-storage'
], function($, localStorage) {
    'use strict';

    return function() {
        $('#btn-access-wifi').on('click', function(e) {
            var $pass = $('#text-password');

            // TODO: go to success or failure page
        });
    };
});