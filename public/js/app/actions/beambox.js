// It's Flux actions of beambox by Net

define([
    'app/constants/beambox-constants',
    'app/dispatcher/beambox-dispatcher'
], function(
    BeamboxConstants,
    Dispatcher
) {
    return {
        drawPreviewBlob: function(previewBlobUrl) {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.DRAW_PREVIEW_BLOB,
                previewBlobUrl
            });
        },
        showCropper: function() {
            Dispatcher.dispatch({
                actionType: BeamboxConstants.SHOW_CROPPER,
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
