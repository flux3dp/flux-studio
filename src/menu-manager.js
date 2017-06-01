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
                { label: 'Quit', role: 'quit '}
            ]
        });
    }

    // console.log('check menu');
    // console.log(menu);

    // console.log('menu json', JSON.stringify(menu));
    // console.log('menu length', menu.length);
    // if(menu.length > 0) {
    //     menu.forEach(mainMenu => {ㄑ
    //         console.log('processing', mainMenu);
    //         // construct sub menu
    //         let submenu = [];
    //         mainMenu.submenu.forEach(item => {
    //             if(item.label === 'separator') {
    //                 submenu.push({ type: 'separator' });
    //             }
    //             else {
    //                 submenu.push({
    //                     label: item.label,
    //                     enabled: item.enabled
    //                 });
    //             }
    //         });
    //
    //         _menu.push({
    //             label: mainMenu.title,
    //             submenu
    //         });
    //     });
    // }

    // if(menu.file && menu.file.length > 0) {
    //     let submenu = [];
    //     menu.file.forEach(item => {
    //         console.log('processing', item);
    //         if(item.label === 'separator') {
    //             submenu.push({ type: 'separator' });
    //         }
    //         else if{
    //             submenu.push({
    //                 label: menu.file[itemName].label,
    //                 enabled: menu.file[itemName].enabled
    //             });
    //         }
    //     });
    //     _menu.push({
    //         label: menu.file.label,
    //         submenu
    //     });
    //     console.log('menu is', JSON.stringify(_menu));
    // }

    menu.push({
        label: 'File',
        submenu: [
            { 'id': 'IMPORT', label: r.import || 'open', click: callback },
            { type: 'separator' },
            { 'id': 'EXPORT_FLUX_TASK', label: r.export_flux_task, click: callback },
            { 'id': 'SAVE_SCENE', label: r.save_scene, click: callback } ,
        ]
    });

    menu.push({
        label: 'Edit',
        submenu: [
            { 'id': 'UNDO', label: r.undo, click: callback },
            { type:'separator'},
            { 'id': 'DUPLICATE', label: r.duplicate, enabled: false , click: callback },
            { 'id': 'SCALE', label: r.scale, click: callback },
            { 'id': 'ROTATE', label: r.rotate, click: callback },
            { 'id': 'RESET', label: r.reset, click: callback },
            { 'id': 'ALIGN_CENTER', label: r.align_center, click: callback },
            { type: 'separator' },
            { 'id': 'CLEAR_SCENE', label: r.clear_scene, click: callback },
        ]
    });

    menu.push({
        label: r.machines, id: '_machines',
        submenu: [
            {label: r.add_new_machine, 'id': 'ADD_NEW_MACHINE', 'accelerator': 'Cmd+N', click: callback},
            {type: 'separator'}
        ]
    });

    menu.push({
        label: 'Account',
        submenu: []
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
        label: 'Help', role: 'help',
        submenu: [
            { id: 'HELP_CENTER', label: r.help_center, click() { shell.openExternal('http://helpcenter.flux3dp.com/'); } },
            { id: 'CONTACT_US', label: r.contact, click() { shell.openExtern('http://flux3dp.zendesk.com/hc/en-us/requests/new'); } },
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
            { id: 'COMMANDS', uuid, serial, source, label: r.commands },
            { type: 'separator' },
            { id: 'UPDATE_FIRMWARE', uuid, serial, source, label: r.update_firmware, submenu: [] },
            { id: 'set_default', label: r.set_as_default, uuid, serial, source, click: callback }
        ]
    });
}


class MenuManager extends EventEmitter {
    constructor(on_trigger) {
        super();
        this.constructMenu();

        ipcMain.on(events.NOTIFY_LANGUAGE, (e, language) => {
            language = language === 'tw' ? 'tw' : 'en';
            r = resource[language];
            this.constructMenu();
            // build_menu(this._on_menu_click.bind(this));
        });

        ipcMain.on(events.DISABLE_MENU_ITEM, (e, id) => {
            console.log('disable', id);
        });

        ipcMain.on(events.ENABLE_MENU_ITEM, (e, ids) => {
            console.log('enable menu item', ids);
            ids = Array.isArray(ids) ? ids : [ids];

            this._appmenu.items.forEach(mainMenu => {
                mainMenu.submenu.items.forEach(submenu => {
                    // if(ids.indexOf(submenu.id) > 0) {
                        // console.log('=== found id', submenu.id);
                        submenu.enabled = false;
                    // }
                });
            });

            Menu.setApplicationMenu(this._appmenu);
        });
    }

    constructMenu() {
        this._appmenu = Menu.buildFromTemplate(
            build_menu(this._on_menu_click.bind(this))
        );

        for(let i in this._appmenu.items) {
            if(this._appmenu.items[i].id === '_machines') {
                this._devicemenu = this._appmenu.items[i];
            }
        }
        this._device_list = {};
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
        if(this._device_list[uuid]) {
            this._device_list[uuid].visible = true;
            Menu.setApplicationMenu(this._appmenu);
        } else {
            let instance = build_device_menu(this._on_menu_click.bind(this), uuid, data);
            this._devicemenu.submenu.append(instance);
            this._device_list[uuid] = instance;
            Menu.setApplicationMenu(this._appmenu);
        }
    }
    updateDevice(uuid, data) {
        // NOTE: update this._appmenu and call Menu.setApplicationMenu(this._appmenu); to make changes effect.
    }
    removeDevice(uuid) {
        let target = this._device_list[uuid];
        if(target) {
            target.visible = false;
            Menu.setApplicationMenu(this._appmenu);
        }
    }
}

module.exports = MenuManager;
