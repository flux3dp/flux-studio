define([
    'jquery',
    'helpers/i18n',
    'helpers/local-storage',
    'helpers/shortcuts',
    'helpers/api/config',
    'helpers/logger',
    'helpers/device-master',
    'app/actions/alert-actions',
    'app/stores/alert-store'
], function(
    $,
    i18n,
    localStorage,
    shortcuts,
    config,
    Logger,
    DeviceMaster,
    AlertActions,
    AlertStore
) {
    'use strict';

    var lang = i18n.get();
    // prevent delete (back) behavior

    var genericLogger = new Logger('generic'),
        defaultKeyBehavior = function() {
            shortcuts.on(['BACK'], function(e) {
                // always prevent default, and implement delete function our own.
                e.preventDefault();

                var value,
                    selectionStart,
                    samePosition,
                    deleteStart,
                    deleteCount,
                    me = e.target,
                    hasSelectionStart = true,
                    inputType = (me.type || '').toUpperCase(),
                    acceptedInput = ['TEXT', 'NUMBER', 'PASSWORD', 'TEL', 'URL', 'SEARCH', 'EMAIL'];

                if (('INPUT' === me.tagName &&
                    -1 < acceptedInput.indexOf(inputType) || 'TEXTAREA' === me.tagName)
                ) {
                    try {
                        selectionStart = me.selectionStart;
                    }
                    catch (ex) {
                        hasSelectionStart = false;

                        if ('INPUT' === me.tagName) {
                            me.setAttribute('type', 'TEXT');
                        }
                    }

                    selectionStart = me.selectionStart;
                    value = me.value.split('');
                    samePosition = me.selectionEnd === selectionStart;
                    deleteCount = (
                        true === samePosition ? // same position
                        1 :
                        e.target.selectionEnd - selectionStart
                    );
                    deleteStart = (
                        true === samePosition ? // same position
                        selectionStart - 1 :
                        selectionStart
                    );

                    value.splice(deleteStart, deleteCount);
                    e.target.value = value.join('');
                    e.target.setSelectionRange(selectionStart - 1, selectionStart - 1);

                    if ('INPUT' === me.tagName && false === hasSelectionStart) {
                        me.setAttribute('type', inputType);
                    }
                }
            });

            var FN_KEY = process.platform === "darwin" ? "cmd" : "ctrl";

            // shortcuts.on([FN_KEY, 'r'], function() { forceReload(); });
            shortcuts.on([FN_KEY, 'c'], function() { window.document.execCommand('copy'); });
            shortcuts.on([FN_KEY, 'a'], function() { window.document.execCommand('selectAll'); });
            shortcuts.on([FN_KEY, 'x'], function() { window.document.execCommand('cut'); });
            shortcuts.on([FN_KEY, 'v'], function() { window.document.execCommand('paste'); });

            shortcuts.on(['ctrl', 'alt', 'd'], function(e) {
                if(electron) {
                    electron.ipc.send("DEBUG-INSPECT");
                }
            });

            shortcuts.on(['ctrl', 'alt', 'd'], function(e) {
                // TODO:
                window.location.href = '/debug-panel/index.html';
            });
        };

    defaultKeyBehavior();

    // detached keyup and keydown event
    window.addEventListener('popstate', function(e) {
        if(window.FLUX.allowTracking && window.analytics) {
            window.analytics.event('send', 'pageview', location.hash);
        }
        shortcuts.disableAll();
        // TODO
        defaultKeyBehavior();
    });

    // GA Import Begin
    $('body').on('click', '[data-ga-event]', function(e) {
        var $self = $(e.currentTarget);
        if(window.FLUX.allowTracking && window.analytics) {
            window.analytics.event('send', 'event', 'button', 'click', $self.data('ga-event'));
        }
    });

    //GA Import End

    window.onerror = function(message, source, lineno, colno, error) {
        genericLogger.append([message, source, lineno].join(' '));
    };

    //Process Visual C++ Redistributable Check
    window.FLUX.processPythonException = function(exception_str){
        if(exception_str.indexOf("ImportError: DLL load failed") !== -1){
            AlertActions.showPopupError(
                'error-vcredist',
                lang.support.no_vcredist
            );
        }
    }

    //Process OS X Version Check
    if(window.navigator.userAgent.indexOf("Intel Mac OS X 10_9") !== -1){
        AlertActions.showPopupError(
            'error-osx_10_9',
            lang.support.osx_10_9
        );
    };

    DeviceMaster.startMonitoringUsb();

    return function(callback) {
        var $body = $('body'),
            hash = location.hash,
            onFinished = function(data) {
                var is_ready = data;

                is_ready = ('true' === is_ready);

                if (true === is_ready && ('' === hash || hash.startsWith('#initialize'))) {
                    location.hash = '#studio/' + (config().read('default-app')||'print');
                }
                else if (false === is_ready && false === hash.startsWith('#initialize')) {
                    location.hash = '#';
                }

                callback();
            },
            opt = {
                onError: onFinished
            };

        config(opt).read('printer-is-ready', {
            onFinished: onFinished
        });
    };
});
