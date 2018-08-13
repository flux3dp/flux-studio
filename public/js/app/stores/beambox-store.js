define([
    'app/dispatcher/beambox-dispatcher',
    'app/constants/beambox-constants',
    'events',
    'helpers/object-assign'
], function(
    Dispatcher,
    Constants,
    EventEmitter
) {
    'use strict';

    var beamboxStore;

    beamboxStore = Object.assign(EventEmitter.prototype, {

        onDrawPreviewBlob: function(callback) {
            this.on(Constants.DRAW_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        onCropperShown: function(callback) {
            this.on(Constants.SHOW_CROPPER, callback);
            return beamboxStore;
        },

        onGetImageTrace: function(callback) {
            this.on(Constants.GET_IMAGE_TRACE, callback);
            return beamboxStore;
        },

        onBackToPreviewMode: function(callback) {
            this.on(Constants.BACK_TO_PREVIEW, callback);
            return beamboxStore;
        },

        onEndImageTrace: function(callback) {
            this.on(Constants.END_IMAGE_TRACE, callback);
            return beamboxStore;
        },

        removeDrawPreviewBlobListener: function(callback) {
            this.removeListener(Constants.DRAW_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        removeCropperShownListener: function(callback) {
            this.removeListener(Constants.SHOW_CROPPER, callback);
            return beamboxStore;
        },

        removeGetImageTraceListener: function(callback) {
            this.removeListener(Constants.GET_IMAGE_TRACE, callback);
            return beamboxStore;
        },

        removeBackToPreviewModeListener: function(callback) {
            this.removeListener(Constants.BACK_TO_PREVIEW, callback);
            return beamboxStore;
        },

        removeEndImageTraceListener: function(callback) {
            this.removeListener(Constants.END_IMAGE_TRACE, callback);
            return beamboxStore;
        },

        dispatcherIndex: Dispatcher.register(function(payload) {
            var actionType = payload.actionType;

            if(Constants[actionType]) {
                beamboxStore.emit(actionType, payload);
            }
            else {
                throw new console.error('unknown method');
            }
        })

    });

    return beamboxStore;
});
