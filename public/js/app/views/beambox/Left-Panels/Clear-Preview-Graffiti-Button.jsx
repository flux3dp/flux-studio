define([
    'react',
    'reactDOM',
    'app/actions/beambox',
    'app/actions/beambox/preview-mode-background-drawer'
], function (
    React,
    ReactDOM,
    BeamboxActions,
    PreviewModeBackgroundDrawer
) {
    const rootId = 'clear-preview-graffiti-button-placeholder';

    class ClearPreviewGraffitiButton {
        constructor() {
            this.onClick = () => {
                console.error('should init by preview-mode-controller');
            };
        }

        init(onClick) {
            this.onClick = onClick;
        }

        activate(endPreviewMode) {
            $(`#${rootId}`).addClass('active');
            $(`#${rootId}`).removeClass('hide');
            const onClick= () => {
                if(!PreviewModeBackgroundDrawer.isClean()) {
                    PreviewModeBackgroundDrawer.resetCoordinates();
                    this.onClick();
                    BeamboxActions.clearCameraCanvas();
                }
                endPreviewMode();
                this.hide();
            }
            $(`#${rootId}`).bind('click', onClick);
        }

        deactivate() {
            $(`#${rootId}`).removeClass('active');
        }

        hide() {
            $(`#${rootId}`).addClass('hide');
        }
        
    };
    return new ClearPreviewGraffitiButton();
});
