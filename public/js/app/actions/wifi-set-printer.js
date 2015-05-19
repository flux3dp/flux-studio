define([
    'jquery',
    'helpers/local-storage'
], function($, localStorage) {
    'use strict';

    return function() {
        $('#btn-next').on('click', function(e) {
            e.preventDefault();

            // TODO: do validation?
            var $me = $(e.target),
                $required_fields = $('.required'),
                is_vaild = true;

            $('.error').removeClass('error');

            $required_fields.each(function(k, el) {
                var $el = $(el);

                if ('' === $el.val()) {
                    $el.addClass('error');
                    is_vaild = false;
                }
            });

            if (true === is_vaild) {
                localStorage.set('printer-is-ready', true);
                //location.href = '#studio/print';
                location.href='#initialize/wifi/setup-complete'
            }
        });
    };
});