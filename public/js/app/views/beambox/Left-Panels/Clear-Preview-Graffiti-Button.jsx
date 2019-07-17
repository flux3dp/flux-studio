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

        activate() {
            $(`#${rootId}`).addClass('active');
            const onClick= () => {
                if(!PreviewModeBackgroundDrawer.isClean()) {
                    PreviewModeBackgroundDrawer.resetCoordinates();
                    this.onClick();
                    this.deactivate();
                    BeamboxActions.clearCameraCanvas();
                }
            }
            $(`#${rootId}`).bind('click', onClick);
        }

        deactivate() {
            $(`#${rootId}`).removeClass('active');
            const onClick= () => {}
            $(`#${rootId}`).bind('click', onClick);
        }
        
    };
    return new ClearPreviewGraffitiButton();
});
