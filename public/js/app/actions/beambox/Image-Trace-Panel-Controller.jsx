define([
    'react',
    'reactDOM',
    'jsx!views/beambox/Image-Trace-Panel',
    'reactCreateReactClass'
], function(
    React,
    ReactDOM,
    ImageTracePanel
){
    class ImageTracePanelController {
        constructor() {
            this.reactRoot = '';
        }
        init(reactRoot) {
            this.reactRoot = reactRoot;
        }

        render() {
            ReactDOM.render(
                <ImageTracePanel />
                ,document.getElementById(this.reactRoot)
            );
        }
    }

    const instance = new ImageTracePanelController();

    return instance;
});
