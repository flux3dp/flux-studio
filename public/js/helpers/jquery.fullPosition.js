/**
 * full position (left, top, right, right)
 */
define([
    'jquery'
], function($) {
    'use strict';

    $.fn.fullPosition = function(is_offset) {
        is_offset = ('boolean' === typeof is_offset ? is_offset : false);

        var $self = $(this),
            pos = (true === is_offset ? $self.offset() : $self.position());

        return {
            left: pos.left,
            top: pos.top,
            right: pos.left + $self.width(),
            bottom: pos.top + $self.height(),
        };
    };
});