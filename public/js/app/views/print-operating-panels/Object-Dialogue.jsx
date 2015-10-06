define([
    'react',
    'plugins/classnames/index'
], function(React, ClassNames) {
    'use strict';

    var _size;

    return React.createClass({
        getDefaultProps: function() {
            return {
                lang: React.PropTypes.object,
                onRotate: React.PropTypes.func,
                onScale: React.PropTypes.func
            };
        },
        getInitialState: function() {
            _size = this.props.model.size.clone();
            Object.keys(_size).map(function(p) {
                _size[p] = this._roundSizeToTwoDecimalPlace(_size[p]);
                _size['entered' + p.toUpperCase()] = _size[p].toFixed(2) + 'mm';
            }.bind(this));

            return ({
                size: _size
            });
        },
        _handleResize: function(src) {
            var axis    = src.target.id,
                _value  = this._getNumberOnly(src.target.value),
                changed = false;

            if(typeof(_value) === 'number' && !isNaN(_value)) {
                _size[axis] = this._roundSizeToTwoDecimalPlace(_value);
                changed = true;
            }

            if(src.type === 'blur') {
                var v = this._roundSizeToTwoDecimalPlace(_value);
                _size['entered' + src.target.id.toUpperCase()] = isNaN(v) ? _size[axis] : v.toFixed(2) + 'mm';
                changed = true;
            }
            else {
                _size['entered' + src.target.id.toUpperCase()] = src.target.value;
            }

            if(changed) {
                this.props.onResize(_size);
            }

            this.setState({ size: _size });
        },
        _getNumberOnly: function(string) {
            return parseFloat(string.replace(/[^0-9\.]+/g, ''));
        },
        _roundSizeToTwoDecimalPlace: function(src) {
            return parseFloat((Math.round(src * 100) / 100).toFixed(2));
        },
        render: function() {
            var lang                    = this.props.lang,
                rotateInputFieldsClass  = ClassNames('rotateInputFields', {bottom: this.props.mode === 'rotate'}),
                rotateClass             = ClassNames('section', {bottom: this.props.mode === 'scale'}),
                rotation                = this.props.model.rotation;

            // this._roundSizeToTwoDecimalPlace(size);

            return (
                <div className="objectDialogue" style={this.props.style}>
                    <dl className="accordion">

                        <dt><a id="scale" className="title" href="">{lang.print.scale}</a></dt>
                            <dd className="scale-content">
                                <div className="group">
                                    <div className="label">X</div>
                                    <div className="control">
                                        <input id="x" type="text"
                                            onChange={this._handleResize.bind(this)}
                                            onBlur={this._handleResize.bind(this)}
                                            value={this.state.size.enteredX} /></div>
                                </div>
                                <div className="group">
                                    <div className="label">Y</div>
                                    <div className="control">
                                        <input id="y" type="text"
                                            onChange={this._handleResize.bind(this)}
                                            onBlur={this._handleResize.bind(this)}
                                            value={this.state.size.enteredY} /></div>
                                </div>
                                <div className="group">
                                    <div className="label">Z</div>
                                    <div className="control">
                                        <input id="z" type="text"
                                            onChange={this._handleResize.bind(this)}
                                            onBlur={this._handleResize.bind(this)}
                                            value={this.state.size.enteredZ} /></div>
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
