define(function() {
    'use strict';

    return {
        /**
         * get setting by name
         *
         * @param {string} setting's name
         *
         * @return mixed
         */
        get : function(name) {
            name = name || '';

            var str = localStorage.getItem(name);

            str = (null === str ? '' : str);

            try {
                str = JSON.parse(str);
            }
            catch (ex) {
                // TODO: do something
            }

            return str;
        },

        /**
         * set setting by name
         *
         * @param {string} setting's name
         * @param {mixed}  setting's content
         *
         * @return this
         */
        set : function(name, val) {
            name = name || '';
            val = JSON.stringify(val);

            localStorage.setItem(name, val);

            return this;
        },

        /**
         * remove setting by name
         *
         * @param {string} setting's name
         *
         * @return this
         */
        removeAt : function(name) {
            localStorage.removeAt(name);

            return this;
        },

        /**
         * clear all settings
         *
         * @return this
         */
        clear : function() {
            localStorage.clear();

            return this;
        }
    };
});