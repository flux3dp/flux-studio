define([
    'app/constants/alert-constants',
    'app/dispatcher/alert-dispatcher',
    'helpers/i18n'
], function(
    AlertConstants,
    AlertDispatcher,
    i18n
) {
    'use strict';

    var lang = i18n.get();

    return {

        showInfo: function(message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_INFO, message
            });
        },

        showWarning: function(message, onClickCallback, fixed) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_WARNING, message, onClickCallback, fixed
            });
        },

        showError: function(message) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_ERROR, message
            });
        },

        showDeviceBusyPopup: function(id) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_DEVICE_BUSY,
                caption: lang.message.device_busy.caption,
                message: lang.message.device_busy.message,
                id: id
            }, id);
        },

        showPopupInfo: function(id, message, caption) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_INFO, caption, message, id
            }, id);
        },

        showPopupWarning: function(id, message, caption) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_WARNING, caption, message, id
            });
        },

        showPopupError: function(id, message, caption) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_ERROR, caption, message, id
            });
        },

        showPopupRetry: function(id, message, caption) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_RETRY, caption, message, id
            });
        },

        showPopupRetryAbort: function(id, message, caption) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_RETRY_ABORT, caption, message, id
            });
        },

        showPopupYesNo: function(id, message, caption, args) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_YES_NO, caption, message, id, args
            });
        },

        showPopupCustom: function(id, message, customText, caption) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_CUSTOM,
                id: id,
                caption: caption,
                message: message,
                customText: customText
            });
        },

        showPopupQuestion: function(id, message, caption) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_QUESTION, caption, message, id
            });
        },

        showUpdate: function(device, type, updateInfo, onInstall) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_UPDATE,
                device: device,
                type: type,
                updateInfo: updateInfo,
                onInstall: onInstall
            });
        },

        showChangeFilament: function(device, src) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.SHOW_POPUP_CHANGE_FILAMENT,
                device: device,
                src: src || ''
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

        notifyYes: function(id, args) {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.NOTIFY_YES, id, args
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
        },

        closeNotification: function() {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.CLOSE_NOTIFICATION
            });
        },

        closePopup: function() {
            AlertDispatcher.dispatch({
                actionType: AlertConstants.CLOSE_POPUP
            });
        }

    };
});
