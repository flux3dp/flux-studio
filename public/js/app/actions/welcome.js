define([
    'jquery',
    'helpers/i18n'
], function($, i18n) {
    'use strict';

    return function(args) {
        $('#select-lang').on('change', function(e) {
            args.state.lang = i18n.setActiveLang(e.currentTarget.value).get();
        });
    };
});