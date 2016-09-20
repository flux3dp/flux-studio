define([
    'jquery',
    'helpers/i18n',
    'helpers/local-storage',
    'helpers/shortcuts',
    'helpers/api/config',
    'helpers/nwjs/menu-factory',
    'helpers/logger',
    'helpers/force-reload'
], function(
    $,
    i18n,
    localStorage,
    shortcuts,
    config,
    menuFactory,
    Logger,
    forceReload
) {
    'use strict';

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

            shortcuts.on(['cmd', 'r'], function() { forceReload(); });
            shortcuts.on(['ctrl', 'r'], function() { forceReload(); });
            shortcuts.on(['cmd', 'c'], function() { window.document.execCommand('copy'); });
            shortcuts.on(['cmd', 'a'], function() { window.document.execCommand('selectAll'); });
            shortcuts.on(['cmd', 'x'], function() { window.document.execCommand('cut'); });
            shortcuts.on(['cmd', 'v'], function() { window.document.execCommand('paste'); });

            if (true === window.FLUX.debug && true === window.FLUX.isNW) {
                shortcuts.on(['ctrl', 'alt', 'd'], function(e) {
                    nw.Window.get().showDevTools();
                });
                shortcuts.on(['ctrl', 'alt', 'shift', 'd'], function() {
                    window.location.href = '/debug-panel/index.html';
                });
            }
        };

    defaultKeyBehavior();

    // detached keyup and keydown event
    window.addEventListener('popstate', function(e) {
        if(window.FLUX.allowTracking) {
            window.analytics.event('send', 'pageview', location.hash);
        }
        shortcuts.disableAll();
        menuFactory.methods.refresh();
        defaultKeyBehavior();
    });

    // listener of all ga event
    $('body').on('click', '[data-ga-event]', function(e) {
        var $self = $(e.currentTarget);
        if(window.FLUX.allowTracking) {
            window.analytics('send', 'event', 'button', 'click', $self.data('ga-event'));
        }
    });

    window.onerror = function(message, source, lineno, colno, error) {
        genericLogger.append([message, source, lineno].join(' '));
    };

    if (true === window.FLUX.isNW) {
        requirejs(['helpers/nwjs/nw-events']);
    }

    return function(callback) {
        var $body = $('body'),
            hash = location.hash,
            onFinished = function(data) {
                var is_ready = data;

                is_ready = ('true' === is_ready);

                if (true === is_ready && ('' === hash || hash.startsWith('#initialize'))) {
                    location.hash = '#studio/print';
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
