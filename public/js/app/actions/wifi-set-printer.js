define([
    'jquery',
    'helpers/local-storage',
    'lib/sha256'
], function($, localStorage) {
    'use strict';

    return function() {
        $('#btn-next').on('click', function(e) {
            e.preventDefault();

            // TODO: do validation?
            var $me = $(e.target),
                $required_fields = $('.required'),
                is_vaild = true,
                printers = localStorage.get('printers') || [],
                was_ready = localStorage.get('printer-is-ready') || '';

            was_ready = ('' === was_ready ? false : 'true' === was_ready);

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

                if (true === was_ready) {
                    $('.popup-window').hide();
                    location.href = '#studio/settings/printer';
                }
                else {
                    localStorage.set('printer-is-ready', true);
                    location.href = '#studio/print';
                }
            }
        });
    };
});