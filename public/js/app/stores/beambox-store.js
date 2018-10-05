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

        onUpdateLaserPanel: function(callback) {
            this.on(Constants.UPDATE_LASER_PANEL, callback);
            return beamboxStore;
        },

        onEndDrawingPreviewBlob: function(callback) {
            this.on(Constants.END_DRAWING_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        onStartDrawingPreviewBlob: function(callback) {
            this.on(Constants.START_DRAWING_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        onCropperShown: function(callback) {
            this.on(Constants.SHOW_CROPPER, callback);
            return beamboxStore;
        },

        onEndImageTrace: function(callback) {
            this.on(Constants.END_IMAGE_TRACE, callback);
            return beamboxStore;
        },

        onClearCameraCanvas: function(callback) {
            this.on(Constants.CLEAR_CAMERA_CANVAS, callback);
            return beamboxStore;
        },


        removeUpdateLaserPanelListener: function(callback) {
            this.removeListener(Constants.UPDATE_LASER_PANEL, callback);
            return beamboxStore;
        },

        removeEndDrawingPreviewBlobListener: function(callback) {
            this.removeListener(Constants.END_DRAWINGk_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        removeStartDrawingPreviewBlobListener: function(callback) {
            this.removeListener(Constants.START_DRAWING_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        removeCropperShownListener: function(callback) {
            this.removeListener(Constants.SHOW_CROPPER, callback);
            return beamboxStore;
        },

        removeEndImageTraceListener: function(callback) {
            this.removeListener(Constants.END_IMAGE_TRACE, callback);
            return beamboxStore;
        },

        removeClearCameraCanvasListener: function(callback) {
            this.removeListener(Constants.CLEAR_CAMERA_CANVAS, callback);
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
