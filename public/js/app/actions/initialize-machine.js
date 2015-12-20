/**
 * initialize machine helper
 */
define([
    'helpers/api/config',
    'helpers/local-storage',
    'helpers/nwjs/menu-factory'
], function(
    config,
    localStorage,
    menuFactory
) {
    'use strict';

    var methods = {
        completeSettingUp: function(redirect) {
            var completed = methods.hasBeenCompleted();

            redirect = ('boolean' === typeof redirect ? redirect : true);
            console.log('completeSettingUp', completed);

            config().write('printer-is-ready', true, {
                onFinished: function() {
                    methods.settedPrinter.add(
                        methods.settingPrinter.get()
                    );

                    methods.settingPrinter.clear();
                    methods.settingWifi.clear();

                    if (false === completed) {
                        console.log('completed', completed, menuFactory.methods.refresh);
                        menuFactory.methods.refresh();
                    }

                    if (true === redirect) {
                        location.hash = '#studio/print/';
                    }
                }
            });
        },
        hasBeenCompleted: function() {
            return config().read('printer-is-ready') || false;
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
                return localStorage.get('setting-wifi');
            },
            set: function(wifi) {
                localStorage.set('setting-wifi', wifi);
            },
            clear: function() {
                localStorage.removeAt('setting-wifi');
            }
        }
    };

    return methods;
});