const EventEmitter = require('events');
const {app, Menu, MenuItem, shell, ipcMain} = require('electron');
const resource = require('./menu-resource');
const events = require('./ipc-events');

let r = {};

function build_menu(callback) {
    let menu = [];

    if(process.platform === 'darwin') {
        menu.push({
            label: 'FLUX Studio',
            submenu: [
                { label: 'About FLUX Studio', role: 'about'},
                { 'id': 'PREFERENCE',  label: 'Preferences', 'accelerator': 'Cmd+,', click: callback },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { label: 'Hide', role: 'hide' },
                { role: 'hideothers' },
                { type: 'separator' },
                { label: 'Quit', role: 'quit'}
            ]
        });
    }

    menu.push({
        id: '_file',
        label: r.file,
        submenu: [
            { 'id': 'IMPORT', label: r.import || 'open', click: callback },
            { type: 'separator' },
            { 'id': 'EXPORT_FLUX_TASK', label: r.export_flux_task, click: callback },
            { 'id': 'SAVE_SCENE', label: r.save_scene, click: callback } ,
        ]
    });

    menu.push({
        id: '_edit',
        label: r.edit,
        submenu: [
            { 'id': 'UNDO', label: r.undo, click: callback },
            { type:'separator'},
            { 'id': 'DUPLICATE', label: r.duplicate, enabled: false , click: callback },
            { 'id': 'SCALE', label: r.scale, enabled: false, click: callback },
            { 'id': 'ROTATE', label: r.rotate, enabled: false, click: callback },
            { 'id': 'RESET', label: r.reset, enabled: false, click: callback },
            { 'id': 'ALIGN_CENTER', label: r.align_center, enabled: false, click: callback },
            { type: 'separator' },
            { 'id': 'CLEAR_SCENE', label: r.clear_scene, enabled: false, click: callback },
        ]
    });

    menu.push({
        id: '_machines',
        label: r.machines,
        submenu: [
            { 'id': 'ADD_NEW_MACHINE', label: r.add_new_machine, 'accelerator': 'Cmd+N', click: callback},
            {type: 'separator'}
        ]
    });

    menu.push({
        id: '_account',
        label: r.account,
        submenu: [
            {
                id: 'MY_ACCOUNT',
                label: r.my_account,
                click: callback
            },
            {
                type: 'separator'
            },
            {
                id: 'SIGN_IN',
                label: r.sign_in,
                click: callback
            },
            {
                id: 'SIGN_OUT',
                label: r.sign_out,
                click: callback
            }
        ]
    });

    if(process.platform === 'darwin') {
        menu.push({
            role: 'window',
            submenu: [
                {role: 'minimize'},
                {role: 'close'}
            ]
        });
    }

    menu.push({
        id: '_help',
        label: r.help,
        role: 'help',
        submenu: [
            { id: 'HELP_CENTER', label: r.help_center, click() { shell.openExternal('http://helpcenter.flux3dp.com/'); } },
            { id: 'CONTACT_US', label: r.contact, click() { shell.openExternal('http://flux3dp.zendesk.com/hc/en-us/requests/new'); } },
            { type: 'separator' },
            { id: 'TUTORIAL', label: r.tutorial, click: callback },
            { id: 'FORUM', label: r.forum, click() { shell.openExternal('http://forum.flux3dp.com/'); } },
            { type: 'separator' },
            { id: 'SOFTWARE_UPDATE', label: r.software_update, click() { shell.openExternal('http://flux3dp.com/downloads/'); } },
            { id: 'BUG_REPORT', label: r.bug_report, click: callback }
        ]
    });

    return menu;
}


function build_device_menu(callback, uuid, data) {
    let { serial, source } = data;
    return new MenuItem({
        label: data.name,
        id: 'device:' + uuid,
        visible: true,
        submenu: [
            { id: 'DASHBOARD', uuid, serial, source, label: r.dashboard, click: callback },
            { id: 'MACHINE_INFO', uuid, serial, source, label: r.machine_info, click: callback },
            { id: 'TOOLHEAD_INFO', uuid, serial, source, label: r.toolhead_info, click: callback },
            { type: 'separator' },
            { id: 'CHANGE_FILAMENT', uuid, serial, source, label: r.change_material, click: callback },
            { id: 'AUTO_LEVELING', uuid, serial, source, label: r.run_leveling, click: callback },
            { id: 'COMMANDS', uuid, serial, source, label: r.commands, submenu: [
                { id: 'CALIBRATE_ORIGIN', label: r.calibrate_origin, uuid, serial, source, click: callback },
                { id: 'MOVEMENT_TEST', label: r.movement_test, uuid, serial, source, click: callback },
                { id: 'TURN_ON_LASER', label: r.turn_on_laser, uuid, serial, source, click: callback },
                { id: 'AUTO_LEVELING_CLEAN', label: r.auto_leveling_clean, uuid, serial, source, click: callback },
                { id: 'SET_TOOLHEAD_TEMPERATURE', label: r.set_toolhead_temperature, uuid, serial, source, click: callback }
            ]},
            { type: 'separator' },
            { id: 'UPDATE_FIRMWARE', uuid, serial, source, label: r.update_firmware, submenu: [
                { id: 'UPDATE_DELTA', label: r.update_delta, uuid, serial, source, click: callback },
                { id: 'UPDATE_TOOLHEAD', label: r.update_toolhead, uuid, serial, source, click: callback }
            ]},
            { id: 'DOWNLOAD_LOG', uuid, serial, source, label: r.download_log, submenu: [
                { id: 'LOG_NETWORK', label: r.log.network, uuid, serial, source, click: callback },
                { id: 'LOG_HARDWARE', label: r.log.hardware, uuid, serial, source, click: callback },
                { id: 'LOG_DISCOVER', label: r.log.discover, uuid, serial, source, click: callback },
                { id: 'LOG_USB', label: r.log.usb, uuid, serial, source, click: callback },
                { id: 'LOG_CAMERA', label: r.log.camera, uuid, serial, source, click: callback },
                { id: 'LOG_CLOUD', label: r.log.cloud, uuid, serial, source, click: callback },
                { id: 'LOG_PLAYER', label: r.log.player, uuid, serial, source, click: callback },
                { id: 'LOG_ROBOT', label: r.log.robot, uuid, serial, source, click: callback }
            ]},
            { id: 'SET_AS_DEFAULT', label: r.set_as_default, uuid, serial, source, click: callback, type:'checkbox'}
        ]
    });
}


