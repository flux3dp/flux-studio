define([
    'app/dispatcher/alert-dispatcher',
    'app/constants/alert-constants',
    'events',
    'helpers/object-assign'
], function(
    Dispatcher,
    AlertConstants,
    EventEmitter
) {
    'use strict';

    var NOTIFY_EVENT          = 'notify',
        POPUP_EVENT           = 'popup',
        FIRMWARE_UPDATE_EVENT = 'firmware_update',
        CHANGE_FILAMENT_EVENT = 'change_filament',
        NOTIFY_RETRY          = 'retry',
        NOTIFY_ABORT          = 'abort',
        NOTIFY_YES            = 'yes',
        NOTIFY_CANCEL         = 'cancel', // including the "no", "cancel", "ok" button fired
        NOTIFY_CUSTOM         = 'custom',
        NOTIFY_ANSWER         = 'answer',
        AlertStore;

    AlertStore = Object.assign(EventEmitter.prototype, {

        onChangeFilament(callback) {
            this.on(CHANGE_FILAMENT_EVENT, callback);
        },

        onFirmwareUpdate(callback) {
            this.on(FIRMWARE_UPDATE_EVENT, callback);
        },

        onNotify(callback) {
            this.on(NOTIFY_EVENT, callback);
        },

        onPopup(callback) {
            this.on(POPUP_EVENT, callback);
        },

        onRetry(callback) {
            this.on(NOTIFY_RETRY, callback);
        },

        onYes(callback) {
            this.on(NOTIFY_YES, callback);
        },

        onCancel(callback) {
            this.on(NOTIFY_CANCEL, callback);
        },

        onAbort(callback) {
            this.on(NOTIFY_ABORT, callback);
        },

        onCustom(callback) {
            this.on(NOTIFY_CUSTOM, callback);
        },

        onAnswer(callback) {
            this.on(NOTIFY_ANSWER, callback);
        },

        removeNotifyListener(callback) {
            this.removeListener(NOTIFY_EVENT, callback);
        },

        removePopupListener(callback) {
            this.removeListener(POPUP_EVENT, callback);
        },

        removeRetryListener(callback) {
            this.removeListener(NOTIFY_RETRY, callback);
        },

        removeAbortListener(callback) {
            this.removeListener(NOTIFY_ABORT, callback);
        },

        dispatcherIndex: Dispatcher.register(function(payload) {
            var actionType = payload.actionType,
                action = {

                'SHOW_INFO': function() {
                    AlertStore.emit(NOTIFY_EVENT, AlertConstants.INFO, payload.message);
                },

                'SHOW_WARNING': function() {
                    AlertStore.emit(NOTIFY_EVENT, AlertConstants.WARNING, payload.message);
                },

                'SHOW_ERROR': function() {
                    AlertStore.emit(NOTIFY_EVENT, AlertConstants.ERROR, payload.message);
                },

                'SHOW_POPUP_INFO': function() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.INFO, payload.id, payload.message);
                },

                'SHOW_POPUP_WARNING': function() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.WARNING, payload.id, payload.message);
                },

                'SHOW_POPUP_ERROR': function() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.ERROR, payload.id, payload.message);
                },

                'SHOW_POPUP_RETRY': function() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.RETRY_CANCEL, payload.id, payload.message);
                },

                'SHOW_POPUP_RETRY_ABORT': function() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.RETRY_ABORT_CANCEL, payload.id, payload.message);
                },

                'SHOW_POPUP_YES_NO': function() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.YES_NO, payload.id, payload.message);
                },

                'SHOW_POPUP_CUSTOM': function() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.CUSTOM_CANCEL, payload.id, payload.message, payload.customText);
                },

                'SHOW_POPUP_QUESTION': function() {
                    AlertStore.emit(POPUP_EVENT, AlertConstants.QUESTION, payload.id, payload.message);
                },

                'NOTIFY_RETRY': function() {
                    AlertStore.emit(NOTIFY_RETRY, payload.id);
                },

                'NOTIFY_ABORT': function() {
                    AlertStore.emit(NOTIFY_ABORT, payload.id);
                },

                'NOTIFY_YES': function() {
                    AlertStore.emit(NOTIFY_YES, payload.id);
                },

                'NOTIFY_CANCEL': function() {
                    AlertStore.emit(NOTIFY_CANCEL, payload.id);
                },

                'NOTIFY_CUSTOM': function() {
                    AlertStore.emit(NOTIFY_CUSTOM, payload.id);
                },

                'NOTIFY_ANSWER': function() {
                    AlertStore.emit(NOTIFY_ANSWER, payload.id, payload.isYes);
                },

                'SHOW_POPUP_FIRMWARE_UPDATE': function() {
                    AlertStore.emit(FIRMWARE_UPDATE_EVENT, payload);
                },

                'SHOW_POPUP_CHANGE_FILAMENT': function() {
                    AlertStore.emit(CHANGE_FILAMENT_EVENT, payload);
                }

            };

            if(!!action[actionType]) {
                action[actionType]();
            }
        })

    });

    return AlertStore;

});
