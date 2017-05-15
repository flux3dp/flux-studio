define([
    'app/constants/progress-constants',
    'app/dispatcher/progress-dispatcher'
], function(
    ProgressConstants,
    ProgressDispatcher
) {
    'use strict';

    return {
        open: function(type, caption, message, hasStop, onFinished, onOpened, onStop) {
            ProgressDispatcher.dispatch({
                actionType: ProgressConstants.OPEN_EVENT,
                type: type,
                caption: caption,
                message: message,
                hasStop: hasStop,
                onFinished: onFinished,
                onOpened: onOpened,
                onStop: onStop
            });
        },

        updating: function(message, percentage, onStop) {
            ProgressDispatcher.dispatch({
                actionType: ProgressConstants.UPDATE_EVENT,
                message: message,
                percentage: percentage,
                onStop: onStop
            });
        },

        close: function() {
            ProgressDispatcher.dispatch({
                actionType: ProgressConstants.FINISH_EVENT
            });
        }
    };
});
