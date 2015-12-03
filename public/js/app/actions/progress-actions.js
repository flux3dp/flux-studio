define([
    'app/constants/progress-constants',
    'app/dispatcher/progress-dispatcher'
], function(
    ProgressConstants,
    ProgressDispatcher
) {
    'use strict';

    return {
        open: function(type, caption, message, onClose) {
            ProgressDispatcher.dispatch({
                actionType: ProgressConstants.OPEN_EVENT,
                type: type,
                caption: caption,
                message: message,
                onClose: onClose
            });
        },

        updating: function(message, percentage) {
            ProgressDispatcher.dispatch({
                actionType: ProgressConstants.UPDATE_EVENT,
                message: message,
                percentage: percentage
            });
        },

        close: function() {
            ProgressDispatcher.dispatch({
                actionType: ProgressConstants.FINISH_EVENT
            });
        }
    };
});
