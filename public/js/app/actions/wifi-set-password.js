define([
    'jquery',
    'helpers/local-storage'
], function($, localStorage) {
    'use strict';

    return function() {
        $('#btn-access-wifi').on('click', function(e) {
            var $pass = $('#text-password');

            // TODO: go to success or failure page
            // TODO: remove fake process
            var Dt = new Date();

            if (0 === Dt.getMilliseconds() % 2) {
                console.log('success');
                location.href = '#initialize/wifi/success';
            }
            else {
                console.log('failure');
                location.href = '#initialize/wifi/failure';
            }
        });
    };
});