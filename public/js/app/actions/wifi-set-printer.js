define([
    'jquery',
    'helpers/api/config',
    'lib/sha256'
], function($, config) {
    'use strict';

    return function() {
        $('#btn-next').on('click', function(e) {
            e.preventDefault();

            // TODO: do validation?
            var $me = $(e.target),
                $required_fields = $('.required'),
                is_vaild = true,
                printers = localStorage.get('printers') || [];

            $('.error').removeClass('error');

            $required_fields.each(function(k, el) {
                var $el = $(el);

                if ('' === $el.val()) {
                    $el.addClass('error');
                    is_vaild = false;
                }
            });

            if (true === is_vaild) {
                printers.push(
                    {
                        name: $('[name="printer-name"]').val(),
                        password: CryptoJS.SHA256($('[name="printer-password"]').val()).toString(CryptoJS.enc.Hex)
                    }
                );
                localStorage.set('printers', printers);

                config().write('printer-is-ready', true, {
                    onFinished: function() {
                        location.href='#initialize/wifi/setup-complete';
                    }
                });
            }
        });
    };
});