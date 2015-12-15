define([
    'jquery',
    'react',
    'jsx!widgets/Radio-Group',
    'jsx!widgets/Select',
    'jsx!widgets/Unit-Input',
    'helpers/round'
], function($, React, RadioGroupView, SelectView, UnitInput, round) {
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
            var type = e.currentTarget.dataset.type,
                newParams = {
                    angle: parseFloat(this.refs.objectAngle.getDOMNode().value, 10),
                    position: {
                        x: this.refs.objectPosX.value(),
                        y: this.refs.objectPosY.value()
                    },
                    size: {
                        width: this.refs.objectSizeW.value(),
                        height: this.refs.objectSizeH.value()
                    }
                },
                ratio;

            if ('undefined' !== typeof this.refs.threshold) {
                newParams['threshold'] = parseInt(this.refs.threshold.getDOMNode().value, 10);
            }

            if (true === this.state.lockSize) {
                switch (type) {
                case 'width':
                    ratio = newParams.size.width / this.props.size.width;
                    newParams.size.height = round(newParams.size.height * ratio, -2);
                    break;
                case 'height':
                    ratio = newParams.size.height / this.props.size.height;
                    newParams.size.width = round(newParams.size.width * ratio, -2);
                    break;
                }
            }

            this.props.onTransform(e, newParams);
        },

        _lockRatio: function(which) {
            var self = this,
                state;

            return function(e) {
                e.preventDefault();

                state = {};
                state[which] = !self.state[which];

                self.setState(state);
            };
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
                    <label className="accordion-body">
                        <div className="control">
                            <input type="range" min="0" max="255" step="1" ref="threshold"
                                defaultValue={props.thresholdValue} value={props.thresholdValue}
                                onChange={this._onThresholdChanged}/>
                        </div>
                    </label>
                </label> :
                ''
            );
        },

        getInitialState: function () {
            return {
                initialPosition: {
                    top: this.props.initialPosition.top,
                    left: this.props.initialPosition.left
                },
                size: this.props.size,
                lockSize: false
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
                },
                lockerImage = {
                    size: (false === state.lockSize ? '/img/unlock.svg' : '/img/lock.svg')
                };

            return (
                <div ref="imagePanel" className={props.className} style={style}>
                    <svg className="arrow" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        width="36.8" height="20">
                        <polygon points="0,10 36.8,0 36.8,20"/>
                    </svg>
                    <div>
                        <label className="controls accordion">
                            <input type="checkbox" className="accordion-switcher"/>
                            <p className="caption">
                                {lang.laser.object_params.position.text}
                                <span className="value">{props.position.x} , {props.position.y}mm</span>
                            </p>
                            <label className="accordion-body">
                                <div className="control">
                                    <span className="text-center header">X</span>
                                    <UnitInput
                                        min={-170}
                                        max={170}
                                        dataAttrs={{ type: 'x' }}
                                        ref="objectPosX"
                                        defaultValue={props.position.x}
                                        getValue={this._onTransform}
                                    />
                                </div>
                                <div className="control">
                                    <span className="text-center header">Y</span>
                                    <UnitInput
                                        min={-170}
                                        max={170}
                                        dataAttrs={{ type: 'y' }}
                                        ref="objectPosY"
                                        defaultValue={props.position.y}
                                        getValue={this._onTransform}
                                    />
                                </div>
                            </label>
                        </label>
                        <label className="controls accordion">
                            <input type="checkbox" className="accordion-switcher"/>
                            <p className="caption">
                                {lang.laser.object_params.size.text}
                                <span className="value">{state.size.width} x {state.size.height}mm</span>
                            </p>
                            <label className="accordion-body">
                                <div className="control">
                                    <span className="text-center header">{lang.laser.object_params.size.unit.width}</span>
                                    <UnitInput
                                        min={10}
                                        max={170}
                                        dataAttrs={{ type: 'width' }}
                                        ref="objectSizeW"
                                        defaultValue={state.size.width}
                                        getValue={this._onTransform}
                                    />
                                </div>
                                <div className="control">
                                    <span className="text-center header">{lang.laser.object_params.size.unit.height}</span>
                                    <UnitInput
                                        min={10}
                                        max={170}
                                        dataAttrs={{ type: 'height' }}
                                        ref="objectSizeH"
                                        defaultValue={state.size.height}
                                        getValue={this._onTransform}
                                    />
                                </div>
                                <img className="icon-locker" src={lockerImage.size} onClick={this._lockRatio('lockSize')}/>
                            </label>
                        </label>
                        <label className="controls accordion">
                            <input type="checkbox" className="accordion-switcher"/>
                            <p className="caption">
                                {lang.laser.object_params.rotate.text}
                                <span className="value">{props.angle}°</span>
                            </p>
                            <label className="accordion-body">
                                <div className="control">
                                    <input type="number" min="0" max="360" ref="objectAngle" data-type="angle"
                                        defaultValue={props.angle} value={props.angle}
                                        onChange={this._onTransform}/>
                                </div>
                            </label>
                        </label>
                        {thresholdRange}
                    </div>
                </div>
            );
        },

        componentWillReceiveProps: function (nextProps) {
            this.setState({
                initialPosition: nextProps.initialPosition,
                size: nextProps.size,
                position: nextProps.position
            });
        }
    });
});