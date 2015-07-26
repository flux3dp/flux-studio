/**
 * full position (left, top, right, right)
 */
define([
    'jquery'
], function($) {
    'use strict';

    $.fn.box = function(is_offset) {
        is_offset = ('boolean' === typeof is_offset ? is_offset : false);

        var $self = $(this),
            bounds = $self.get(0).getBoundingClientRect(),
            real_width = bounds.right - bounds.left,
            real_height = bounds.bottom - bounds.top,
            pos = (true === is_offset ? $self.offset() : $self.position());

        return {
            left: pos.left,
            top: pos.top,
            right: pos.left + real_width,
            bottom: pos.top + real_height,
            width: real_width,
            height: real_height,
            center: {
                x: (pos.left * 2 + real_width) / 2,
                y: (pos.top * 2 + real_height) / 2,
            }
        };
    };
});