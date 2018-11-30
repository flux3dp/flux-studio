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

        onMonitorClosed(callback) {
            this.on(GlobalConstants.MONITOR_CLOSED, callback);
        },

        onResetDialogMenuIndex(callback) {
            this.on(GlobalConstants.RESET_DIALOG_MENU_INDEX, callback);
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

        removeSliceCompleteListener(callback) {
            this.removeListener(GlobalConstants.SLICE_COMPLETE, callback);
        },

        removeMonitorClosedListener(callback) {
            this.removeListener(GlobalConstants.MONITOR_CLOSED, callback);
        },

        removeResetDialogMenuIndexListener(callback) {
            this.removeListener(GlobalConstants.RESET_DIALOG_MENU_INDEX, callback);
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
