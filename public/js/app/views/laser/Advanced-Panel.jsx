define([
    'jquery',
    'react',
    'jsx!widgets/Select',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Text-Input',
    'helpers/api/config',
    'helpers/round',
    'plugins/jquery/serializeObject',
    'helpers/array-findindex',
], function($, React, SelectView, ButtonGroup, TextInput, config, round) {
    'use strict';

    return React.createClass({
        // Private methods
        _openSaveForm: function(open) {
            this.setState({
                openSaveWindow: open
            });
        },

        _getFooterButtons: function(lang) {
            var self = this,
                buttonGroup = {
                    default: [{
                        label: lang.load_preset,
                        onClick: this._onLoadPreset
                    },
                    {
                        label: lang.apply,
                        onClick: this._onApply
                    },
                    {
                        label: lang.save_as_preset,
                        className: 'btn-default' + (true === this.state.materialHasChanged ? '' : ' btn-disabled'),
                        onClick: this._onSaveStarting
                    }],
                    save: [{
                        label: lang.save_and_apply,
                        onClick: self._onSaveAndApply
                    },
                    {
                        label: lang.cancel,
                        onClick: function() {
                            self._openSaveForm(false);
                        }
                    }]
                };

            return (
                false === this.state.openSaveWindow ?
                buttonGroup.default :
                buttonGroup.save
            );
        },

        _applySetting: function(e) {
            this.props.onDone();
        },

        // UI Events
        _onLoadPreset: function(e) {
            this.props.onLoadPreset(e);
        },

        _onCancel: function(e) {
            this.props.onClose(e);
        },

        _onSaveAndApply: function(e) {
            var lang = this.props.lang,
                value = this.refs.presetName.value(),
                refs = this.refs,
                material = {
                    value: value,
                    label: value,
                    data: this.state.defaultMaterial.data
                };

            if (true === this.props.onSave(material)) {
                this.props.onApply(material);
            }
        },

        _onApply: function(e) {
            var lang = this.props.lang,
                refs = this.refs,
                material = {
                    value: 'custom',
                    label: lang.laser.custom,
                    data: this.state.defaultMaterial.data
                };

            this.props.onApply(material);
        },

        _onSaveStarting: function(e) {
            this._openSaveForm(true);
        },

        _changeRangeNumber: function(target) {
            var self = this;

            return function(e) {
                var speedRange = self.refs.speedRange.getDOMNode(),
                    powerRange = self.refs.powerRange.getDOMNode(),
                    defaultMaterial = self.state.defaultMaterial;

                // changed state
                defaultMaterial.data.laser_speed = parseFloat(speedRange.value, 10);
                defaultMaterial.data.power = parseFloat(powerRange.value, 10);

                self.setState({
                    materialHasChanged: true
                });
            };
        },

        // Lifecycle
        _renderFooter: function(lang) {
            lang = lang.advanced;

            var buttons = this._getFooterButtons(lang);

            return (
                <ButtonGroup className="footer btn-h-group" buttons={buttons}/>
            );
        },

        _renderSaveForm: function(lang) {
            return (
                <div className="form">
                    <header class="header">{lang.save_as_preset}</header>
                    <div className="controls">
                        <div className="control">
                            <label className="label">{lang.name}</label>
                            <TextInput ref="presetName"/>
                        </div>
                    </div>
                </div>
            );
        },

        _renderDefaultForm: function(lang) {
            lang = lang.advanced;

            return (
                <form ref="advancedForm" className="form">
                    <div className="controls clearfix">
                        <div className="control">
                            <label className="label">{lang.form.laser_speed.text}</label>
                            <input
                                type="range"
                                ref="speedRange"
                                data-min-text={lang.form.laser_speed.slow}
                                data-max-text={lang.form.laser_speed.fast}
                                min={lang.form.laser_speed.min}
                                max={lang.form.laser_speed.max}
                                step={lang.form.laser_speed.step}
                                defaultValue={this.state.defaultMaterial.data.laser_speed}
                                onChange={this._changeRangeNumber('speed')}
                            />
                            <span ref="speed" data-tail={lang.form.laser_speed.unit} className="value-text">
                                {this.state.defaultMaterial.data.laser_speed}
                            </span>
                        </div>
                    </div>
                    <div className="controls clearfix">
                        <div className="control">
                            <label className="label">{lang.form.power.text}</label>
                            <input
                                type="range"
                                ref="powerRange"
                                data-min-text={lang.form.power.low}
                                data-max-text={lang.form.power.high}
                                min={lang.form.power.min}
                                max={lang.form.power.max}
                                step={lang.form.power.step}
                                defaultValue={this.state.defaultMaterial.data.power}
                                onChange={this._changeRangeNumber('power')}
                            />
                            <span ref="power" data-tail="%" className="value-text">
                                {round(this.state.defaultMaterial.data.power / lang.form.power.max * 100, -2)}
                            </span>
                        </div>
                    </div>
                </form>
            );
        },

        render: function() {
            var self = this,
                lang = this.props.lang.laser,
                form = (
                    false === this.state.openSaveWindow ?
                    this._renderDefaultForm(lang) :
                    this._renderSaveForm(lang)
                ),
                footer = this._renderFooter(lang);

            return (
                <div className="advanced-panel">
                    {form}
                    {footer}
                </div>
            );
        },

        getDefaultProps: function() {
            var self = this;

            return {
                lang: React.PropTypes.object,
                defaultMaterial: React.PropTypes.object,
                onLoadPreset: React.PropTypes.func,
                onClose: React.PropTypes.func,
                onSave: React.PropTypes.func,
                onDone : React.PropTypes.func
            };
        },

        getInitialState: function() {
            return {
                defaultMaterial: this.props.defaultMaterial,
                materialHasChanged: false,
                openSaveWindow: false
            };
        }

    });
});