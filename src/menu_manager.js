
const EventEmitter = require('events');
const {app, Menu, MenuItem, shell} = require('electron');

function build_menu(callback) {
    menu = [];

    if(process.platform === 'darwin') {
        menu.push({
            label: 'FLUX Studio',
            submenu: [
                {label: 'About FLUX Studio', role: 'about'},
                {label: 'Preferences', 'id': '_preferences', 'accelerator': 'Cmd+,'},
                {type: 'separator'},
                {role: 'services', submenu: []},
                {type: 'separator'},
                {label: 'Hide', role: 'hide'},
                {role: 'hideothers'},
                {type: "separator"},
                {label: 'Quit', role: 'quit'}
            ]
        });
    }

    menu.push({
        label: 'File',
        submenu: [
            {label: 'Open', 'id': '_open'},
            {label: 'Save', 'id': '_save'}
        ]
    });

    menu.push({
        label: 'Edit',
        submenu: [
            {role: 'undo'}
        ]
    });

    menu.push({
        label: 'Machines', id: '_machines',
        submenu: [
            {label: 'Add a New Machine', 'id': '_new_machine', 'accelerator': 'Cmd+N'},
            {type: "separator"}
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
            {label: 'Help Center', click() { shell.openExternal("http://helpcenter.flux3dp.com/"); }},
            {label: 'Contact As', click() { shell.openExternal("http://flux3dp.zendesk.com/hc/en-us/requests/new"); }},
            {type: "separator"},
            {label: 'Start Printing Tutorial'},
            {label: 'Community Forum'},
            {type: "separator"},
            {label: 'Software Update'},
            {label: 'Bug Report'}
        ]
    });

    return menu;
}


function build_device_menu(callback, uuid, data) {
    return new MenuItem({
        label: data.name,
        id: "device:" + uuid,
        visible: true,
        submenu: [
            {label: "Dashboard", id: `#${uuid}:dashboard`, click: callback},
            {label: "Machine Info", id: `#${uuid}:machine_info`, click: callback},
            {label: "Toolhead Info", id: `#${uuid}:toolhead_info`, click: callback},
            {type: "separator"},
            {label: "Change Printing Material", id: `#${uuid}:chg_filament`, click: callback},
            {label: "Run Auto Leveling", id: `#${uuid}:auto_leveling`, click: callback},
            {label: "Commands", id: `#${uuid}:commands`},
            {type: "separator"},
            {label: "Update Firmware", id: `#${uuid}:update_firmware`,
             submenu: []},
            {label: "Set as Default", id: `#${uuid}:set_default`, click: callback},
        ]
    });
}


class MenuManager extends EventEmitter {
    constructor(on_trigger) {
        super();

        this._appmenu = Menu.buildFromTemplate(build_menu(this._on_menu_click));

        for(let i in this._appmenu.items) {
            if(this._appmenu.items[i].id === "_machines") {
                this._devicemenu = this._appmenu.items[i];
            }
        }
        this._device_list = {};
        Menu.setApplicationMenu(this._appmenu);
    }
    _on_menu_click(event) {
        if(event.id) {
            if(event.id[0] === "_") {
                let action = event.id.substr(1);
                this.emit("trigger", {target: "simple", action: action});
            } else if(event.id[0] === "#") {
                let data = event.id.substr(1).split(":");
                let uuid = data[0];
                let action = data[1];
                this.emit("trigger", {target: "device", action: action, uuid: uuid});
            }
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
            let instance = build_device_menu(this._on_menu_click, uuid, data);
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

module.exports = {
    MenuManager: MenuManager
};
