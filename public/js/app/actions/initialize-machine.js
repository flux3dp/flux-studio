/**
 * initialize machine helper
 */
define([
    'helpers/api/config',
    'helpers/local-storage',
    'app/app-settings'
], function(
    config,
    _localStorage,
    settings
) {
    'use strict';

    var methods = {
        reset: function(callback) {
            callback = ('function' === typeof callback ? callback : function() {});
            config().write('printer-is-ready', false);
            callback();
        },
        completeSettingUp: function(redirect) {
            let d = $.Deferred();
            var completed = methods.hasBeenCompleted();

            redirect = ('boolean' === typeof redirect ? redirect : true);

            // add laser-default
            config().write('laser-defaults', JSON.stringify(settings.laser_default));

            config().write('printer-is-ready', true, {
                onFinished: function() {
                    methods.settedPrinter.add(
                        methods.settingPrinter.get()
                    );

                    methods.settingPrinter.clear();
                    methods.settingWifi.clear();

                    if (true === redirect) {
                        location.hash = '#studio/beambox';
                    }
                    d.resolve();
                }
            });
            return d.promise();
        },
        hasBeenCompleted: function() {
            // If you initialized before and you're not in initialization screen
            return 'true' === config().read('printer-is-ready') && (!~location.href.indexOf('initialize/'));
        },
        settingPrinter: {
            get: function() {
                return _localStorage.get('setting-printer');
            },
            set: function(printer) {
                _localStorage.set('setting-printer', printer);
            },
            clear: function() {
                _localStorage.removeAt('setting-printer');
            }
        },
        settedPrinter: {
            get: function() {
                return _localStorage.get('printers') || [];
            },
            set: function(printers) {
                _localStorage.set('printers', printers);
            },
            add: function(printer) {
                var settedPrinters = methods.settedPrinter.get(),
                    findPrinter = function(existingPrinter) {
                        return existingPrinter.uuid === printer.uuid;
                    };

                if ('object' === typeof printer && false === settedPrinters.some(findPrinter)) {
                    settedPrinters.push(printer);
                }

                _localStorage.set('printers', JSON.stringify(settedPrinters));
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
                _localStorage.removeAt('printers');
            }
        },
        settingWifi: {
            get: function() {
                return _localStorage.get('setting-wifi') || {};
            },
            set: function(wifi) {
                _localStorage.set('setting-wifi', wifi);
            },
            clear: function() {
                _localStorage.removeAt('setting-wifi');
            }
        },
        defaultPrinter: {
            set: function(printer) {
                config().write('default-printer', JSON.stringify(printer));
            },
            exist: function() {
                var defaultPrinter = config().read('default-printer') || {};

                return ('string' === typeof defaultPrinter.uuid);
            },
            get: function() {
                return config().read('default-printer') || {};
            },
            clear: function() {
                _localStorage.removeAt('default-printer');
            }
        }
    };

    return methods;
});
