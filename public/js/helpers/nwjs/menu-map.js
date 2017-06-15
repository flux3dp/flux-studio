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
    'helpers/output-error',
    'helpers/check-software-update',
    'helpers/software-updater',
    'helpers/api/cloud'
], function(
    $,
    gui,
    i18n,
    initializeMachine,
    html2canvas,
    fileSaver,
    outputError,
    checkSoftwareUpdate,
    softwareUpdater,
    CloudApi
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
        staticMenuMap = [],
        menuIndexOffset = ('osx' === window.FLUX.osType ? 0 : 1),
        parentIndex = {
            ABOUT  : 0 - menuIndexOffset,
            FILE   : 1 - menuIndexOffset,
            EDIT   : 2 - menuIndexOffset,
            DEVICE : 3 - menuIndexOffset,
            WINDOW : 4 - menuIndexOffset,
            ACCOUNT: 5 - menuIndexOffset,
            HELP   : 6 - menuIndexOffset
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
                id: 'import',
                label: lang.file.import,
                enabled: true,
                onClick: function() {
                    if($('input[type="file"].hide').length > 0) {
                        $('input[type="file"].hide').click();
                    }
                    else {
                        $('input[type="file"]').click();
                    }
                },
                key: 'i',
                modifiers: navigator.appVersion.indexOf('Mac') !== -1 ? 'cmd' : 'ctrl',
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
                id: 'save_fcode',
                label: lang.file.save_fcode,
                enabled: false,
                onClick: emptyFunction,
                key: 's',
                modifiers: 'cmd',
                parent: parentIndex.FILE
            },
            saveScene: {
                id: 'save_scene',
                label: lang.file.save_scene,
                enabled: false,
                onClick: emptyFunction,
                parent: parentIndex.FILE
            },
            duplicate: {
                id: 'duplicate',
                label: lang.edit.duplicate,
                enabled: false,
                onClick: emptyFunction,
                key: 'd',
                modifiers: 'cmd',
                parent: parentIndex.EDIT
            },
            scale: {
                id: 'scale',
                label: lang.edit.scale,
                enabled: false,
                onClick: emptyFunction,
                key: 's',
                modifiers: 'cmd+shift',
                parent: parentIndex.EDIT
            },
            rotate: {
                id: 'rotate',
                label: lang.edit.rotate,
                enabled: false,
                onClick: emptyFunction,
                key: 'r',
                modifiers: 'cmd+shift',
                parent: parentIndex.EDIT
            },
            reset: {
                id: 'reset',
                label: lang.edit.reset,
                enabled: false,
                onClick: emptyFunction,
                parent: parentIndex.EDIT
            },
            alignCenter: {
                id: 'align_center',
                label: lang.edit.alignCenter,
                enabled: false,
                onClick: emptyFunction,
                parent: parentIndex.EDIT
            },
            undo: {
                id: 'undo',
                label: lang.edit.undo,
                enabled: false,
                key: 'Z',
                modifiers: 'cmd',
                onClick: emptyFunction,
                parent: parentIndex.EDIT
            },
            clear: {
                id: 'clear',
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
                id: 'tutorial',
                label: lang.help.tutorial,
                enabled: true,
                parent: parentIndex.HELP,
                onClick: function() {
                    if(typeof window.customEvent.onTutorialClick === 'function') {
                        window.customEvent.onTutorialClick();
                    }
                }
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
                    alert('FLUX Studio ' + lang.version + ': ' + response.version + '\r\nNwjs ' + lang.version + ': ' + process.versions['node-webkit']);
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
       // if (staticMenuMap.length > 3) return staticMenuMap;
        menuMap = [];

        if (1 !== menuIndexOffset) {
            menuMap.push({
                label: lang.flux.label,
                subItems: aboutSubItems
            });
        }

        if (initializeMachine.hasBeenCompleted()) {
            subItems = [
                items.import,
                separator,
                items.saveTask,
                items.saveScene
            ];

            if (1 === menuIndexOffset) {
                subItems = subItems.concat(aboutSubItems);
            }

            menuMap.push({
                label: lang.file.label,
                subItems: subItems
            },
            {
                label: lang.edit.label,
                subItems: [
                    items.undo,
                    separator,
                    items.duplicate,
                    items.scale,
                    items.rotate,
                    items.reset,
                    items.alignCenter,
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
            },
            {
                label: lang.account.label,
                subItems: [
                    {
                        label: lang.account.sign_in,
                        enabled: true,
                        onClick: function() {
                            location.hash = '#studio/cloud';
                        }
                    },
                    separator,
                    {
                        label: lang.account.sign_out,
                        enabled: true,
                        onClick: function() {
                            CloudApi.signOut();
                            setTimeout(() => {
                                location.hash = '#studio/cloud/sign-in';
                            }, 1000);
                        }
                    }
                ]
            });
        } else {
            if (1 === menuIndexOffset) {
                menuMap.push({
                    label: lang.file.label,
                    subItems: aboutSubItems
                });
            }
        }

        menuMap.push({
            label: lang.help.label,
            subItems: [
                {
                    label: lang.help.help_center,
                    enabled: true,
                    onClick: function() {
                        if (true === window.FLUX.isNW) {
                            nw.Shell.openExternal('http://helpcenter.flux3dp.com/');
                        }
                        else {
                            window.open('http://helpcenter.flux3dp.com/');
                        }
                    }
                },
                {
                    label: lang.help.contact,
                    enabled: true,
                    onClick: function() {
                        if (true === window.FLUX.isNW) {
                            if(i18n.getActiveLang() === 'zh-tw') {
                                nw.Shell.openExternal('http://flux3dp.zendesk.com/hc/zh-tw/requests/new');
                            }
                            else {
                                nw.Shell.openExternal('http://flux3dp.zendesk.com/hc/en-us/requests/new');
                            }
                        }
                        else {
                            window.open('http://flux3dp.com/contact');
                        }
                    }
                },
                separator,
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
                separator,
                {
                    label: lang.help.software_update,
                    enabled: true,
                    onClick: function() {
                      checkSoftwareUpdate()
                        .done(function(response) {
                          softwareUpdater(response);
                        })
                    }
                },
                {
                    label: lang.help.debug,
                    enabled: true,
                    onClick: function() {
                        outputError();
                    }
                }
            ]
        });

        staticMenuMap = menuMap;

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
