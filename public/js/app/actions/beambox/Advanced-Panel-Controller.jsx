define([
    'react',
    'reactDOM',
    'jsx!views/beambox/Advanced-Panel',
    'app/actions/beambox/beambox-preference',
], function(
    React,
    ReactDOM,
    AdvancedPanel,
    BeamboxPreference
){
    class AdvancedPanelController {
        constructor() {
            this.reactRoot = '';
            this.isVisible = false;
            this.src = null;
            this.unmount = this.unmount.bind(this);
        }

        init(reactRoot) {
            this.reactRoot = reactRoot;
        }

        render() {
            this._render();
        }

        setVisibility(isVisible) {
            this.isVisible = isVisible;
        }

        unmount() {
            ReactDOM.unmountComponentAtNode(document.getElementById(this.reactRoot));
        }

        _render() {
            ReactDOM.render(
                <AdvancedPanel
                    unmount={this.unmount}
                />, document.getElementById(this.reactRoot)
            );
        }
    }

    const instance = new AdvancedPanelController();

    return instance;
});
