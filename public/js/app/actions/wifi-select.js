define([
    'jquery',
    'helpers/local-storage'
], function($, localStorage) {
    'use strict';

    return function() {
        $('.wifi-list').on('click', function(e) {
            var $me = $(e.target),
                $clicked_el;

            if (e.target !== e.currentTarget) {
                $clicked_el = $me.parents('li');

                localStorage.set(
                    'active-wifi',
                    {
                        id: $clicked_el.data('wifi-id'),
                        name: $clicked_el.data('wifi-name'),
                    }
                );

            }
        });
    };
});