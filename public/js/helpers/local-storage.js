define(function() {
    'use strict';

    return {
        /**
         * getter
         *
         * @param {string} setting's name
         *
         * @return mixed
         */
        get : function(name) {
            name = name || '';

            var item = localStorage.getItem(name),
                temp_item;

            item = (null === item ? '' : item);

            try {
                temp_item = JSON.parse(item);

                if ('object' === typeof temp_item) {
                    item = temp_item;
                }
            }
            catch (ex) {
                // TODO: do something
            }

            return item;
        },

        /**
         * setter
         *
         * @param {string} setting's name
         * @param {mixed}  setting's content
         *
         * @return this
         */
        set : function(name, val) {
            name = name || '';
            val = ('object' === typeof val ? JSON.stringify(val) : val);

            localStorage.setItem(name, val);

            return this;
        },

        /**
         * remove by name
         *
         * @param {string} setting's name
         *
         * @return this
         */
        removeAt : function(name) {
            localStorage.removeItem(name);

            return this;
        },

        /**
         * clear all
         *
         * @return this
         */
        clearAll : function() {
            localStorage.clear();

            return this;
        }
    };
});