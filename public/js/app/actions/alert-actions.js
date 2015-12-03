define([
    'app/constants/alert-constants',
    'app/dispatcher/alert-dispatcher'
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

        showPopupYesNo: function(id, message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_YES_NO, message, id
            });
        },

        showPopupCustom: function(id, message, customText) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_CUSTOM, message, id, customText
            });
        },

        showPopupQuestion: function(id, message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_QUESTION, message, id
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
        },

        notifyYes: function(id) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.NOTIFY_YES, id
            });
        },

        notifyCancel: function(id) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.NOTIFY_CANCEL, id
            });
        },

        notifyCustom: function(id) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.NOTIFY_CUSTOM, id
            });
        },

        notifyAnswer: function(id, isYes) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.NOTIFY_ANSWER, id, isYes
            });
        }

    };
});
