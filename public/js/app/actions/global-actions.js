define([
    'app/constants/global-constants',
    'app/dispatcher/global-dispatcher'
], function(
    GlobalConstants,
    Dispatcher
) {
    return {

        showMonitor: function(isOn) {
            Dispatcher.dispatch({
                actionType: GlobalConstants.SHOW_MONITOR, isOn
            });
        }

    };
});
