define([
    'react',
    'plugins/classnames/index',
    'jsx!widgets/Unit-Input'
], function(React, ClassNames, UnitInput) {
    'use strict';

    var refSize,
        lastModifiedAxis,
        _size,
        _ratio = 1,
        _mode = 'scale';

    return React.createClass({
        propTypes: {
            lang        : React.PropTypes.object,
            model       : React.PropTypes.object,
            scaleLocked : React.PropTypes.bool,
            onRotate    : React.PropTypes.func,
            onScale     : React.PropTypes.func,
            onResize    : React.PropTypes.func,
            style       : React.PropTypes.object
        },

        getInitialState: function() {
            this._updateSizeProperty(this.props.model.size);
            return ({
                size: _size,
                scaleLocked: this.props.scaleLocked
            });
        },

        componentDidMount: function() {
            // for rotation and scale content accordion
            var allPanels = $('.accordion > dd'),
                self = this;

            $('.accordion > dt > a').click(function() {
                var mode = $(this)[0].id;
                if(mode !== _mode) {
                    allPanels.slideUp();
                    _mode = mode;
                    $(this).parent().next().slideDown();
                    self.props.onModeChange(mode);
                }

                return false;
            });

            refSize = this.props.model.size.clone();
        },

        componentWillUpdate: function(nextProp, nextState) {
            // if update from transform control
            if(!this._hasSameSize(nextProp.model.size, refSize)) {
                refSize = nextProp.model.size.clone();
                this._updateSizeProperty(nextProp.model.size);
            }
        },

        _hasSameSize: function(size1, size2) {
            return (
                size1.x === size2.x &&
                size1.y === size2.y &&
                size1.z === size2.z
            );
        },

        _updateSizeProperty: function(size) {
            _size = size.clone();

            Object.keys(_size).map(function(p) {
                _size[p] = this._roundSizeToTwoDecimalPlace(_size[p]);
                _size['entered' + p.toUpperCase()] = _size[p].toFixed(2) + 'mm';
            }.bind(this));
        },

        _handleResize: function(src, e) {
            var axis    = src.target.id,
                _value  = this._getNumberOnly(src.target.value);

            _size['entered' + axis.toUpperCase()] = src.target.value;
            lastModifiedAxis = src.target.id;

            if(this.state.scaleLocked) {
                _ratio = _value / _size[axis];
            }

            this.setState({ size: _size });
        },

        _handleUpdateSize: function(e) {
            if(e.keyCode === 13 || e.type === 'blur') {
                _size.x = this._getNumberOnly(_size['enteredX']) * _ratio;
                _size.y = this._getNumberOnly(_size['enteredY']) * _ratio;
                _size.z = this._getNumberOnly(_size['enteredZ']) * _ratio;
                _size[lastModifiedAxis] /= _ratio;
                _ratio = 1;
                this._updateSizeProperty(_size);
                this.props.onResize(_size);
            }
        },

        _handleToggleScaleLock: function(e) {
            this.setState({ scaleLocked: !this.state.scaleLocked });
            this.props.onScaleLock(!this.state.scaleLocked);
        },

        _handleRotationChange: function(e, value) {
            console.log(e, value);
        },

        _getNumberOnly: function(string) {
            return parseFloat(string.replace(/[^0-9\.]+/g, ''));
        },

        _roundSizeToTwoDecimalPlace: function(src) {
            return parseFloat((Math.round(src * 100) / 100).toFixed(2));
        },

        render: function() {
            var lang            = this.props.lang,
                lockClass       = ClassNames('lock', { 'unlock': !this.state.scaleLocked }),
                // rotateInputFieldsClass  = ClassNames('rotateInputFields', {bottom: this.props.mode === 'rotate'}),
                // rotateClass             = ClassNames('section', {bottom: this.props.mode === 'scale'}),
                rotation        = this.props.model.rotation;

            return (
                <div className="object-dialogue" style={this.props.style}>
                    <svg className="arrow" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        width="36.8" height="20">
                        <polygon points="0,10 36.8,0 36.8,20"/>
                    </svg>
                    <div>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.print.scale}
                            <span className="value">11.1 x 22.2 x 33.3 mm</span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="text-center header">X</span>
                                    <input
                                        id="x"
                                        type="text"
                                        onChange={this._handleResize}
                                        onBlur={this._handleUpdateSize}
                                        value={_size.enteredX} />
                            </div>
                            <div className="control">
                                <span className="text-center header">Y</span>
                                    <input
                                        id="y"
                                        type="text"
                                        onChange={this._handleResize}
                                        onBlur={this._handleUpdateSize}
                                        value={_size.enteredY} />
                            </div>
                            <div className="control">
                                <span className="text-center header">Z</span>
                                    <input
                                        id="z"
                                        type="text"
                                        onChange={this._handleResize}
                                        onBlur={this._handleUpdateSize}
                                        value={_size.enteredZ} />
                            </div>
                        </label>
                    </label>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.print.rotate}
                            <span className="value">80 x 70 x 60 &#176;</span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="text-center header">X</span>
                                    <input
                                        id="x"
                                        type="text"
                                        onChange={this.props.onRotate.bind(this)}
                                        onBlur={this.props.onRotate.bind(this)}
                                        value={rotation.enteredX} />
                            </div>
                            <div className="control">
                                <span className="text-center header">Y</span>
                                <input
                                    id="y"
                                    type="text"
                                    onChange={this.props.onRotate.bind(this)}
                                    onBlur={this.props.onRotate.bind(this)}
                                    value={rotation.enteredY} />
                            </div>
                            <div className="control">
                                <span className="text-center header">Z</span>
                                <input
                                    id="z"
                                    type="text"
                                    onChange={this.props.onRotate.bind(this)}
                                    onBlur={this.props.onRotate.bind(this)}
                                    value={rotation.enteredZ} />
                            </div>
                        </label>
                    </label>
                    </div>
                </div>
            );
        }

    });
});
