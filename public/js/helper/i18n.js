define(['helpers/setting', 'helpers/sprintf'], function(setting, sprintf) {
    'use strict';

    var path = 'app/lang';

    return {
        /**
         * set active language
         *
         * @param {string} language code in lowercase
         *
         * @return void
         */
        setActiveLang : function(lang) {
            setting.set('active-lang', lang);
        },

        /**
         * get string by key
         *
         * @param {string} the key that obtains i18n string. seperate by '.'
         * @param {json}   bind string with args
         *
         * @return string
         */
        get : function(key, args) {
            var keys = key.split('.');


        }
    };
});