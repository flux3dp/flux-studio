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

        onCropperShowed: function(callback) {
            this.on(Constants.SHOW_CROPPER, callback);
            return beamboxStore;
        },
        removeDrawPreviewBlobListener: function(callback) {
            this.removeListener(Constants.DRAW_PREVIEW_BLOB, callback);
            return beamboxStore;
        },

        removeCropperShowedListener: function(callback) {
            this.removeListener(Constants.SHOW_CROPPER, callback);
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
