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
        _maxLength = 210;

    return React.createClass({
        propTypes: {
            lang            : React.PropTypes.object,
            model           : React.PropTypes.object,
            mode            : React.PropTypes.string,
            scaleLocked     : React.PropTypes.bool,
            onRotate        : React.PropTypes.func,
            onScale         : React.PropTypes.func,
            onScaleLock     : React.PropTypes.func,
            onResize        : React.PropTypes.func,
            onFocus         : React.PropTypes.func,
            onModeChange    : React.PropTypes.func,
            isTransforming  : React.PropTypes.func,
            style           : React.PropTypes.object
        },

        getInitialState: function() {
            this._updateSizeProperty(this.props.model.size);
            return ({
                size: _size,
                scaleLocked: this.props.scaleLocked
            });
        },

        componentDidMount: function() {
            this._openAccordion(this.props.mode);
            refSize = this.props.model.size.clone();
            this.props.onFocus(false);
        },

        componentWillReceiveProps: function(nextProps) {
            this._openAccordion(nextProps.mode);
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

        _openAccordion(name) {
            $('.accordion-switcher').prop('checked', '');
            $('.accordion-switcher').map(function(i, target) {
                if(target.name === name) {
                    $(target).prop('checked', 'checked');
                }
            });
        },

        _getLargestPropertyValue(src) {
            var p, x, y, z;
            p = 'x';
            x = src.x;
            y = src.y;
            z = src.z;

            if(x < y) { p = 'y'; }
            if(y < z) { p = 'z'; }

            return p;
        },

        _handleResize: function(src, value) {
            if(src.keyCode !== 13) {
                return;
            }
            var axis = $(src.target).attr('data-id');
            lastModifiedAxis = axis;

            if(this.state.scaleLocked) {
                _ratio = value / _size[axis];
                if(_ratio === 0) {
                    this.setState({ size: this.state.size });
                    return;
                }

                if(_size.x * _ratio > _maxLength || _size.y * _ratio > _maxLength || _size.z * _ratio > _maxLength) {
                    axis = this._getLargestPropertyValue(_size);
                    _ratio = _maxLength / _size[axis];
                }

                _size.x *= _ratio;
                _size.y *= _ratio;
                _size.z *= _ratio;
                _ratio = 1;
            }
            else {
                _size[axis] = value;
            }

            this._updateSizeProperty(_size);
            this.props.onResize(_size);

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

        _handleToggleScaleLock: function() {
            this.props.onScaleLock(_size, !this.state.scaleLocked);
            this.setState({ scaleLocked: !this.state.scaleLocked });
        },

        _handleRotationChange: function(e, value) {
            console.log(e, value);
        },

        _handleModeChange: function(e) {
            this._openAccordion(e.target.name);
            this.props.onModeChange(e.target.name);
            this.props.onFocus(false);
        },

        _getNumberOnly: function(string) {
            return parseFloat(string.replace(/[^0-9\.]+/g, ''));
        },

        _roundSizeToTwoDecimalPlace: function(src) {
            return parseFloat((Math.round(src * 100) / 100).toFixed(2));
        },

        _inputFocused: function(e) {
            this.props.onFocus(true);
        },

        _rotationKeyUp: function(e) {
            // fire on backspace
            if(e.keyCode === 8 && e.target.value !== '') {
                this.props.onRotate(e);
            }
        },

        render: function() {
            var lang            = this.props.lang,
                dialogueClass   = ClassNames('object-dialogue', {'through': this.props.isTransforming}),
                lockClass       = ClassNames('lock', { 'unlock': !this.state.scaleLocked }),
                rotation        = this.props.model.rotation;

            return (
                <div className={dialogueClass} style={this.props.style}>
                    <div className="arrow"/>
                    <div>

                    <label className="controls accordion">
                        <input
                            name="scale"
                            type="checkbox"
                            className="accordion-switcher"
                            onClick={this._handleModeChange}/>
                        <p className="caption">
                            {lang.print.scale}
                            <span className="value">{_size.x} x {_size.y} x {_size.z} mm</span>
                        </p>
                        <label className="accordion-body">

                            <div className="control">
                                <span className="text-center header">X</span>
                                    <UnitInput
                                        max={210}
                                        defaultValue={_size.x}
                                        dataAttrs={{id: 'x'}}
                                        getValue={this._handleResize}
                                        onFocus={this._inputFocused} />
                            </div>

                            <div className="control">
                                <span className="text-center header">Y</span>
                                    <UnitInput
                                        max={210}
                                        defaultValue={_size.y}
                                        dataAttrs={{id: 'y'}}
                                        getValue={this._handleResize}
                                        onFocus={this._inputFocused} />
                            </div>

                            <div className="control">
                                <span className="text-center header">Z</span>
                                    <UnitInput
                                        max={210}
                                        defaultValue={_size.z}
                                        dataAttrs={{id: 'z'}}
                                        getValue={this._handleResize}
                                        onFocus={this._inputFocused} />
                            </div>

                            <div className={lockClass} onClick={this._handleToggleScaleLock}/>
                        </label>
                    </label>

                    <label className="controls accordion">
                        <input
                            name="rotate"
                            type="checkbox"
                            className="accordion-switcher"
                            onClick={this._handleModeChange}/>
                        <p className="caption">
                            {lang.print.rotate}
                            <span className="value">{rotation.enteredX} x {rotation.enteredY} x {rotation.enteredZ} &#176;</span>
                        </p>
                        <label className="accordion-body">

                            <div className="control">
                                <span className="text-center header">X</span>
                                <input
                                    id="x"
                                    type="text"
                                    onFocus={this._inputFocused}
                                    onChange={this.props.onRotate.bind(this)}
                                    onKeyUp={this._rotationKeyUp}
                                    onBlur={this.props.onRotate.bind(this)}
                                    value={rotation.enteredX} />
                            </div>

                            <div className="control">
                                <span className="text-center header">Y</span>
                                <input
                                    id="y"
                                    type="text"
                                    onFocus={this._inputFocused}
                                    onChange={this.props.onRotate.bind(this)}
                                    onKeyUp={this._rotationKeyUp}
                                    onBlur={this.props.onRotate.bind(this)}
                                    value={rotation.enteredY} />
                            </div>

                            <div className="control">
                                <span className="text-center header">Z</span>
                                <input
                                    id="z"
                                    type="text"
                                    onFocus={this._inputFocused}
                                    onChange={this.props.onRotate.bind(this)}
                                    onKeyUp={this._rotationKeyUp}
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
