define([
    'react',
    'jsx!views/beambox/Object-Panels/Object-Panels',
    'app/actions/beambox/svgeditor-function-wrapper',
], function(
    React,
    ObjectPanels,
    FnWrapper
){
    class ObjectPanelsController {
        constructor(reactRoot) {
            this.reactRoot = reactRoot;
            this.isVisible = false;
            this.type = 'unknown';
            this.$me = $();
            this.data = {
                position: {
                    x: undefined, y: undefined
                },
                rotation: {
                    angle: undefined
                },
                size: {
                    width: undefined, height: undefined
                },
                ellipsePosition: {
                    cx:undefined, cy:undefined
                },
                ellipseRadius: {
                    rx:undefined, ry:undefined
                },
                line: {
                    x1:undefined, y1:undefined, x2:undefined, y2:undefined
                },
                image: {
                    threshold:undefined, shading:undefined
                }
            };
            this._decimal = 2;

            //bind all
            for (let obj = this; obj; obj = Object.getPrototypeOf(obj)){
                for (let name of Object.getOwnPropertyNames(obj)){
                    if (typeof this[name] === 'function'){
                        this[name] = this[name].bind(this);
                    }
                }
            }
        }

        setVisibility(show) {
            this.isVisible = Boolean(show);
        }

        setType(type) {
            this.type = type;
        }

        setMe(theObject) {
            this.$me = theObject;
        }

        setPosition(x, y) {
            this.data.position.x = this._toFixed(x);
            this.data.position.y = this._toFixed(y);
        }
        setRotation(val) {
            this.data.rotation.angle = this._toFixed(val);
        }
        setWidth(val) {
            this.data.size.width = this._toFixed(val);
        }
        setHeight(val) {
            this.data.size.height = this._toFixed(val);
        }
        setEllipsePositionX(val) {
            this.data.ellipsePosition.cx = this._toFixed(val);
        }
        setEllipsePositionY(val) {
            this.data.ellipsePosition.cy = this._toFixed(val);
        }
        setEllipseRadiusX(val) {
            this.data.ellipseRadius.rx = this._toFixed(val);
        }
        setEllipseRadiusY(val) {
            this.data.ellipseRadius.ry = this._toFixed(val);
        }
        setLineX1(val) {
            this.data.line.x1 = this._toFixed(val);
        }
        setLineY1(val) {
            this.data.line.y1 = this._toFixed(val);
        }
        setLineX2(val) {
            this.data.line.x2 = this._toFixed(val);
        }
        setLineY2(val) {
            this.data.line.y2 = this._toFixed(val);
        }

        setImageShading(val) {
            this.data.image.shading = val;
        }

        setImageThreshold(val) {
            this.data.image.threshold = val;            
        }

        render() {
            if(this.isVisible) {
                this._render();
            } else {
                this.unmount();
            }
        }

        unmount() {
            React.unmountComponentAtNode(this.reactRoot);
        }

        _toFixed(val) {
            return Number(val).toFixed(this._decimal);
        }

        _render() {
            React.render(
                <ObjectPanels
                type={this.type}
                data={this.data}
                $me={this.$me}
                />, this.reactRoot
            );
        }
    }


    return ObjectPanelsController;
});