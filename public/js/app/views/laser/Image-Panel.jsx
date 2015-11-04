define([
    'jquery',
    'react',
    'jsx!widgets/Radio-Group',
    'jsx!widgets/Select',
    'helpers/round'
], function($, React, RadioGroupView, SelectView, round) {
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
            var newParams = {
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
                newParams['threshold'] = this.refs.threshold.getDOMNode().value;
            }

            this.props.onTransform(e, newParams);
        },

        _renderThreshold: function(lang, props, state) {
            var thresholdValue = (state.threshold || lang.laser.object_params.threshold.default),
                thresholdDisplay = round(thresholdValue / lang.laser.advanced.form.power.max * 100, 0);

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
                                defaultValue={props.thresholdValue} value={props.thresholdValue}
                                onChange={this._onThresholdChanged}/>
                        </div>
                    </div>
                </label> :
                ''
            );
        },

        getInitialState: function () {
            return {
                initialPosition: {
                    top: this.props.initialPosition.top,
                    left: this.props.initialPosition.left
                }
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
                threshold: React.PropTypes.string,
                initialPosition: React.PropTypes.object
            };
        },

        render: function() {
            var props = this.props,
                state = this.state,
                lang = props.lang,
                thresholdRange = this._renderThreshold(lang, props, state),
                style = {
                    top: state.initialPosition.top,
                    left: state.initialPosition.left
                };

            return (
                <div ref="objectPanel" className={props.className} style={style}>
                    <svg className="arrow" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        width="36.8" height="20">
                        <polygon points="0,10 36.8,0 36.8,20"/>
                    </svg>
                    <div>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.laser.object_params.position.text}
                            <span className="value">{props.position.x} , {props.position.y}</span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="span3 text-center header">X</span>
                                <input type="number" ref="objectPosX" data-type="x" className="span9"
                                    defaultValue={props.position.x} value={props.position.x}
                                    onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="span3 text-center header">Y</span>
                                <input type="number" ref="objectPosY" data-type="y" className="span9"
                                    defaultValue={props.position.y} value={props.position.y}
                                    onChange={this._onTransform}/>
                            </div>
                        </label>
                    </label>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.laser.object_params.size.text}
                            <span className="value">{props.size.width} x {props.size.height}mm</span>
                        </p>
                        <div className="accordion-body">
                            <div className="control">
                                <span className="span3 text-center header">{lang.laser.object_params.size.unit.width}</span>
                                <input type="number" min="0" ref="objectSizeW" step="0.1" data-type="width" className="span9"
                                    defaultValue={props.size.width} value={props.size.width}
                                    onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="span3 text-center header">{lang.laser.object_params.size.unit.height}</span>
                                <input type="number" min="0" ref="objectSizeH" step="0.1" data-type="height" className="span9"
                                    defaultValue={props.size.height} value={props.size.height}
                                    onChange={this._onTransform}/>
                            </div>
                        </div>
                    </label>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.laser.object_params.rotate.text}
                            <span className="value">{props.angle}°</span>
                        </p>
                        <div className="accordion-body">
                            <div className="control">
                                <input type="number" min="0" max="360" ref="objectAngle" data-type="angle" className="span4"
                                    defaultValue={props.angle} value={props.angle}
                                    onChange={this._onTransform}/>
                            </div>
                        </div>
                    </label>
                    {thresholdRange}
                    </div>
                </div>
            );
        },

        componentWillReceiveProps: function (nextProps) {
            this.setState({
                initialPosition: nextProps.initialPosition
            })
        }
    });
});