define([
    'react',
    'reactDOM',
    'jsx!views/beambox/Photo-Edit-Panel'
], function(
    React,
    ReactDOM,
    PhotoEditPanel
){
    class PhotoEditPanelController {
        constructor() {
            this.reactRoot = '';
            this.element = null;
            this.src = null;
            this.unmount = this.unmount.bind(this);
        }

        init(reactRoot) {
            this.reactRoot = reactRoot;
        }

        render() {
            if(this.src) {
                this._render();
            } else {
                this.unmount();
            }
        }

        setElememt(element) {
            this.element = element;
            this.src = element.getAttribute('origImage');
        }

        unmount() {
            this.element = null;
            ReactDOM.unmountComponentAtNode(document.getElementById(this.reactRoot));
        }

        _render() {
            ReactDOM.render(
                <PhotoEditPanel
                    element={this.element}
                    src={this.src}
                    unmount={this.unmount}
                />, document.getElementById(this.reactRoot)
            );
        }
    }

    const instance = new PhotoEditPanelController();

    return instance;
});
