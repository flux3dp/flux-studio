/**
 * logger
 */
define(function() {
    'use strict';

    var loggingStore = {};

    // NOTICE: use "NEW" operator to create object
    return function(name) {
        name = name || btoa((new Date()).getTime());

        if ('undefined' === typeof this) {
            throw new Error('Please new this Logger intance');
        }

        if (false === loggingStore.hasOwnProperty(name)) {
            loggingStore[name] = [];
        }

        return {
            append: function(message) {
                if ('string' === typeof message) {
                    message = [this.getTimeLabel(), message].join(' ');
                }

                loggingStore[name].push(message);
                return this;
            },

            get: function() {
                return loggingStore[name];
            },

            getAll: function() {
                return loggingStore;
            },

            getTimeLabel: function() {
                return '[' + (new Date()).toTimeString() + ']';
            }
        };
    };
});