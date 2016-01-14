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

    var GlobalStore;

    GlobalStore = Object.assign(EventEmitter.prototype, {

        onShowMonitor(callback) {
            this.on(GlobalConstants.SHOW_MONITOR, callback);
        },

        onCloseMonitor(callback) {
            this.on(GlobalConstants.CLOSE_MONITOR, callback);
        },

        onCloseAllView(callback) {
            this.on(GlobalConstants.CLOSE_ALL_VIEW, callback);
        },

        onCancelPreview(callback) {
            this.on(GlobalConstants.CANCEL_PREVIEW, callback);
        },

        onSliceComplete(callback) {
            this.on(GlobalConstants.SLICE_COMPLETE, callback);
        },

        removeShowMoniotorListener(callback) {
            this.removeListener(GlobalConstants.SHOW_MONITOR, callback);
        },

        removeCloseMonitorListener(callback) {
            this.removeListener(GlobalConstants.CLOSE_MONITOR, callback);
        },

        removeCloseAllViewListener(callback) {
            this.removeListener(GlobalConstants.CLOSE_ALL_VIEW, callback);
        },

        removeCancelPreviewListener(callback) {
            this.removeListener(GlobalConstants.CANCEL_PREVIEW, callback);
        },

        removeSliceComplete(callback) {
            this.removeListener(GlobalConstants.SLICE_COMPLETE, callback);
        },

        dispatcherIndex: Dispatcher.register(function(payload) {
            var actionType = payload.actionType;

            if(GlobalConstants[actionType]) {
                GlobalStore.emit(actionType, payload);
            }
            else {
                throw new console.error('unknown method');
            }
        })

    });

    return GlobalStore;

});
