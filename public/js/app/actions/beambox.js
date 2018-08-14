// It's Flux actions of beambox by Net

define([
    'app/constants/beambox-constants',
    'app/dispatcher/beambox-dispatcher'
], function(
    BeamboxConstants,
    Dispatcher
) {
    return {
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
        getImageTrace: function(imageTrace) {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.GET_IMAGE_TRACE,
                imageTrace
            });
        },
        tuneParams: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.TUNE_IMAGE_TRACE
            });
        },
        applyImageTrace: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.APPLY_IMAGE_TRACE
            });
        },
        endImageTrace: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.END_IMAGE_TRACE
            });
        },
    };
});
