define([
    'jquery',
    'react',
    'jsx!widgets/Select',
    'jsx!widgets/List',
    'jsx!widgets/Modal',
    'jsx!views/laser/Advanced-Panel',
    'jsx!widgets/Text-Toggle',
    'jsx!widgets/Unit-Input',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Alert',
    'helpers/api/config',
    'helpers/round',
], function(
    $,
    React,
    SelectView,
    List,
    Modal,
    AdvancedPanel,
    TextToggle,
    UnitInput,
    ButtonGroup,
    Alert,
    config,
    round
) {
    'use strict';

    return React.createClass({
        _advancedSettings: undefined,

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
                }),
                lang = this.props.lang;

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
            opts.objectHeight = opts.objectHeight || this.state.defaults.objectHeight;

            var self = this,
                state = {
                    defaults: opts
                };

            config().write('laser-defaults', opts);

            self.setState(state);
        },

        _onPickupMaterial: function(e) {
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
            }
        },

        _onOpenSubPopup: function(e) {
            var $me = $(e.currentTarget),
                $popupOpen = $('.popup-open:checked').not($me);

            $popupOpen.removeAttr('checked');
        },

        _refreshObjectHeight: function(value) {
            this._saveLastestSet({ objectHeight: value });
        },

        // Lifecycle
        _renderCustomPresets: function(lang) {
            var self = this,
                // TODO: remove pseudo entry
                customPresets = config().read('laser-custom-presets') || [],
                buttons = [{
                    label: lang.laser.advanced.apply,
                    className: (false === self.state.hasSelectedPreset ? 'btn-disabled' : ''),
                    onClick: function(e) {
                        var elCustomPresets = self.refs.customPresets.getDOMNode();

                        self._saveLastestSet({ material: JSON.parse(elCustomPresets.dataset.selectedMaterial) });
                        self._togglePanel('customPresets', false)();
                        self._togglePanel('advanced', false)();
                    }
                },
                {
                    label: lang.laser.advanced.cancel,
                    onClick: function(e) {
                        self._togglePanel('customPresets', false)();
                    }
                }],
                selectPresetMaterial = function(e) {
                    var elCustomPresets = self.refs.customPresets.getDOMNode(),
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
                advancedLang = lang.laser.advanced,
                content;

            customPresets = customPresets.map(function(opt, i) {
                opt.label = (
                    <label>
                        <input name="custom-preset-item" type="radio"/>
                        <p className="preset-item-name" data-meta={JSON.stringify(opt)}>{opt.label}</p>
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
                        className="custom-preset-buttons"
                        buttons={buttons}
                    />
                </div>
            );

            return (
                true === self.state.openCustomPresets ?
                <Modal className={{ hasShadow: true }} content={content} onClose={self._togglePanel('customPresets', false)}/> :
                ''
            );
        },

        _renderAdvancedPanel: function(lang, default_material) {
            var content = (
                    <AdvancedPanel
                        lang={lang}
                        defaultMaterial={default_material}
                        onClose={this._togglePanel('advanced', false)}
                        onLoadPreset={this._togglePanel('customPresets', true)}
                        onApply={this._onAdvanceDone}
                        onSave={this._onSaveCustomPreset}
                        ref="advancedPanel"
                    />
                );

            return (
                true === this.state.openAdvancedPanel ?
                <Modal className={{ hasShadow: true }} content={content} onClose={this._togglePanel('advanced', false)}/> :
                ''
            );
        },

        _renderObjectHeight: function(lang) {
            return (
                <label className="popup-selection">
                    <input className="popup-open" name="popup-open" type="checkbox" onClick={this._onOpenSubPopup}/>
                    <div className="display-text">
                        <p>
                            {lang.laser.print_params.object_height.text}
                            {this.state.defaults.objectHeight}
                            {lang.laser.print_params.object_height.unit}
                        </p>
                    </div>
                    <label className="popup">
                        <svg className="arrow" version="1.1" xmlns="http://www.w3.org/2000/svg"
                            width="36.8" height="20">
                            <polygon points="0,10 36.8,0 36.8,20"/>
                        </svg>
                        <ul className="object-height-input">
                            <li>
                                <UnitInput
                                    defaultUnit="mm"
                                    defaultValue={this.props.defaults.objectHeight}
                                    getValue={this._refreshObjectHeight}
                                />
                            </li>
                            <li>
                                AUTODETECTION
                            </li>
                        </ul>
                    </label>
                </label>
            )
        },

        _renderMaterialSelection: function(lang) {
            var props = this.props;

            return (
                <label className="popup-selection">
                    <input className="popup-open" name="popup-open" type="checkbox" onClick={this._onOpenSubPopup}/>
                    <div className="display-text">
                        <p>
                            <span>{lang.laser.advanced.form.object_options.text}</span>
                            <span className="material-label">{this.state.defaults.material.label}</span>
                        </p>
                    </div>
                    <label className="popup">
                        <svg className="arrow" version="1.1" xmlns="http://www.w3.org/2000/svg"
                            width="36.8" height="20">
                            <polygon points="0,10 36.8,0 36.8,20"/>
                        </svg>
                        <List
                            className="material-list"
                            ref="materials"
                            items={this.state.materials}
                            onClick={this._onPickupMaterial}
                        />
                    </label>
                </label>
            );
        },

        _renderAlert: function(lang) {
            var buttons = [{
                label: lang.laser.confirm,
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

        render: function() {
            var props = this.props,
                lang = props.lang,
                cx = React.addons.classSet,
                advancedPanel = this._renderAdvancedPanel(lang, this.state.defaults.material),
                material = this._renderMaterialSelection(lang),
                objectHeight = this._renderObjectHeight(lang),
                customPresets = this._renderCustomPresets(lang),
                alert = this._renderAlert(lang);

            return (
                <div className="setup-panel operating-panel">
                    <ul className="main">
                        <li>
                            {material}
                        </li>
                        <li>
                            {objectHeight}
                        </li>
                        <li>
                            <button className="btn btn-advance" data-ga-event="open-laser-advanced-panel" onClick={this._togglePanel('advanced', true)}>
                                {lang.laser.button_advanced}
                            </button>
                        </li>
                    </ul>

                    {advancedPanel}
                    {customPresets}
                    {alert}
                </div>
            );
        },

        getDefaultProps: function() {
            return {
                defaults: React.PropTypes.object
            };
        },

        getInitialState: function() {
            var props = this.props,
                lang = props.lang;

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
        }

    });
});