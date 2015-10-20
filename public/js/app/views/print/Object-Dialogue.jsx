define([
    'react',
    'plugins/classnames/index'
], function(React, ClassNames) {
    'use strict';

    var _size,
        _mode = 'scale';

    return React.createClass({
        propTypes: {
            lang: React.PropTypes.object,
            model: React.PropTypes.object,
            onRotate: React.PropTypes.func,
            onScale: React.PropTypes.func,
            onResize: React.PropTypes.func,
            style: React.PropTypes.object
        },
        getInitialState: function() {
            this._updateSizeProperty(this.props.model.size);
            return ({
                size: _size
            });
        },
        componentWillUpdate: function(nextProp) {
            this._updateSizeProperty(nextProp.model.size);
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

        },
        _updateSizeProperty: function(size) {
            _size = size.clone();
            Object.keys(_size).map(function(p) {
                _size[p] = this._roundSizeToTwoDecimalPlace(_size[p]);
                _size['entered' + p.toUpperCase()] = _size[p].toFixed(2) + 'mm';
            }.bind(this));
        },
        _handleResize: function(src) {
            var axis    = src.target.id,
                _value  = this._getNumberOnly(src.target.value),
                changed = false;

            _size['entered' + src.target.id.toUpperCase()] = src.target.value;

            if(typeof(_value) === 'number' && !isNaN(_value) && _value !== 0) {
                _size[axis] = this._roundSizeToTwoDecimalPlace(_value);
                changed = true;
            }

            if(src.type === 'blur') {
                var v = this._roundSizeToTwoDecimalPlace(_value);
                _size['entered' + src.target.id.toUpperCase()] = isNaN(v) ? _size[axis] : v.toFixed(2) + 'mm';
                changed = true;
            }
            // else {
            //     console.log(src.target.value);
            // }

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
                // rotateInputFieldsClass  = ClassNames('rotateInputFields', {bottom: this.props.mode === 'rotate'}),
                // rotateClass             = ClassNames('section', {bottom: this.props.mode === 'scale'}),
                rotation                = this.props.model.rotation;

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
                                            value={_size.enteredY} /></div>
                                </div>
                                <div className="group">
                                    <div className="label">Z</div>
                                    <div className="control">
                                        <input id="z" type="text"
                                            onChange={this._handleResize.bind(this)}
                                            onBlur={this._handleResize.bind(this)}
                                            value={_size.enteredZ} /></div>
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
