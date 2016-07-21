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

        return {
            clear: function() {
                delete loggingStore[name];
                return this;
            },

            append: function(message) {
                if (false === loggingStore.hasOwnProperty(name)) {
                    loggingStore[name] = [];
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
                var dt = new Date(),
                    year = dt.getFullYear(),
                    month = [0, dt.getMonth() + 1].join('').substr(-2),
                    date = [0, dt.getDate()].join('').substr(-2),
                    hour = [0, dt.getHours()].join('').substr(-2),
                    minute = [0, dt.getMinutes()].join('').substr(-2),
                    second = [0, dt.getSeconds()].join('').substr(-2);

                return `[${year}/${month}/${date} ${hour}:${minute}:${second}]`;
            }
        };
    };
});