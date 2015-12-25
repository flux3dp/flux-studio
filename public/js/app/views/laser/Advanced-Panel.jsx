define([
    'react',
    'jsx!widgets/Select',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Text-Input',
    'helpers/api/config',
    'plugins/classnames/index',
    'helpers/round',
    'app/actions/input-lightbox-actions',
    'plugins/jquery/serializeObject',
    'helpers/array-findindex',
], function(
    React,
    SelectView,
    ButtonGroup,
    TextInput,
    config,
    classNames,
    round,
    InputLightboxActions
) {
    'use strict';

    return React.createClass({

        // Private methods
        _getFooterButtons: function(lang) {
            var self = this,
                buttonGroup = [{
                    className: 'pull-left btn-default fa fa-folder-open-o',
                    title: lang.load_preset_title,
                    dataAttrs: {
                        'ga-event': 'load-laser-preset'
                    },
                    onClick: this._onLoadPreset
                },
                {
                    className: classNames({
                        'pull-left btn-default fa fa-floppy-o': true,
                        'btn-disabled': false === this.state.materialHasChanged
                    }),
                    title: lang.save_as_preset_title,
                    dataAttrs: {
                        'ga-event': 'save-as-preset'
                    },
                    onClick: this._onSaveAndApply
                },
                {
                    label: lang.apply,
                    className: 'pull-right btn-default btn-apply',
                    dataAttrs: {
                        'ga-event': 'apply-laser-preset'
                    },
                    onClick: this._onApply
                },
                {
                    label: lang.cancel,
                    className: 'pull-right btn-default btn-cancel',
                    dataAttrs: {
                        'ga-event': 'cancel-current-preset'
                    },
                    onClick: this._onCancel
                }];

            return buttonGroup;
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
            var self = this,
                lang = self.props.lang,
                refs = self.refs,
                material = {
                    data: self.state.defaultMaterial.data
                };

            InputLightboxActions.open('save-laser-preset', {
                caption      : lang.laser.save_as_preset,
                inputHeader  : lang.laser.name,
                confirmText  : lang.laser.advanced.save,
                onSubmit     : function(presetName) {
                    var canSave = ('' !== presetName);

                    if (true === canSave) {
                        material.value = presetName;
                        material.label = presetName;

                        if (true === self.props.onSave(material)) {
                            self.props.onApply(material);
                        }
                    }

                    return '' !== presetName;
                }
            });
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
                <ButtonGroup className="footer clearfix" buttons={buttons}/>
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