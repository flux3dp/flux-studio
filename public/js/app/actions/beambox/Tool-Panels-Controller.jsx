define([
    'react',
    'reactDOM',
    'jsx!views/beambox/Tool-Panels/Tool-Panels',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/beambox/constant',
    'app/actions/beambox/beambox-global-interaction',
], function(
    React,
    ReactDOM,
    ToolPanels,
    FnWrapper,
    Constant,
    BeamboxGlobalInteraction
){
    let _toFixed = function(val) {
        const decimal = 2;
        return Number(Number(val).toFixed(decimal));
    };

    class ToolPanelsController {
        constructor() {
            this.reactRoot = '';
            this.isVisible = false;
            this.type = 'unknown';
            this.$me = $();
            this.data = {
                rowcolumn: {
                    row: 1, column: 1
                },
                distance: {
                    dx: 0, dy: 0
                },
            };
            //bind all
            for (let obj = this; obj; obj = Object.getPrototypeOf(obj)){
                for (let name of Object.getOwnPropertyNames(obj)){
                    if (typeof this[name] === 'function'){
                        this[name] = this[name].bind(this);
                    }
                }
            }
        }

        init(reactRoot) {
            this.reactRoot = reactRoot;
        }

        setVisibility(isVisible) {
            this.isVisible = isVisible;
            if(isVisible) {
                BeamboxGlobalInteraction.onObjectFocus();
            } else {
                BeamboxGlobalInteraction.onObjectBlur();
            }
        }

        setEditable(isEditable) {
            this.isEditable = isEditable;
        }

        setType(type) {
            this.type = type;
        }

        setMe(theObject) {
            this.$me = theObject;
        }

        setGridArrayRowColumn(x, y) {
            this.data.rowcolumn.row = x;
            this.data.rowcolumn.column = y;
        }

        setGridArrayDistance(x, y) {
            this.data.distance.dx = _toFixed(_pixel2mm(dx));
            this.data.distance.dy = _toFixed(_pixel2mm(dy));
        }

        render() {
            if(this.isVisible) {
                this._render();
            } else {
                this.unmount();
            }
        }

        unmount() {
            ReactDOM.unmountComponentAtNode(document.getElementById(this.reactRoot));
        }

        _render() {
            ReactDOM.render(
                <ToolPanels
                    isEditable={this.isEditable}
                    type={this.type}
                    data = {this.data}
                    unmount = {this.unmount.bind(this)}
                />, document.getElementById(this.reactRoot)
            );
        }
    }

    const instance = new ToolPanelsController();

    return instance;
});

