define([
    'app/constants/Alert-Constants',
    'app/dispatcher/Alert-Dispatcher'
], function(
    AlertConstants,
    AlertDispatcher
) {
    'use strict';

    return {

        showInfo: function(message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_INFO, message
            });
        },

        showWarning: function(message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_WARNING, message
            });
        },

        showError: function(message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_ERROR, message
            });
        },

        showPopupInfo: function(id, message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_INFO, message, id
            }, id);
        },

        showPopupWarning: function(id, message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_WARNING, message, id
            });
        },

        showPopupError: function(id, message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_ERROR, message, id
            });
        },

        showPopupRetry: function(id, message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_RETRY, message, id
            });
        },

        showPopupRetryAbort: function(id, message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_RETRY_ABORT, message, id
            });
        },

        notifyRetry: function(id) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.NOTIFY_RETRY, id
            });
        },

        notifyAbort: function(id) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.NOTIFY_ABORT, id
            });
        }

    };
});
