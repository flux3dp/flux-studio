/**
 * drag and drop handler
 */
define(['jquery'], function($) {
    'use strict';

    return {
        plug: function(rootElement, handler) {
            return this.unplug(rootElement).on('dragover dragend', function(e) {
                    e.preventDefault();
                }).
                on('drop', function(e) {
                    e.preventDefault();
                    window.processDroppedFile = true;
                    handler(e);
                });
        },
        unplug: function(rootElement) {
            return $(rootElement).off('drop dragover dragend');
        }
    };
});
