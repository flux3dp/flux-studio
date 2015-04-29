define([
    'jquery'
], function($) {
    'use strict';

    return function() {
        $('#btn-next').on('click', function(e) {
            e.preventDefault();

            // TODO: do validation?
            var $me = $(e.target),
                $required_fields = $('.required');

            $('.error').removeClass('error');

            $required_fields.each(function(k, el) {
                var $el = $(el);

                if ('' === $el.val()) {
                    $el.addClass('error');
                }
            });
        });
    };
});