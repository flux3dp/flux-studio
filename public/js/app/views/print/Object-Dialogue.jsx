define([
    'react',
    'plugins/classnames/index'
], function(React, ClassNames) {
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
                <div className="objectDialogue" style={this.props.style}>
                    <dl className="accordion">

                        <dt><a id="scale" className="title" href="">{lang.print.scale}</a></dt>
                            <dd className="scale-content">

                                <div className="group">
                                    <div className="label">X</div>
                                    <div className="control">
                                        <input id="x" type="text"
                                            onChange={this._handleResize}
                                            onKeyUp={this._handleUpdateSize}
                                            onBlur={this._handleUpdateSize}
                                            value={_size.enteredX} /></div>
                                </div>

                                <div className="group">
                                    <div className="label">Y</div>
                                    <div className="control">
                                        <input id="y" type="text"
                                            onChange={this._handleResize}
                                            onKeyUp={this._handleUpdateSize}
                                            onBlur={this._handleUpdateSize}
                                            value={_size.enteredY} /></div>
                                </div>

                                <div className="group">
                                    <div className="label">Z</div>
                                    <div className="control">
                                        <input id="z" type="text"
                                            onChange={this._handleResize}
                                            onKeyUp={this._handleUpdateSize}
                                            onBlur={this._handleUpdateSize}
                                            value={_size.enteredZ} /></div>
                                </div>

                                <div className={lockClass} onClick={this._handleToggleScaleLock}>

                                </div>
                            </dd>

                        <dt><a id="rotate" className="title" href="">{lang.print.rotate}</a></dt>
                            <dd className="rotate-content">

                                <div className="group">
                                    <div className="label">X</div>
                                    <div className="control">
                                        <input id="x" type="text"
                                            onChange={this.props.onRotate.bind(this)}
                                            onBlur={this.props.onRotate.bind(this)}
                                            value={rotation.enteredX} /></div>
                                </div>

                                <div className="group">
                                    <div className="label">Y</div>
                                    <div className="control">
                                        <input id="y" type="text"
                                            onChange={this.props.onRotate.bind(this)}
                                            onBlur={this.props.onRotate.bind(this)}
                                            value={rotation.enteredY} /></div>
                                </div>

                                <div className="group">
                                    <div className="label">Z</div>
                                    <div className="control">
                                        <input id="z" type="text"
                                            onChange={this.props.onRotate.bind(this)}
                                            onBlur={this.props.onRotate.bind(this)}
                                            value={rotation.enteredZ} /></div>
                                </div>

                            </dd>
                    </dl>
                </div>
            );
        }

    });
});
