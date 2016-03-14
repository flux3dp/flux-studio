/**
 * nwjs menu factory
 */
define([
    'jquery',
    'helpers/nwjs/gui',
    'helpers/i18n',
    'app/actions/initialize-machine',
    'html2canvas',
    'plugins/file-saver/file-saver.min',
    'helpers/ghost-log-reader'
], function(
    $,
    gui,
    i18n,
    initializeMachine,
    html2canvas,
    fileSaver,
    ghostLogReader
) {
    'use strict';

    var emptyFunction = function(object) {
            return object || {};
        },
        separator = {
            label: '',
            type: 'separator'
        },
        lang = i18n.get().topmenu,
        menuMap = [],
        windowIndex = ('win' === window.FLUX.osType ? 1 : 0),
        parentIndex = {
            ABOUT  : 0 - windowIndex,
            FILE   : 1 - windowIndex,
            EDIT   : 2 - windowIndex,
            DEVICE : 3 - windowIndex,
            WINDOW : 4 - windowIndex,
            HELP   : 5 - windowIndex
        },
        newDevice = {
            label: lang.device.new,
            enabled: true,
            onClick: function() {
                location.hash = '#initialize/wifi/connect-machine';
            },
            key: 'n',
            modifiers: 'cmd'
        },
        items = {
            import: {
                label: lang.file.import,
                enabled: true,
                onClick: emptyFunction,
                key: 'i',
                modifiers: 'cmd',
                parent: parentIndex.FILE
            },
            recent: {
                label: lang.file.recent,
                enabled: true,
                onClick: emptyFunction,
                parent: parentIndex.FILE
            },
            execute: {
                label: lang.file.execute,
                enabled: false,
                onClick: emptyFunction,
                parent: parentIndex.FILE
            },
            saveTask: {
                label: lang.file.save_fcode,
                enabled: false,
                onClick: emptyFunction,
                key: 's',
                modifiers: 'cmd',
                parent: parentIndex.FILE
            },
            saveScene: {
                label: lang.file.save_scene,
                enabled: false,
                onClick: emptyFunction,
                parent: parentIndex.FILE
            },
            duplicate: {
                label: lang.edit.duplicate,
                enabled: false,
                onClick: emptyFunction,
                key: 'd',
                modifiers: 'cmd',
                parent: parentIndex.EDIT
            },
            scale: {
                label: lang.edit.scale,
                enabled: false,
                onClick: emptyFunction,
                key: 's',
                modifiers: 'cmd+alt',
                parent: parentIndex.EDIT
            },
            rotate: {
                label: lang.edit.rotate,
                enabled: false,
                onClick: emptyFunction,
                key: 'r',
                modifiers: 'cmd+alt',
                parent: parentIndex.EDIT
            },
            reset: {
                label: lang.edit.reset,
                enabled: false,
                onClick: emptyFunction,
                parent: parentIndex.EDIT
            },
            clear: {
                label: lang.edit.clear,
                enabled: false,
                onClick: emptyFunction,
                key: 'x',
                modifiers: 'cmd+shift',
                parent: parentIndex.EDIT
            },
            device: {
                label: lang.device.label,
                enabled: true,
                defaultSubItems: [newDevice, separator],
                subItems: [newDevice, separator],
                parent: parentIndex.DEVICE
            },
            tutorial: {
                label: lang.help.tutorial,
                enabled: true,
                parent: parentIndex.HELP
            }
        },
        defaultDevice = initializeMachine.defaultPrinter.get(),
        defaultDeviceChange = function() {},
        deviceRefreshTimer,
        createDevice,
        createDeviceList,
        aboutSubItems = [{
            label: lang.flux.about,
            enabled: true,
            onClick: function() {
                $.ajax({
                    url: 'package.json',
                    dataType: 'json'
                }).done(function(response) {
                    alert(lang.version + ':' + response.version);
                });
            }
        },
        {
            label: lang.flux.preferences,
            enabled: true,
            onClick: function() {
                location.hash = '#studio/settings';
            }
        },
        separator,
        {
            label: lang.flux.quit,
            enabled: true,
            key: 'q',
            modifiers: 'cmd',
            onClick: function() {
                nw.Window.get().close();
            }
        }],
        subItems;

    function bindMap() {
        menuMap = [];

        if ('win' !== window.FLUX.osType) {
            menuMap.push({
                label: lang.flux.label,
                subItems: aboutSubItems
            });
        }

        if (true === initializeMachine.hasBeenCompleted()) {
            subItems = [
                items.import,
                separator,
                items.saveTask,
                items.saveScene
            ];

            if ('win' === window.FLUX.osType) {
                subItems = subItems.concat(aboutSubItems);
            }

            menuMap.push({
                label: lang.file.label,
                subItems: subItems
            },
            {
                label: lang.edit.label,
                subItems: [
                    items.duplicate,
                    items.scale,
                    items.rotate,
                    items.reset,
                    separator,
                    items.clear
                ]
            },
            items.device,
            {
                label: lang.window.label,
                subItems: [
                    {
                        label: lang.window.minimize,
                        enabled: true,
                        onClick: function() {
                            gui.Window.get().minimize();
                        },
                        key: 'm',
                        modifiers: 'cmd'
                    },
                    {
                        label: lang.window.fullscreen,
                        enabled: true,
                        onClick: function() {
                            gui.Window.get().maximize();
                        }
                    }
                ]
            });
        }

        menuMap.push({
            label: lang.help.label,
            subItems: [
                {
                    label: lang.help.help_center,
                    enabled: true,
                    onClick: function() {
                        if (true === window.FLUX.isNW) {
                            nw.Shell.openExternal('https://helpcenter.flux3dp.com/');
                        }
                        else {
                            window.open('https://helpcenter.flux3dp.com/');
                        }
                    }
                },
                {
                    label: lang.help.contact,
                    enabled: true,
                    onClick: function() {
                        if (true === window.FLUX.isNW) {
                            nw.Shell.openExternal('http://flux3dp.com/contact');
                        }
                        else {
                            window.open('http://flux3dp.com/contact');
                        }
                    }
                },
                items.tutorial,
                {
                    label: lang.help.forum,
                    enabled: true,
                    onClick: function() {
                        if (true === window.FLUX.isNW) {
                            nw.Shell.openExternal('http://forum.flux3dp.com');
                        }
                        else {
                            window.open('http://forum.flux3dp.com');
                        }
                    }
                },
                {
                    label: lang.help.debug,
                    enabled: true,
                    onClick: function() {
                        window.html2canvas = html2canvas;
                        function obfuse(str){
                            var output = [],
                                c;

                            for (var i in str) {
                                c = {'f':'x','l':'u','u':'l','x':'f'}[str[i]];
                                output.push(c?c:str[i]);
                            }

                            return output.join('');
                        }

                        html2canvas(window.document.body).then(function(canvas) {
                            var jpegUrl = canvas.toDataURL("image/jpeg"),
                                report_info = JSON.stringify({ ws: window.FLUX.websockets, screenshot: jpegUrl }, null, 2),
                                report_blob;

                            for(var i in window.FLUX.websockets){
                                if ("function" !== typeof window.FLUX.websockets[i]){
                                    window.FLUX.websockets[i].optimizeLogs();
                                }
                            }

                            if (!window.FLUX.debug) {
                                report_info = obfuse(btoa(report_info));
                            }

                            ghostLogReader().done(function(log) {
                                report_blob = new Blob([log, report_info], { type : 'text/html' });
                                saveAs(report_blob, 'bugreport_' + Math.floor(Date.now() / 1000) + '.txt');
                            });
                        });
                    }
                }
            ]
        });

        return menuMap;
    }

    menuMap = bindMap();

    return {
        parentIndex: parentIndex,
        all: menuMap,
        items: items,
        refresh: bindMap
    };

});
