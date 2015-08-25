define([
    'jquery',
    'helpers/i18n',
    'helpers/local-storage',
    'helpers/shortcuts',
    'helpers/api/config'
], function($, i18n, localStorage, shortcuts, config) {
    'use strict';

    // prevent delete (back) behavior
    shortcuts.on(['DEL'], function(e) {
        e.preventDefault();
    });

    // detached keyup and keydown event
    window.addEventListener('popstate', function(e) {
        shortcuts.disableAll();
    });

    return function(callback) {
        var $body = $('body'),
            hash = location.hash,
            onFinished = function(data) {
                var is_ready = data;

                is_ready = ('true' === is_ready);

                if (true === is_ready && ('' === hash || hash.startsWith('#initialize'))) {
                    location.hash = '#studio/print';
                }
                else if (false === is_ready && ('' !== hash || false === hash.startsWith('#initialize'))) {
                    location.hash = '#';
                }

                callback();
            },
            opt = {
                onError: onFinished
            };

        config(opt).read('printer-is-ready', {
            onFinished: onFinished
        });
    };
});