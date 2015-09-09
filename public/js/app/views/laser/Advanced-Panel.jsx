define([
    'jquery',
    'react',
    'jsx!widgets/Select',
    'helpers/api/config',
    'plugins/jquery/serializeObject',
    'helpers/array-findindex',
], function($, React, SelectView, config) {
    'use strict';

    return React.createClass({
        _handleMaterialChange: function(e) {
            var $self = $(e.currentTarget).find('option:selected'),
                data = $self.data('meta'),
                refs = this.refs,
                materials = this.state.materials;

            refs.speedRange.getDOMNode().value = data.laser_speed;
            refs.powerRange.getDOMNode().value = data.power;
            refs.speed.getDOMNode().textContent = data.laser_speed;
            refs.power.getDOMNode().textContent = data.power;
        },

        _handleCancel: function(e) {
            this.props.onCancel(e);
        },

        _handleDone: function(e) {
            this.props.onDone(this._getSetting());
        },

        _getSetting: function() {
            return $(this.refs.advancedForm.getDOMNode()).serializeObject();
        },

        _changeRangeNumber: function(target) {
            var self = this,
                materials = this.state.materials;

            return function(e) {
                var el = React.findDOMNode(self.refs[target]);

                if ('undefined' !== typeof el) {
                    el.textContent = e.currentTarget.value;
                }
            };
        },

        _handleRangeMouseUp: function(e) {
            var self = this,
                refs = self.refs,
                materials = self.state.materials,
                custom_option = {
                    value: 'custom',
                    label: self.props.lang.laser.custom,
                    selected: true,
                    data: {
                        laser_speed: parseFloat(refs.speedRange.getDOMNode().value, 10),
                        power: parseInt(refs.powerRange.getDOMNode().value, 10)
                    }
                },
                customIndex = materials.findIndex(function(el) {
                    return el.value === custom_option.value;
                });

            config().write(
                'custom-material',
                JSON.stringify(custom_option),
                {
                    onFinished: function(response) {
                        if (-1 === customIndex) {
                            materials.push(custom_option);
                            self.setState({
                                materials: materials,
                                defaultMaterial: custom_option
                            });
                        }
                        else {
                            // replace custom material
                            materials[customIndex] = custom_option;
                        }
                    }
                }
            );
        },

        _renderFooter: function(lang) {
            return (
                <footer className="footer">
                    <button className="btn btn-default" onClick={this._handleCancel}>{lang.cancel}</button>
                    <button className="btn btn-confirm" onClick={this._handleDone}>{lang.apply}</button>
                </footer>
            );
        },

        render: function() {
            var self = this,
                lang = this.props.lang.laser.advanced,
                footer = this._renderFooter(lang);

            return (
                <div className="advanced-panel">

                    <header className="header">{lang.label}</header>

                    <form ref="advancedForm" className="form">
                        <div className="controls clearfix">
                            <label className="label">{lang.form.object_options.label}</label>
                            <div className="control">
                                <SelectView
                                    name="material"
                                    defaultValue={this.state.defaultMaterial.value}
                                    options={this.state.materials}
                                    onChange={this._handleMaterialChange}
                                />
                            </div>
                        </div>
                        <div className="controls clearfix">
                            <label className="label">{lang.form.laser_speed.text}</label>
                            <div className="control">
                                <input
                                    name="laser_speed"
                                    type="range"
                                    ref="speedRange"
                                    data-min-text={lang.form.laser_speed.slow}
                                    data-max-text={lang.form.laser_speed.fast}
                                    min={lang.form.laser_speed.min}
                                    max={lang.form.laser_speed.max}
                                    step={lang.form.laser_speed.step}
                                    defaultValue={this.state.defaultMaterial.data.laser_speed}
                                    onChange={this._changeRangeNumber('speed')}
                                    onMouseUp={this._handleRangeMouseUp}
                                />
                                <span ref="speed" data-tail={lang.form.laser_speed.unit}>
                                    {this.props.defaultMaterial.data.laser_speed}
                                </span>
                            </div>
                        </div>
                        <div className="controls clearfix">
                            <label className="label">{lang.form.power.text}</label>
                            <div className="control">
                                <input
                                    name="power"
                                    type="range"
                                    ref="powerRange"
                                    data-min-text={lang.form.power.low}
                                    data-max-text={lang.form.power.high}
                                    min={lang.form.power.min}
                                    max={lang.form.power.max}
                                    step={lang.form.power.step}
                                    defaultValue={this.state.defaultMaterial.data.power}
                                    onChange={this._changeRangeNumber('power')}
                                    onMouseUp={this._handleRangeMouseUp}
                                />
                                <span ref="power">
                                    {this.props.defaultMaterial.data.power}
                                </span>
                            </div>
                        </div>
                    </form>

                    {footer}

                </div>
            );
        },

        getDefaultProps: function() {
            var self = this;

            return {
                lang: React.PropTypes.object,
                defaultMaterial: React.PropTypes.object,
                materials: React.PropTypes.array,
                openAdvancedPanel: React.PropTypes.bool,
                onCancel: React.PropTypes.func,
                onDone : React.PropTypes.func
            };
        },

        getInitialState: function() {
            return {
                defaultMaterial: this.props.defaultMaterial,
                materials: this.props.materials
            };
        }

    });
});