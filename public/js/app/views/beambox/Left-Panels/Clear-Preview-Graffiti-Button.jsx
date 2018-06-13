define([
    'react',
    'reactDOM'
], function (
    React,
    ReactDOM
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
                    this.onClick();
                    this.hide();
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
