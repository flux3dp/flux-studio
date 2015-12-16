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
        CLOSE_MONITOR_EVENT = 'closeMonitorEvent',
        CLOSE_ALL_VIEW_EVENT = 'closeAllViewEvent',
        GlobalStore;

    GlobalStore = Object.assign(EventEmitter.prototype, {

        onShowMonitor(callback) {
            this.on(SHOW_MONITOR_EVENT, callback);
        },

        onCloseMonitor(callback) {
            this.on(CLOSE_MONITOR_EVENT, callback);
        },

        onCloseAllView(callback) {
            this.on(CLOSE_ALL_VIEW_EVENT, callback);
        },

        dispatcherIndex: Dispatcher.register(function(payload) {
            var actionType = payload.actionType;
            var action = {

                'SHOW_MONITOR': function() {
                    GlobalStore.emit(SHOW_MONITOR_EVENT, payload.printer, payload.fcode, payload.previewUrl);
                },

                'CLOSE_MONITOR': function() {
                    GlobalStore.emit(CLOSE_MONITOR_EVENT);
                },

                'CLOSE_ALL_VIEW': function() {
                    GlobalStore.emit(CLOSE_ALL_VIEW_EVENT);
                }

            };

            action[actionType]();
        })

    });

    return GlobalStore;

});
