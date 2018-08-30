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

        show() {
            const root = document.getElementById(rootId);
            const button = (<i
                className='fa fa-times clear-preview'
                title="Clear all"
                onClick={() => {
                    if(!PreviewModeBackgroundDrawer.isClean()) {
                        PreviewModeBackgroundDrawer.resetCoordinates();
                        this.onClick();
                        this.hide();
                        BeamboxActions.clearCameraCanvas();
                    }
                }}
            />);
            ReactDOM.render(button, root);
        }

        hide() {
            const root = document.getElementById(rootId);
            ReactDOM.unmountComponentAtNode(root);
        }
    };
    return new ClearPreviewGraffitiButton();
});