function buildAccountMenu(callback, account) {
    return new MenuItem({
        label: account.nickname,
        click: callback
    });
}


class MenuManager extends EventEmitter {
    constructor(on_trigger) {
        super();
        this._device_list = {};
        this.constructMenu();

        ipcMain.on(events.NOTIFY_LANGUAGE, (e, language) => {
            language = language === 'zh-tw' ? 'zh-tw' : 'en';
            r = resource[language];
            this.constructMenu();
        });

        ipcMain.on(events.DISABLE_MENU_ITEM, (e, ids) => {
            this.toggleMenu(ids, false);
        });

        ipcMain.on(events.ENABLE_MENU_ITEM, (e, ids) => {
            this.toggleMenu(ids, true);
        });

        ipcMain.on(events.UPDATE_ACCOUNT, (e, account) => {
            const toggleSignIn = (nickname) => {
                this._accountMenu.submenu.items.forEach(item => {
                    if(item.id === 'SIGN_IN') {
                        item.visible = !nickname;
                    }
                    else if(item.id === 'SIGN_OUT') {
                        item.visible = !!nickname;
                    }
                    else if(item.id === 'MY_ACCOUNT') {
                        item.visible = !!nickname;
                        item.label = nickname;
                    }
                });
            };

            toggleSignIn(account.nickname);
            Menu.setApplicationMenu(this._appmenu);
        });

        ipcMain.on(events.SET_AS_DEFAULT, (e, device) => {
            this._deviceMenu.submenu.items.forEach(item => {
                if(item.label === device.name) {
                    item.checked = true;
                }
            });
            Menu.setApplicationMenu(this._appmenu);
        });

        ipcMain.on(events.POPUP_MENU, (e, show, options) => {
            this._popup_menu = Menu.buildFromTemplate([
                {
                    label: "Reload App", click: () => {
                        this.emit("DEBUG-RELOAD")
                    }
                },
                {
                    label: "Inspect", click: () => {
                        this.emit("DEBUG-INSPECT");
                    }
                }
            ]);
            this._popup_menu.popup(options);
        });
    }
    constructMenu() {
        this._appmenu = Menu.buildFromTemplate(
            build_menu(this._on_menu_click.bind(this))
        );

        for(let i in this._appmenu.items) {
            if(this._appmenu.items[i].id === '_machines') {
                this._deviceMenu = this._appmenu.items[i];
            }
            else if(this._appmenu.items[i].id === '_account') {
                this._accountMenu = this._appmenu.items[i];
            }
        }

        for(let uuid in this._device_list) {
            let data = this._device_list[uuid];
            let instance = build_device_menu(this._on_menu_click.bind(this), uuid, data);
            this._deviceMenu.submenu.append(instance);
        }
        Menu.setApplicationMenu(this._appmenu);
    }
    toggleMenu(ids, enabled) {
        ids = Array.isArray(ids) ? ids : [ids];

        this._appmenu.items.forEach(mainMenu => {
            mainMenu.submenu.items.forEach(submenu => {
                if(ids.indexOf(submenu.id) >= 0) {
                    submenu.enabled = enabled;
                }
            });
        });

        Menu.setApplicationMenu(this._appmenu);
    }
    _on_menu_click(event) {
        if(event.id) {
            this.emit(events.MENU_ITEM_CLICK, event);
        }
    }
    setWindowOpened() {
    }
    setWindowsClosed() {
    }
    appendDevice(uuid, data) {
        if(this._deviceMenu) {
            for(let menuitem of this._deviceMenu.submenu.items) {
                if(menuitem.id === `device:${uuid}`) {
                    menuitem.visible = true;
                    this.updateDevice(uuid, data);
                    Menu.setApplicationMenu(this._appmenu);
                    return;
                }
            }

            this._device_list[uuid] = data;
            let instance = build_device_menu(this._on_menu_click.bind(this), uuid, data);
            this._deviceMenu.submenu.append(instance);
            Menu.setApplicationMenu(this._appmenu);
        } else {
            this._device_list[uuid] = data;
            return;
        }
    }
    updateDevice(uuid, data) {
        this._device_list[uuid] = data;

        if(this._deviceMenu) {
            return;
        }
        // NOTE: update this._appmenu and call Menu.setApplicationMenu(this._appmenu); to make changes effect.
    }
    removeDevice(uuid) {
        delete this._device_list[uuid];

        if(this._deviceMenu) {
            for(let menuitem of this._deviceMenu.submenu.items) {
                if(menuitem.id === `device:${uuid}`) {
                    menuitem.visible = false;
                }
            }
            Menu.setApplicationMenu(this._appmenu);
        }
    }
}

module.exports = MenuManager;
