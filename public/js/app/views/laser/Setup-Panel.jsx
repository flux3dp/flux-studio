define([
    'jquery',
    'react',
    'reactDOM',
    'reactClassset',
    'jsx!widgets/Select',
    'jsx!widgets/List',
    'jsx!widgets/Modal',
    'jsx!views/laser/Advanced-Panel',
    'jsx!widgets/Text-Toggle',
    'jsx!widgets/Unit-Input',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Alert',
    'app/actions/alert-actions',
    'jsx!widgets/Dialog-Menu',
    'helpers/api/config',
    'helpers/i18n',
    'helpers/round',
    'plugins/classnames/index'
], function(
    $,
    React,
    ReactDOM,
    ReactCx,
    SelectView,
    List,
    Modal,
    AdvancedPanel,
    TextToggle,
    UnitInput,
    ButtonGroup,
    Alert,
    AlertActions,
    DialogMenu,
    config,
    i18n,
    round,
    ClassNames
) {
    'use strict';
    var lang = i18n.lang;

    return React.createClass({

        getDefaultProps: function() {
            return {
                defaults: {},
                imageFormat: 'bitmap',  // svg, bitmap
                onShadingChanged: function() {}
            };
        },

        getInitialState: function() {
            return {
                openAdvancedPanel: false,
                openCustomPresets: false,
                hasSelectedPreset: false,
                defaults: this.props.defaults,
                materials: lang.laser.advanced.form.object_options.options,
                showAlert: false,
                alertContent: {
                    caption: '',
                    message: ''
                }
            };
        },

        isShading: function() {
            if ('undefined' === typeof this.refs.shading) {
                return true;
            }
            else {
                return this.refs.shading.isChecked();
            }
        },

        // UI Events
        _togglePanel: function(name, open) {
            var self = this,
                panelMap = {
                    advanced: [{
                        openAdvancedPanel: open
                    }],
                    alert: [{
                        showAlert: open
                    }],
                    customPresets: [{
                        openCustomPresets: open
                    },
                    {
                        hasSelectedPreset: false
                    }]
                };

            return function() {
                var panelSettings = panelMap[name],
                    state = {};

                panelSettings.forEach(function(setting) {
                    for (var key in setting) {
                        state[key] = setting[key];
                    }
                })

                self.setState(state);
            };
        },

        _openAdvancedPanel: function(e) {
            this._togglePanel('advanced', true)();
        },

        _onAdvanceDone: function(material) {
            this._saveLastestSet({
                material: material
            });
            this._togglePanel('advanced', false)();
        },

        _onSaveCustomPreset: function(material) {
            var customPresets = config().read('laser-custom-presets') || [],
                sameNamePresets = customPresets.some(function(preset) {
                    return preset.label === material.label;
                });

            if (false === sameNamePresets) {
                customPresets.push(material);
                config().write('laser-custom-presets', customPresets);

                return true;
            }
            else {
                this.setState({
                    showAlert: true,
                    alertContent: {
                        caption: lang.alert.caption,
                        message: lang.alert.duplicated_preset_name
                    }
                })
            }

            return !sameNamePresets;
        },

        _saveLastestSet: function(opts) {
            opts = opts || {};
            opts.material = opts.material || this.state.defaults.material;
            opts.objectHeight = ('number' === typeof opts.objectHeight ? opts.objectHeight : this.state.defaults.objectHeight);
            opts.heightOffset = ('number' === typeof opts.heightOffset ? opts.heightOffset : this.state.defaults.heightOffset);
            opts.isShading = ('boolean' === typeof opts.isShading ? opts.isShading : this.state.defaults.isShading);

            config().write('laser-defaults', opts);

            this.setState({ defaults: opts });
        },

        _onPickupMaterial: function(e) {
            e.preventDefault();

            var self = this,
                chooseMaterial;

            if ('LI' === e.target.tagName) {
                if ('other' === e.target.dataset.value) {
                    self._togglePanel('customPresets', true)();
                }
                else {
                    chooseMaterial = this.state.materials.filter(function(el) {
                        return el.value === e.target.dataset.value;
                    })[0];

                    self._saveLastestSet({ material: chooseMaterial });
                }

                self.openSubPopup(e);
            }
        },

        _onShadingChanged: function(e) {
            this.props.onShadingChanged(e);
            this._saveLastestSet({ isShading: this.isShading() });
        },

        openSubPopup: function(e) {
            this.refs.dialogMenu.toggleSubPopup(e);
        },

        _refreshObjectHeight: function(e, value) {
            this._saveLastestSet({ objectHeight: value });
            this.openSubPopup(e);
        },

        _refreshHeightOffset: function(e, value) {
            this._saveLastestSet({ heightOffset: value });
            this.openSubPopup(e);
        },

        // Lifecycle
        _renderCustomPresets: function() {
            var self = this,
                customPresets = config().read('laser-custom-presets') || [],
                buttons = [
                {
                    label: lang.laser.advanced.cancel,
                    dataAttrs: {
                        'ga-event': 'cancel-custom-laser-preset'
                    },
                    onClick: function(e) {
                        self._togglePanel('customPresets', false)();
                    }
                },
                {
                    label: lang.laser.advanced.apply,
                    className: ClassNames({
                        'btn-default': true,
                        'btn-disabled': false === self.state.hasSelectedPreset
                    }),
                    dataAttrs: {
                        'ga-event': 'apply-custom-laser-preset'
                    },
                    onClick: function(e) {
                        var elCustomPresets = ReactDOM.findDOMNode(self.refs.customPresets);

                        self._saveLastestSet({ material: JSON.parse(elCustomPresets.dataset.selectedMaterial) });
                        self._togglePanel('customPresets', false)();
                        self._togglePanel('advanced', false)();
                    }
                }],
                selectPresetMaterial = function(e) {
                    var elCustomPresets = ReactDOM.findDOMNode(self.refs.customPresets),
                        meta;

                    if ('undefined' !== typeof e.target.dataset.meta) {
                        meta = JSON.parse(e.target.dataset.meta);

                        self.setState({
                            hasSelectedPreset: true,
                            chooseSpeed: meta.data.laser_speed,
                            choosePower: meta.data.power
                        });

                        elCustomPresets.dataset.selectedMaterial = JSON.stringify(meta);
                    }
                },
                handleDelPreset = function(e) {
                  let elCustomPresets = ReactDOM.findDOMNode(self.refs.customPresets),
                      customPresets = config().read('laser-custom-presets') || [],
                      selectedPreset = JSON.parse(elCustomPresets.dataset.selectedMaterial),
                      isSelected,
                      selectedIdx;

                  AlertActions.showPopupYesNo(
                    'removePreset',
                    lang.laser.advanced.removePreset,
                    '',
                    '',
                    {
                      yes: function() {
                        customPresets.some(function(preset, idx) {
                          isSelected = selectedPreset.value === preset.value ? true : false;
                          selectedIdx = idx;
                          return isSelected
                        });

                        customPresets.splice(selectedIdx, 1);
                        config().write('laser-custom-presets', customPresets);
                        self.forceUpdate();
                      },
                      no:  function() {}
                    }
                  );
                },
                advancedLang = lang.laser.advanced,
                content;

            customPresets = customPresets.map(function(opt, i) {
                opt.label = (
                    <label>
                        <input name="custom-preset-item" type="radio"/>
                        <p className="preset-item-name" data-meta={JSON.stringify(opt)}>{opt.label}
                          <i className="fa fa-times" onClick={handleDelPreset}></i>
                        </p>
                    </label>
                );

                return opt;
            });

            content = (
                <div className="custom-presets-wrapper" ref="customPresets">
                    <p className="caption">{lang.laser.presets}</p>
                    <List
                        className="custom-presets-list"
                        items={customPresets}
                        onClick={selectPresetMaterial}
                        emptyMessage="N/A"
                    />
                    <div className="control">
                        <span className="label">{advancedLang.form.laser_speed.text}</span>
                        <input
                            type="range"
                            ref="presetSpeed"
                            min={advancedLang.form.laser_speed.min}
                            max={advancedLang.form.laser_speed.max}
                            step={advancedLang.form.laser_speed.step}
                            value={this.state.chooseSpeed || 0}
                            className="readonly"
                        />
                        <span className="value-text" ref="presetSpeedDisplay" data-tail={advancedLang.form.laser_speed.unit}>
                            {this.state.chooseSpeed || 0}
                        </span>
                    </div>
                    <div className="control">
                        <span className="label">{advancedLang.form.power.text}</span>
                        <input
                            type="range"
                            ref="presetPower"
                            min={advancedLang.form.power.min}
                            max={advancedLang.form.power.max}
                            step={advancedLang.form.power.step}
                            value={this.state.choosePower || 0}
                            className="readonly"
                        />
                        <span className="value-text" ref="presetPowerDisplay" data-tail="%">
                            {round(this.state.choosePower / advancedLang.form.power.max * 100, -2) || 0}
                        </span>
                    </div>
                    <ButtonGroup
                        className="btn-h-group custom-preset-buttons"
                        buttons={buttons}
                    />
                </div>
            );

            return (
                true === self.state.openCustomPresets ?
                <Modal
                    className={{ hasShadow: true }}
                    content={content}
                    onClose={self._togglePanel('customPresets', false)}
                /> :
                ''
            );
        },

        _onLoadCalibrationImage() {
            this.props.onLoadCalibrationImage();
            this._togglePanel('advanced', false)();
        },

        _renderAdvancedPanel: function(default_material) {
            var content = (
                    <AdvancedPanel
                        lang={lang}
                        defaultMaterial={default_material}
                        onClose={this._togglePanel('advanced', false)}
                        onLoadPreset={this._togglePanel('customPresets', true)}
                        onLoadCalibrationImage = {this._onLoadCalibrationImage}
                        onApply={this._onAdvanceDone}
                        onSave={this._onSaveCustomPreset}
                        ref="advancedPanel"
                    />
                );

            return (
                true === this.state.openAdvancedPanel ?
                <Modal
                    className={{ hasShadow: true }}
                    disabledEscapeOnBackground={true}
                    content={content}
                    onClose={this._togglePanel('advanced', false)}
                /> :
                ''
            );
        },

        _renderHeightOffset: function() {
            return {
                label: (
                    <div title={lang.laser.title.height_offset}>
                        <span className="caption">{lang.laser.print_params.height_offset.text}</span>
                        <span>{this.state.defaults.heightOffset}</span>
                        <span>{lang.laser.print_params.height_offset.unit}</span>
                    </div>
                ),
                content: (
                    <div className="object-height-input">
                        <UnitInput
                            defaultUnit="mm"
                            defaultValue={this.state.defaults.heightOffset}
                            getValue={this._refreshHeightOffset}
                            min={-10}
                            max={100}
                        />
                    </div>
                )
            };
        },

        _renderObjectHeight: function() {
            return {
                label: (
                    <div title={lang.laser.title.object_height}>
                        <span className="caption">{lang.laser.print_params.object_height.text}</span>
                        <span>{this.state.defaults.objectHeight}</span>
                        <span>{lang.laser.print_params.object_height.unit}</span>
                    </div>
                ),
                content: (
                    <div className="object-height-input">
                        <UnitInput
                            defaultUnit="mm"
                            defaultValue={this.state.defaults.objectHeight}
                            getValue={this._refreshObjectHeight}
                            min={0}
                            max={150}
                        />
                    </div>
                )
            };
        },

        _renderMaterialSelection: function() {
            var state = this.state,
                materialOptions = lang.laser.advanced.form.object_options.options,
                defaultMaterial;

            defaultMaterial = materialOptions.filter(function(material) {
                return material.value === state.defaults.material.value;
            })[0] || state.defaults.material;

            return {
                label: (
                    <div className="material-name" title={lang.laser.title.material}>
                        <span className="caption">{lang.laser.advanced.form.object_options.text}</span>
                        <span>{defaultMaterial.label}</span>
                    </div>
                ),
                content: (
                    <List
                        className="material-list"
                        ref="materials"
                        items={this.state.materials}
                        onClick={this._onPickupMaterial}
                    />
                )
            };
        },

        _renderShading: function() {
            var checked = ('undefined' !== typeof this.props.imageFormat && 'svg' === this.props.imageFormat ? false : this.state.defaults.isShading),
                classes = ReactCx.cx('display-text', 'shading');
            return {
                label: (
                    <TextToggle
                        ref="shading"
                        className={classes}
                        title={lang.laser.title.shading}
                        displayText={lang.laser.print_params.shading.text}
                        textOn={lang.laser.print_params.shading.textOn}
                        textOff={lang.laser.print_params.shading.textOff}
                        defaultChecked={checked}
                        onClick={this._onShadingChanged}
                    />
                ),
                labelClass: {
                    'disabled-pointer': 'svg' === this.props.imageFormat
                },
                content: ''
            };
        },

        _renderAlert: function() {
            var buttons = [{
                label: lang.laser.confirm,
                dataAttrs: {
                    'ga-event': 'confirm'
                },
                onClick: this._togglePanel('alert', false)
            }],
            content = (
                <Alert
                    caption={this.state.alertContent.caption}
                    message={this.state.alertContent.message}
                    buttons={buttons}
                />
            );

            return (
                true === this.state.showAlert ?
                <Modal
                    className={{ hasShadow: true }}
                    content={content}
                    disabledEscapeOnBackground={true}
                    onClose={this._togglePanel('alert', false)}
                /> :
                ''
            );
        },

        _renderAdvancedButton: function() {
            return {
                label: (
                    <button
                        className="btn btn-advance"
                        data-ga-event="open-laser-advanced-panel"
                        title={lang.laser.title.advanced}
                        onClick={this._togglePanel('advanced', true)}
                    >
                        {lang.laser.button_advanced}
                    </button>
                ),
                content: ''
            };
        },

        render: function() {
            var advancedPanel = this._renderAdvancedPanel(this.state.defaults.material),
                customPresets = this._renderCustomPresets(),
                alert = this._renderAlert(),
                items = [
                    this._renderMaterialSelection(),
                    this._renderShading(),
                    this._renderObjectHeight(),
                    this._renderHeightOffset(),
                    this._renderAdvancedButton()
                ];

            return (
                <div className="setup-panel operating-panel">
                    <DialogMenu ref="dialogMenu" items={items}/>

                    {advancedPanel}
                    {customPresets}
                    {alert}
                </div>
            );
        }

    });
});
