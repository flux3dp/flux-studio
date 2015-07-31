define([
    'jquery',
    'helpers/i18n',
    'helpers/local-storage',
    'helpers/shortcuts'
], function($, i18n, localStorage, shortcuts) {
    'use strict';

    // detached keyup and keydown event
    window.addEventListener('popstate', function(e) {
        shortcuts.disableAll();
    });

    return function(args) {
        $('body').on('change', '#select-lang', function(e) {
            args.state.lang = i18n.setActiveLang(e.currentTarget.value).get();
        });

        (function() {
            var $body = $('body'),
                is_ready = localStorage.get('printer-is-ready') || '',
                hash = location.hash;

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
        })();
    };
});