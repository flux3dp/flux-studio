// It's Flux actions of beambox by Net

define([
    'app/constants/beambox-constants',
    'app/dispatcher/beambox-dispatcher'
], function(
    BeamboxConstants,
    Dispatcher
) {
    return {
        updateLaserPanel: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.UPDATE_LASER_PANEL,
            });
        },
        backToPreviewMode: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.BACK_TO_PREVIEW,
            });
        },
        startDrawingPreviewBlob: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.START_DRAWING_PREVIEW_BLOB,
            });
        },
        endDrawingPreviewBlob: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.END_DRAWING_PREVIEW_BLOB,
            });
        },
        showCropper: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.SHOW_CROPPER,
            });
        },
        endImageTrace: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.END_IMAGE_TRACE
            });
        },
        clearCameraCanvas: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.CLEAR_CAMERA_CANVAS
            });
        },
    };
});
