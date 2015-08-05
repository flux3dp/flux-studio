define([
    'jquery',
    'helpers/i18n',
    'helpers/local-storage',
    'helpers/shortcuts',
    'helpers/api/config'
], function($, i18n, localStorage, shortcuts, config) {
    'use strict';

    // detached keyup and keydown event
    window.addEventListener('popstate', function(e) {
        shortcuts.disableAll();
    });

    return function(callback) {
        var global_config = config(),
            $body = $('body'),
            hash = location.hash;

        global_config.read('printer-is-ready', {
            onFinished: function(data) {

                var is_ready = data;

                is_ready = ('' === is_ready ? false : 'true' === is_ready);

                if (true === is_ready) {
                    $body.addClass('is-ready');

                    if ('' === hash || hash.startsWith('#initialize')) {
                        location.hash = '#studio/print';
                    }
                }
                else {
                    $body.removeClass('is-ready');
                }

                callback();
            }
        });
    };
});