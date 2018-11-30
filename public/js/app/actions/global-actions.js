define([
    'app/constants/global-constants',
    'app/dispatcher/global-dispatcher'
], function(
    GlobalConstants,
    Dispatcher
) {
    return {
        showMonitor: function(printer, fcode, previewUrl, opener) {
            Dispatcher.dispatch({
                actionType: GlobalConstants.SHOW_MONITOR, printer, fcode, previewUrl, opener
            });
        },

        closeMonitor: function() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.CLOSE_MONITOR
            });
        },

        closeAllView: function() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.CLOSE_ALL_VIEW
            });
        },

        cancelPreview: function() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.CANCEL_PREVIEW
            });
        },

        sliceComplete: function(report) {
            Dispatcher.dispatch({
                actionType: GlobalConstants.SLICE_COMPLETE, report
            });
        },

        monitorClosed: function() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.MONITOR_CLOSED
            });
        },

        resetDialogMenuIndex: function() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.RESET_DIALOG_MENU_INDEX
            });
        }
    };
});
