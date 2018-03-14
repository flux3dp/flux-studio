define([
    'react',
    'reactDOM',
    'jsx!views/beambox/Object-Panels/Object-Panels',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/beambox/constant',
    'app/actions/beambox/beambox-global-interaction',
], function(
    React,
    ReactDOM,
    ObjectPanels,
    FnWrapper,
    Constant,
    BeamboxGlobalInteraction
){
    let _pixel2mm = function(pixel_input) {
        const dpmm = Constant.dpmm;
        return Number(pixel_input)/dpmm;
    };

    let _toFixed = function(val) {
        const decimal = 2;
        return Number(Number(val).toFixed(decimal));
    };

    class ObjectPanelsController {
        constructor() {
            this.reactRoot = '';
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
                rectRoundedCorner: {
                    rx: 0
                },
                line: {
                    x1:undefined, y1:undefined, x2:undefined, y2:undefined
                },
                image: {
                    threshold:undefined, shading:undefined
                },
                font: {
                    fontFamily:undefined, fontSize:undefined, fontWeight:undefined, italic:undefined, leterSpacing: undefined
                }
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

        setPosition(x, y) {
            this.data.position.x = _toFixed(_pixel2mm(x));
            this.data.position.y = _toFixed(_pixel2mm(y));
        }
        setRotation(val) {
            this.data.rotation.angle = _toFixed(val);
        }
        setWidth(val) {
            this.data.size.width = _toFixed(_pixel2mm(val));
        }
        setHeight(val) {
            this.data.size.height = _toFixed(_pixel2mm(val));
        }
        setEllipsePositionX(val) {
            this.data.ellipsePosition.cx = _toFixed(_pixel2mm(val));
        }
        setEllipsePositionY(val) {
            this.data.ellipsePosition.cy = _toFixed(_pixel2mm(val));
        }
        setEllipseRadiusX(val) {
            this.data.ellipseRadius.rx = _toFixed(_pixel2mm(val));
        }
        setEllipseRadiusY(val) {
            this.data.ellipseRadius.ry = _toFixed(_pixel2mm(val));
        }
        setRectRoundedCornerRadiusX(val) {
            this.data.rectRoundedCorner.rx = _toFixed(_pixel2mm(val));
        }
        setLineX1(val) {
            this.data.line.x1 = _toFixed(_pixel2mm(val));
        }
        setLineY1(val) {
            this.data.line.y1 = _toFixed(_pixel2mm(val));
        }
        setLineX2(val) {
            this.data.line.x2 = _toFixed(_pixel2mm(val));
        }
        setLineY2(val) {
            this.data.line.y2 = _toFixed(_pixel2mm(val));
        }

        setImageShading(val) {
            this.data.image.shading = val;
        }
        setImageThreshold(val) {
            this.data.image.threshold = val;
        }

        setFontFamily(val) {
            this.data.font.fontFamily = val;
        }
        setFontSize(val) {
            this.data.font.fontSize = val;
        }
        setFontStyle({weight, italic}) {
            this.data.font.fontWeight = weight;
            this.data.font.italic = italic;
        }
        setLetterSpacing(val) {
            this.data.font.letterSpacing = val;
        }

        isResizeFixed() {
            const useSizePanel = ['rect', 'image', 'use'];
            const useRadiusPanel = ['ellipse'];

            if(useSizePanel.includes(this.type) || useRadiusPanel.includes(this.type)) {
                return $('.object-panels #togglePreserveRatio').is(':checked');
            } else {
                return false;
            }
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
                <ObjectPanels
                    isEditable={this.isEditable}
                    type={this.type}
                    data={this.data}
                    $me={this.$me}
                />, document.getElementById(this.reactRoot)
            );
        }
    }

    const instance = new ObjectPanelsController();

    return instance;
});
