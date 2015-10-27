define([
    'react',
    'jsx!widgets/Radio-Group',
    'jsx!widgets/Select'
], function(React, RadioGroupView, SelectView) {
    'use strict';

    return React.createClass({
        // UI events
        _onThresholdChanged: function(e) {
            var self = this,
                trigger = function() {
                    self.props.onThresholdChanged(e.currentTarget.value);
                };

            self.setState({
                threshold: e.currentTarget.value
            });

            self._thresholdTimer = trigger();
        },

        _onTransform: function(e) {
            this.props.onTransform(e);

            var state = {
                angle: this.refs.objectAngle.getDOMNode().value,
                position: {
                    x: this.refs.objectPosX.getDOMNode().value,
                    y: this.refs.objectPosY.getDOMNode().value
                },
                size: {
                    width: this.refs.objectSizeW.getDOMNode().value,
                    height: this.refs.objectSizeH.getDOMNode().value
                }
            };

            if ('undefined' !== typeof this.refs.threshold) {
                state['threshold'] = this.refs.threshold.getDOMNode().value;
            }

            this.setState(state);
        },

        _renderThreshold: function(lang, props, state) {
            var thresholdValue = (state.threshold || props.threshold || lang.laser.object_params.threshold.default),
                thresholdDisplay = (thresholdValue / 255 * 100).toString().substr(0, 5);

            return (
                'engrave' === props.mode ?
                <label className="controls accordion">
                    <p className="caption">
                        {lang.laser.object_params.threshold.text}
                        <span className="value">{thresholdDisplay}%</span>
                    </p>
                    <input type="checkbox" className="accordion-switcher"/>
                    <div className="accordion-body">
                        <div className="control">
                            <input type="range" min="0" max="255" step="1" ref="threshold"
                                defaultValue={thresholdValue}
                                onChange={this._onThresholdChanged}/>
                        </div>
                    </div>
                </label> :
                ''
            );
        },

        render: function() {
            var props = this.props,
                state = this.state,
                lang = props.lang,
                angle = state.angle || props.angle,
                position = {
                    x: state.position.x || props.position.x,
                    y: state.position.y || props.position.y
                },
                size = {
                    width: state.size.width || props.size.width,
                    height: state.size.height || props.size.height
                },
                thresholdRange = this._renderThreshold(lang, props, state);

            return (
                <div className={props.className} style={this.props.style}>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.laser.object_params.position.text}
                            <span className="value">{position.x},{position.y}</span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="span3 text-center header">X</span>
                                <input type="number" ref="objectPosX" data-type="x" className="span9"
                                    defaultValue={position.x}
                                    onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="span3 text-center header">Y</span>
                                <input type="number" ref="objectPosY" data-type="y" className="span9"
                                    defaultValue={position.y}
                                    onChange={this._onTransform}/>
                            </div>
                        </label>
                    </label>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.laser.object_params.size.text}
                            <span className="value">{size.width}mm*{size.height}mm</span>
                        </p>
                        <div className="accordion-body">
                            <div className="control">
                                <span className="span3 text-center header">{lang.laser.object_params.size.unit.width}</span>
                                <input type="number" min="0" ref="objectSizeW" step="0.1" data-type="width" className="span9"
                                    defaultValue={size.width}
                                    onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="span3 text-center header">{lang.laser.object_params.size.unit.height}</span>
                                <input type="number" min="0" ref="objectSizeH" step="0.1" data-type="height" className="span9"
                                    defaultValue={size.height}
                                    onChange={this._onTransform}/>
                            </div>
                        </div>
                    </label>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.laser.object_params.rotate.text}
                            <span className="value">{angle}</span>
                        </p>
                        <div className="accordion-body">
                            <div className="control">
                                <input type="number" min="0" max="360" ref="objectAngle" data-type="angle" className="span4"
                                    defaultValue={angle}
                                    onChange={this._onTransform}/>
                            </div>
                        </div>
                    </label>
                    {thresholdRange}
                </div>
            );
        },

        getInitialState: function () {
            return {
                angle: this.props.angle,
                position: this.props.position,
                size: this.props.size,
                threshold: this.props.threshold
            };
        },

        getDefaultProps: function() {
            return {
                onThresholdChanged: React.PropTypes.func,
                onTransform: React.PropTypes.func,
                style: React.PropTypes.object,
                mode: React.PropTypes.string,
                angle: React.PropTypes.string,
                position: React.PropTypes.object,
                size: React.PropTypes.object,
                threshold: React.PropTypes.string
            };
        }

    });
});