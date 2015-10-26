define([
    'react',
    'jsx!widgets/Radio-Group',
    'jsx!widgets/Select'
], function(React, RadioGroupView, SelectView) {
    'use strict';

    return React.createClass({
        // UI events
        _onThresholdChanged: function(e) {
            this.props.onThresholdChanged(e, e.currentTarget.value);
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

        render: function() {
            var props = this.props,
                state = this.state,
                lang = props.lang,
                angle = state.angle || props.angle,
                threshold = state.threshold || props.threshold || lang.laser.object_params.threshold.default,
                position = {
                    x: state.position.x || props.position.x,
                    y: state.position.y || props.position.y
                },
                size = {
                    width: state.size.width || props.size.width,
                    height: state.size.height || props.size.height
                },
                threshold = (
                    'engrave' === this.props.mode ?
                    <label className="controls accordion">
                        <p className="caption">
                            {lang.laser.object_params.threshold.text}
                            <span className="value">{threshold}</span>
                        </p>
                        <input type="checkbox" className="accordion-switcher"/>
                        <div className="accordion-body">
                            <div className="control">
                                <input type="range" min="0" max="255" ref="threshold"
                                    defaultValue={threshold}
                                    onChange={this._onThresholdChanged}/>
                            </div>
                        </div>
                    </label> :
                    ''
                );

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
                                    onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="span3 text-center header">Y</span>
                                <input type="number" ref="objectPosY" data-type="y" className="span9"
                                    onChange={this._onTransform}/>
                            </div>
                        </label>
                    </label>
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.laser.object_params.size.text}
                            <span className="value">{size.width}*{size.height}</span>
                        </p>
                        <div className="accordion-body">
                            <div className="control">
                                <span className="span3 text-center header">{lang.laser.object_params.size.unit.width}</span>
                                <input type="number" min="0" ref="objectSizeW" step="0.1" data-type="width" className="span9"
                                    onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="span3 text-center header">{lang.laser.object_params.size.unit.height}</span>
                                <input type="number" min="0" ref="objectSizeH" step="0.1" data-type="height" className="span9"
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
                                    onChange={this._onTransform}/>
                            </div>
                        </div>
                    </label>
                    {threshold}
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