define([
    'react',
    'plugins/classnames/index',
    'jsx!widgets/Unit-Input'
], function(React, ClassNames, UnitInput) {
    'use strict';

    var refSize,
        lastModifiedAxis,
        throttle,
        _size,
        rotation = {},
        _ratio = 1,
        _maxLength = 210,
        cursors = {},
        prevState = "";

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
            isTransforming  : React.PropTypes.bool,
            style           : React.PropTypes.object
        },

        getInitialState: function() {
            this._updateSizeProperty(this.props.model.size);
            return ({
                _size: _size,
                scaleLocked: this.props.scaleLocked
            });
        },

        componentWillMount: function() {
            rotation.x = this.props.model.rotation.x;
            rotation.y = this.props.model.rotation.y;
            rotation.z = this.props.model.rotation.z;

            rotation.enteredX = this.props.model.rotation.enteredX;
            rotation.enteredY = this.props.model.rotation.enteredY;
            rotation.enteredZ = this.props.model.rotation.enteredZ;
        },

        componentDidMount: function() {
            this._openAccordion(this.props.mode);
            refSize = this.props.model.size.clone();
            this._updateSizeProperty(refSize);
            this.props.onFocus(false);
        },

        componentWillReceiveProps: function(nextProps) {
            this._openAccordion(nextProps.mode);
            rotation.x = this.props.model.rotation.x;
            rotation.y = this.props.model.rotation.y;
            rotation.z = this.props.model.rotation.z;

            rotation.enteredX = this.props.model.rotation.enteredX;
            rotation.enteredY = this.props.model.rotation.enteredY;
            rotation.enteredZ = this.props.model.rotation.enteredZ;
        },

        componentWillUpdate: function(nextProp, nextState) {
            // update from transform control
            if(!this._hasSameSize(nextProp.model.size, refSize)) {
                refSize = nextProp.model.size.clone();
                _size.originalX = refSize.originalX;
                _size.originalY = refSize.originalY;
                _size.originalZ = refSize.originalZ;
                this._updateSizeProperty(nextProp.model.size);
            }
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            var tmp = Object.assign({}, rotation);

            Object.assign(tmp, nextState);
            Object.assign(tmp, { isTransforming: nextProps.isTransforming, mode: nextProps.mode, size: nextProps.model.size, style: nextProps.style, scaleLocked: nextProps.scaleLocked });
            var updateContent = JSON.stringify(tmp);
            if (prevState == updateContent) return false;
            prevState = updateContent;
            return true;
        },

        _hasSameSize: function(size1, size2) {
            return (
                size1.x === size2.x &&
                size1.y === size2.y &&
                size1.z === size2.z
            );
        },

        _updateSizeProperty: function(size) {
            if (_size == null) {
                _size = size.clone();
                _size['originalX'] = size.originalX;
                _size['originalY'] = size.originalY;
                _size['originalZ'] = size.originalZ;
            } else {
                Object.assign(_size, size);
            }

            // calculate scale number
            _size.sx = 100 * _size.x / _size.originalX;
            _size.sy = 100 * _size.y / _size.originalY;
            _size.sz = 100 * _size.z / _size.originalZ;

            Object.keys(_size).map(function(p) {
                if(p.length > 1) return;
                _size[p] = this._roundSizeToTwoDecimalPlace(_size[p]);
                _size['entered' + p.toUpperCase()] = _size[p].toFixed(2) + 'mm';
            }.bind(this));

            this.setState({_size: _size});
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

            console.log("handle resize 1", axis, value);
            // scale control
            if(axis.charAt(0) == 's') {
                axis = axis.substring(1);
                value = _size['original' + axis.toUpperCase()] * value / 100.0;
            }

            lastModifiedAxis = axis;

            console.log("handle resize 2", axis, value);

            if(this.state.scaleLocked) {
                _ratio = value / _size[axis];
                if(_ratio === 0) {
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

        _handleRotationChange: function(e) {
            if(e.type === 'blur') {
                rotation['entered' + e.target.id.toUpperCase()] = parseInt(e.target.value) || 0;
                this.props.onRotate(rotation);
                this.forceUpdate();
                return;
            }

            if(e.keyCode === 13) {
                rotation.enteredX = rotation.enteredX || 0;
                rotation.enteredY = rotation.enteredY || 0;
                rotation.enteredZ = rotation.enteredZ || 0;
                this.props.onRotate(rotation);
            }
            else {
                rotation['entered' + e.target.id.toUpperCase()] = e.target.value;
                this.forceUpdate();
            }

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
            if(e.keyCode === 13) {
            }

            if(e.keyCode === 8 && e.target.value === '') {
                clearTimeout(throttle);
                throttle = setTimeout(function() {
                    rotation.enteredX = parseInt($('#x').val()) || 0;
                    rotation.enteredY = parseInt($('#y').val()) || 0;
                    rotation.enteredZ = parseInt($('#z').val()) || 0;
                    this.props.onRotate(rotation);
                }.bind(this), 500);
            }
        },

        render: function() {
            var lang            = this.props.lang,
                dialogueClass   = ClassNames('object-dialogue', {'through': this.props.isTransforming}),
                lockClass       = ClassNames('lock', { 'unlock': !this.state.scaleLocked });

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
                            <span className="value">{this.state._size.x} x {this.state._size.y} x {this.state._size.z} mm</span>
                        </p>
                        <label className="accordion-body">

                            <div className="control">
                                <span className="text-center header">X</span>
                                    <UnitInput
                                        className={{"p66": true}}
                                        max={210}
                                        min={0.01}
                                        defaultValue={this.state._size.x}
                                        dataAttrs={{id: 'x'}}
                                        getValue={this._handleResize}
                                        ref = 'input-x'
                                        onFocus={this._inputFocused} />
                                    <UnitInput
                                        className={{"p33": true}}
                                        max={5000}
                                        min={0.000001}
                                        defaultUnit={'%'}
                                        defaultUnitType={'percentage'}
                                        defaultValue={this.state._size.sx}
                                        dataAttrs={{id: 'sx'}}
                                        getValue={this._handleResize}
                                        ref = 'input-sx'
                                        onFocus={this._inputFocused} />
                            </div>

                            <div className="control">
                                <span className="text-center header">Y</span>
                                    <UnitInput
                                        className={{"p66": true}}
                                        max={210}
                                        min={0.05}
                                        defaultValue={this.state._size.y}
                                        dataAttrs={{id: 'y'}}
                                        getValue={this._handleResize}
                                        ref = 'input-y'
                                        onFocus={this._inputFocused} />
                                    <UnitInput
                                        className={{"p33": true}}
                                        max={100}
                                        min={0.000001}
                                        defaultUnit={'%'}
                                        defaultUnitType={'percentage'}
                                        defaultValue={this.state._size.sx}
                                        dataAttrs={{id: 'sy'}}
                                        getValue={this._handleResize}
                                        ref = 'input-sy'
                                        onFocus={this._inputFocused} />
                            </div>

                            <div className="control">
                                <span className="text-center header">Z</span>
                                    <UnitInput
                                        className={{"p66": true}}
                                        max={210}
                                        min={0.05}
                                        defaultValue={this.state._size.z}
                                        dataAttrs={{id: 'z'}}
                                        getValue={this._handleResize}
                                        ref = 'input-z'
                                        onFocus={this._inputFocused} />
                                    <UnitInput
                                        className={{"p33": true}}
                                        max={100}
                                        min={0.000001}
                                        defaultUnit={'%'}
                                        defaultUnitType={'percentage'}
                                        defaultValue={_size.sx}
                                        dataAttrs={{id: 'sz'}}
                                        getValue={this._handleResize}
                                        ref = 'input-sz'
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
                                <span className="text-center header axis-red">X</span>
                                <input
                                    id="x"
                                    type="text"
                                    onFocus={this._inputFocused}
                                    onChange={this._handleRotationChange.bind(this)}
                                    onKeyUp={this._handleRotationChange.bind(this)}
                                    onBlur={this._handleRotationChange.bind(this)}
                                    ref = 'input-rx'
                                    value={rotation.enteredX} />
                            </div>

                            <div className="control">
                                <span className="text-center header axis-green">Y</span>
                                <input
                                    id="y"
                                    type="text"
                                    onFocus={this._inputFocused}
                                    onChange={this._handleRotationChange.bind(this)}
                                    onKeyUp={this._handleRotationChange.bind(this)}
                                    onBlur={this._handleRotationChange.bind(this)}
                                    ref = 'input-ry'
                                    value={rotation.enteredY} />
                            </div>

                            <div className="control">
                                <span className="text-center header axis-blue">Z</span>
                                <input
                                    id="z"
                                    type="text"
                                    onFocus={this._inputFocused}
                                    onChange={this._handleRotationChange.bind(this)}
                                    onKeyUp={this._handleRotationChange.bind(this)}
                                    onBlur={this._handleRotationChange.bind(this)}
                                    ref = 'input-rz'
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
