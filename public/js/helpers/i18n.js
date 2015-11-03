define([
    'helpers/local-storage',
    'helpers/sprintf',
    'app/app-settings'
], function(localStorage, sprintf, settings) {
    'use strict';

    var path = 'app/lang',
        key_active_lang = 'active-lang',
        prefix_key = 'lang-',
        lastest_lang_code = '',
        storeIntoLocalStrorage = function() {

            var supported_langs = settings.i18n.supported_langs,
                paths = [],
                storeLang = function(lang_code) {

                    return function(lang_file) {
                        key = prefix_key + lang_code;
                        localStorage.set(key, lang_file);
                    };
                },
                key;

            for (var name in supported_langs) {
                if (true === supported_langs.hasOwnProperty(name)) {
                    requirejs([path + '/' + name], storeLang(name));
                }
            }
        },
        current_langfile;

    storeIntoLocalStrorage();

    return {
        /**
         * set active language
         *
         * @param {string} language code in lower case
         *
         * @return string
         */
        getActiveLang : function() {
            return localStorage.get(key_active_lang) || settings.i18n.default_lang;
        },

        /**
         * set active language
         *
         * @param {string} language code in lower case
         *
         * @return this
         */
        setActiveLang : function(lang) {
            current_langfile = undefined;
            localStorage.set(key_active_lang, lang);

            return this;
        },

        /**
         * get from key
         *
         * @param {string} the key that obtains i18n string. seperate by '.'
         * @param {json}   bind string with args
         *
         * @return mixed
         */
        get : function(key, args) {
            key = key || '';

            var keys = key.split('.'),
                current_lang_code = this.getActiveLang(),
                temp, line;

            // caching
            if ('undefined' === typeof current_langfile) {
                current_langfile = localStorage.get(prefix_key + current_lang_code);
            }

            temp = line = current_langfile;

            keys.forEach(function(key, i) {
                if ('' !== key) {
                    if ('undefined' !== typeof temp && true === temp.hasOwnProperty(key)) {
                        temp = line = temp[key];
                    }
                    else {
                        throw new Error('KEY "' + keys.join('.') + '" IS NOT EXISTING');
                    }
                }
            });

            return line;
        }
    };
});