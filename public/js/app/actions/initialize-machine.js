/**
 * initialize machine helper
 */
define([
    'helpers/api/config',
    'helpers/nwjs/menu-factory',
    'helpers/local-storage'
], function(
    config,
    menuFactory,
    localStorage
) {
    'use strict';

    var methods = {
        reset: function(callback) {
            callback = ('function' === typeof callback ? callback : function() {});
            config().write('printer-is-ready', false);
            callback();
        },
        completeSettingUp: function(redirect) {
            var completed = methods.hasBeenCompleted();

            redirect = ('boolean' === typeof redirect ? redirect : true);

            config().write('printer-is-ready', true, {
                onFinished: function() {
                    methods.settedPrinter.add(
                        methods.settingPrinter.get()
                    );

                    methods.settingPrinter.clear();
                    methods.settingWifi.clear();

                    if (false === completed && 'undefined' !== typeof menuFactory) {
                        menuFactory.methods.refresh();
                    }

                    if (true === redirect) {
                        location.hash = '#studio/print/';
                    }
                }
            });
        },
        hasBeenCompleted: function() {
            return ('true' === config().read('printer-is-ready') ? true : false);
        },
        settingPrinter: {
            get: function() {
                return localStorage.get('setting-printer');
            },
            set: function(printer) {
                localStorage.set('setting-printer', printer);
            },
            clear: function() {
                localStorage.removeAt('setting-printer');
            }
        },
        settedPrinter: {
            get: function() {
                return localStorage.get('printers') || [];
            },
            set: function(printers) {
                localStorage.set('printers', printers);
            },
            add: function(printer) {
                var settedPrinters = methods.settedPrinter.get(),
                    findPrinter = function(existingPrinter) {
                        return existingPrinter.uuid === printer.uuid;
                    };

                if ('object' === typeof printer && false === settedPrinters.some(findPrinter)) {
                    settedPrinters.push(printer);
                }

                localStorage.set('printers', JSON.stringify(settedPrinters));
            },
            removeAt: function(printer) {
                var settedPrinters = methods.settedPrinter.get(),
                    survivalPrinters = [];

                settedPrinters.forEach(function(el) {
                    if (el.uuid !== printer.uuid) {
                        survivalPrinters.push(el);
                    }
                });

                methods.settedPrinter.set(survivalPrinters);
            },
            clear: function() {
                localStorage.removeAt('printers');
            }
        },
        settingWifi: {
            get: function() {
                return localStorage.get('setting-wifi') || {};
            },
            set: function(wifi) {
                localStorage.set('setting-wifi', wifi);
            },
            clear: function() {
                localStorage.removeAt('setting-wifi');
            }
        },
        defaultPrinter: {
            set: function(printer) {
                config().write('default-printer', JSON.stringify(printer));
            },
            get: function() {
                return config().read('default-printer') || {};
            },
            clear: function() {
                localStorage.removeAt('default-printer');
            }
        }
    };

    return methods;
});