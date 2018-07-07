define([
], function() {
    let MENU_ITEMS = ["IMPORT", "EXPORT_FLUX_TASK", "SAVE_SCENE",
                      "UNDO", "DUPLICATE", "SCALE", "ROTATE", "RESET", "ALIGN_CENTER", "CLEAR_SCENE",
                      "TUTORIAL"]

    var ipc, events, defaultAction, currentHandler;

    if(window["electron"]) {
        ipc = electron.ipc;
        events = electron.events;

        defaultAction = {
            PREFERENCE: () => {
                location.hash = '#studio/settings';
            },
            ADD_NEW_MACHINE: () => {
                location.hash = '#initialize/wifi/connect-beambox';
            },
            RELOAD_APP: () => {
                location.reload();
            },
        }

        ipc.on(events.MENU_CLICK, (event, menuItem, ...args) => {
            var action = defaultAction[menuItem.id];
            if(action) {
                action(menuItem.id, ...args);
            } else if(currentHandler) {
                currentHandler.trigger(menuItem.id, ...args);
            }
        });
    }

    class GlobalInteraction {
        constructor() {
            this._actions = {};
        }
        attach(enabled_items) {
            currentHandler = this;
            if(ipc) {
                if(enabled_items) {
                    var disabled_items = [];
                    for(let item of MENU_ITEMS) {
                        if(enabled_items.indexOf(item) < 0) {
                            disabled_items.push(item);
                        }
                    }
                    this.enableMenuItems(enabled_items);
                    this.disableMenuItems(disabled_items);
                } else {
                    this.disableMenuItems(MENU_ITEMS);
                }
            }
        }
        detach() {
            if(currentHandler === this) {
                currentHandler = undefined;
                this.disableMenuItems(MENU_ITEMS);
            }
        }
        enableMenuItems(items) {
            if(ipc) {
                ipc.send(events.ENABLE_MENU_ITEM, items);
            }
        }
        disableMenuItems(items) {
            if(ipc) {
                ipc.send(events.DISABLE_MENU_ITEM, items);
            }
        }
        trigger(eventName, ...args) {
            var action = this._actions[eventName];
            if(action) {
                action(eventName, ...args);
                return true;
            } else {
                return false;
            }
        }
    }

    return GlobalInteraction;
})
