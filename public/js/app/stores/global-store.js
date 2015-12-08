define([
    'app/dispatcher/global-dispatcher',
    'app/constants/global-constants',
    'events',
    'helpers/object-assign'
], function(
    Dispatcher,
    GlobalConstants,
    EventEmitter
){

    var SHOW_MONITOR_EVENT  = 'showMonitorEvent',
        GlobalStore;

    GlobalStore = Object.assign(EventEmitter.prototype, {

        onShowMonitor(callback) {
            this.on(SHOW_MONITOR_EVENT, callback);
        },

        dispatcherIndex: Dispatcher.register(function(payload) {
            var actionType = payload.actionType;
            var action = {

                'SHOW_MONITOR': function() {
                    GlobalStore.emit(SHOW_MONITOR_EVENT, payload.isOn);
                }

            };

            action[actionType]();
        })

    });

    return GlobalStore;

});
