define([
    'app/constants/global-constants',
    'app/dispatcher/global-dispatcher'
], function(
    GlobalConstants,
    Dispatcher
) {
    return {

        showMonitor: function(printer, fcode, previewUrl) {
            Dispatcher.dispatch({
                actionType: GlobalConstants.SHOW_MONITOR, printer, fcode, previewUrl
            });
        },

        closeMonitor: function() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.SHOW_MONITOR
            });
        },

        closeAllView: function() {
            Dispatcher.dispatch({
                actionType: GlobalConstants.CLOSE_ALL_VIEW
            });
        }

    };
});
