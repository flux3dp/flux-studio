define([
    'react',
    'jsx!widgets/Select',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Text-Input',
    'jsx!widgets/Unit-Input',
    'helpers/api/config',
    'plugins/classnames/index',
    'helpers/round',
    'app/actions/input-lightbox-actions',
    'jsx!widgets/File-Uploader',
    'helpers/i18n',
    'plugins/jquery/serializeObject',
    'helpers/array-findindex',
], function(
    React,
    SelectView,
    ButtonGroup,
    TextInput,
    UnitInput,
    config,
    classNames,
    round,
    InputLightboxActions,
    FileUploader,
    i18n
) {
    'use strict';

    var laserLang = i18n.lang.laser,
        advancedLang = laserLang.advanced;

    return React.createClass({

        getDefaultProps: function() {
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
                openSaveWindow: false,
                customBg: !!config().read('laser-custom-bg')
            };
        },

        // Private methods
        _getFooterButtons: function() {
            var buttonGroup = [{
                    className: 'pull-left btn-default fa fa-folder-open-o',
                    title: advancedLang.load_preset_title,
                    label: '',
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
                    title: advancedLang.save_as_preset_title,
                    label: '',
                    dataAttrs: {
                        'ga-event': 'save-as-preset'
                    },
                    onClick: this._onSaveAndApply
                },
                {
                    label: advancedLang.apply,
                    className: 'pull-right btn-default btn-apply',
                    dataAttrs: {
                        'ga-event': 'apply-laser-preset'
                    },
                    onClick: this._onApply
                },
                {
                    label: advancedLang.cancel,
                    className: 'pull-right btn-default btn-cancel',
                    dataAttrs: {
                        'ga-event': 'cancel-current-preset'
                    },
                    onClick: this._onCancel
                }];

            return buttonGroup;
        },

        _getControlButtons: function() {
            var self = this,
                buttonGroup = [
                {
                    label: (this.state.customBg ? advancedLang.removeBackground : advancedLang.background),
                    className: 'pull-left btn-default btn-cancel',
                    dataAttrs: {
                        'ga-event': 'apply-laser-background'
                    },
                    onClick: this._onCustomBackground
                },
                {
                    label: advancedLang.load_calibrate_image,
                    className: 'pull-left btn-default btn-apply',
                    dataAttrs: {
                        'ga-event': 'apply-load-calibration-image'
                    },
                    onClick: self.props.onLoadCalibrationImage
                }
                ];

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
                material = {
                    data: self.state.defaultMaterial.data
                };

            InputLightboxActions.open('save-laser-preset', {
                caption      : laserLang.save_as_preset,
                inputHeader  : laserLang.name,
                confirmText  : advancedLang.save,
                maxLength    : 20,
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

        _onCustomBackground: function(e) {
            var self = this;
            if (this.state.customBg) {
                config().write('laser-custom-bg', '');
                $('.laser-object').css({background :'url(img/laser-platform.png)', 'background-size': '100% 100%'});
                self.setState({customBg: false });
            }else {
                $('input[data-ref=importBg]').click();
            }
        },

        _onApply: function(e) {
            var material = {
                    value: 'custom',
                    label: laserLang.custom,
                    data: this.state.defaultMaterial.data
                };

            this.props.onApply(material);
        },

        _changeInputNumber: function() {
            var self = this,
                speed = self.refs.speed,
                power = self.refs.power,
                defaultMaterial;

            defaultMaterial = {
                data: {
                    laser_speed: speed.value(),
                    power: power.value() / 100 * advancedLang.form.power.max
                }
            };

            self._updateDefaultMaterial(defaultMaterial);
        },

        _changeRangeNumber: function() {
            var self = this,
                speedRange = self.refs.speedRange.getDOMNode(),
                powerRange = self.refs.powerRange.getDOMNode(),
                defaultMaterial;

            defaultMaterial = {
                data: {
                    laser_speed: parseFloat(speedRange.value, 10),
                    power: parseFloat(powerRange.value, 10)
                }
            };

            self._updateDefaultMaterial(defaultMaterial);
        },

        _updateDefaultMaterial: function(defaultMaterial) {
            defaultMaterial.label = this.state.defaultMaterial.label;
            defaultMaterial.value = this.state.defaultMaterial.value;

            this.setState({
                defaultMaterial: defaultMaterial,
                materialHasChanged: true
            });
        },

        // Lifecycle
        _renderFooter: function() {

            let buttons = this._getFooterButtons(),
                ctrlButtons = this._getControlButtons();

            return (
                <div>
                <ButtonGroup className="footer clearfix" buttons={buttons}/>
                <hr className="clearfix" />
                <ButtonGroup className="footer clearfix" buttons={ctrlButtons}/>
                </div>
            );
        },

        _renderSaveForm: function() {
            var maxLength = 10;
            return (
                <div className="form">
                    <header class="header">{advancedLang.save_as_preset}</header>
                    <div className="controls">
                        <div className="control">
                            <label className="label">{advancedLang.name}</label>
                            <TextInput ref="presetName" maxLength={maxLength}/>
                        </div>
                    </div>
                </div>
            );
        },

        _renderDefaultForm: function() {
            return (
                <form ref="advancedForm" className="form">
                    <div className="controls clearfix">
                        <div className="control">
                            <label className="label">{advancedLang.form.laser_speed.text}</label>
                            <input
                                type="range"
                                ref="speedRange"
                                data-min-text={advancedLang.form.laser_speed.slow}
                                data-max-text={advancedLang.form.laser_speed.fast}
                                min={advancedLang.form.laser_speed.min}
                                max={advancedLang.form.laser_speed.max}
                                step={advancedLang.form.laser_speed.step}
                                defaultValue={this.state.defaultMaterial.data.laser_speed}
                                value={this.state.defaultMaterial.data.laser_speed}
                                onChange={this._changeRangeNumber}
                            />
                            <UnitInput
                                ref="speed"
                                className={{ 'value-text': true }}
                                step={0.8}
                                min={advancedLang.form.laser_speed.min}
                                max={advancedLang.form.laser_speed.max}
                                defaultUnit="mm/s"
                                defaultUnitType="speed"
                                operators={['+', '-', '*']}
                                defaultValue={this.state.defaultMaterial.data.laser_speed}
                                getValue={this._changeInputNumber}
                            />
                        </div>
                    </div>
                    <div className="controls clearfix">
                        <div className="control">
                            <label className="label">{advancedLang.form.power.text}</label>
                            <input
                                type="range"
                                ref="powerRange"
                                data-min-text={advancedLang.form.power.low}
                                data-max-text={advancedLang.form.power.high}
                                min={advancedLang.form.power.min}
                                max={advancedLang.form.power.max}
                                step={advancedLang.form.power.step}
                                defaultValue={this.state.defaultMaterial.data.power}
                                value={this.state.defaultMaterial.data.power}
                                onChange={this._changeRangeNumber}
                            />
                            <UnitInput
                                ref="power"
                                className={{ 'value-text': true }}
                                min={0}
                                max={100}
                                step={1}
                                defaultUnit="%"
                                defaultUnitType="percentage"
                                defaultValue={round(this.state.defaultMaterial.data.power / advancedLang.form.power.max * 100, -2)}
                                getValue={this._changeInputNumber}
                            />
                        </div>
                    </div>
                </form>
            );
        },

        _renderFileUploader: function() {
            var style = {display: 'none'}
            return (
                <input style={style} data-ref="importBg" type="file" accept=".jpg,.png,.bmp" onChange={this._handleImport} />
            );
        },

        _handleImport: function(e) {
            var t = e.target,
                self = this;
             if (t.files.length) {
                var fr = new FileReader();
                fr.onload = function () {
                    $('.laser-object').css({background :'url(' + fr.result + ')', 'background-size': '100% 100%'});
                    config().write('laser-custom-bg', fr.result);
                    self.setState({'customBg': true});
                };
                fr.readAsDataURL(t.files[0]);
            }

        },

        render: function() {
            var form = (
                    false === this.state.openSaveWindow ?
                    this._renderDefaultForm() :
                    this._renderSaveForm()
                ),
                footer = this._renderFooter(),
                fileUploader = this._renderFileUploader();

            return (
                <div className="advanced-panel">
                    {fileUploader}
                    {form}
                    {footer}
                </div>
            );
        }

    });
});
