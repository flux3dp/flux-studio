define([
    'jquery',
    'react',
    'jsx!widgets/Slider-Control',
    'jsx!widgets/Dropdown-Control',
    'jsx!widgets/Switch-Control',
    'jsx!widgets/Radio-Control',
    'plugins/classnames/index',
    'helpers/api/config',
    'helpers/object-assign'
], function($, React, SliderControl, DropdownControl, SwitchControl, RadioControl, ClassNames, Config) {

var mode = {
            'setup'     : 1,
            'load'      : 2,
            'save'      : 3
        },
        tab = {
            'General'   : 1,
            'Layers'    : 2,
            'Infill'    : 3,
            'Support'   : 4,
            'Speed'     : 5,
            'Custom'    : 6
        },
        lang,
        currentKey,
        lastValidValue;

    var hiddenPresets = ['engine', 'custom'],
        configs = ['avoid_crossing_perimeters','bed_shape','bed_temperature','before_layer_gcode','bottom_solid_layers','bridge_acceleration','bridge_fan_speed','bridge_flow_ratio','bridge_speed','brim_width','complete_objects','cooling','default_acceleration','disable_fan_first_layers','dont_support_bridges','duplicate_distance','end_gcode','external_fill_pattern','external_perimeter_extrusion_width','external_perimeter_speed','external_perimeters_first','extra_perimeters','extruder_clearance_height','extruder_clearance_radius','extruder_offset','extrusion_axis','extrusion_multiplier','extrusion_width','fan_always_on','fan_below_layer_time','filament_colour','filament_diameter','fill_angle','fill_density','fill_pattern','first_layer_acceleration','first_layer_bed_temperature','first_layer_extrusion_width','first_layer_height','first_layer_speed','first_layer_temperature','gap_fill_speed','gcode_arcs','gcode_comments','gcode_flavor','infill_acceleration','infill_every_layers','infill_extruder','infill_extrusion_width','infill_first','infill_only_where_needed','infill_overlap','infill_speed','interface_shells','layer_gcode','layer_height','max_fan_speed','max_print_speed','max_volumetric_speed','min_fan_speed','min_print_speed','min_skirt_length','notes','nozzle_diameter','octoprint_apikey','octoprint_host','only_retract_when_crossing_perimeters','ooze_prevention','output_filename_format','overhangs','perimeter_acceleration','perimeter_extruder','perimeter_extrusion_width','perimeter_speed','perimeters','post_process','pressure_advance','raft_layers','resolution','retract_before_travel','retract_layer_change','retract_length','retract_length_toolchange','retract_lift','retract_restart_extra','retract_restart_extra_toolchange','retract_speed','seam_position','skirt_distance','skirt_height','skirts','slowdown_below_layer_time','small_perimeter_speed','solid_infill_below_area','solid_infill_every_layers','solid_infill_extruder','solid_infill_extrusion_width','solid_infill_speed','spiral_vase','standby_temperature_delta','start_gcode','support_material','support_material_angle','support_material_contact_distance','support_material_enforce_layers','support_material_extruder','support_material_extrusion_width','support_material_interface_extruder','support_material_interface_layers','support_material_interface_spacing','support_material_interface_speed','support_material_pattern','support_material_spacing','support_material_speed','support_material_threshold','temperature','thin_walls','threads','toolchange_gcode','top_infill_extrusion_width','top_solid_infill_speed','top_solid_layers','travel_speed','use_firmware_retraction','use_relative_e_distances','use_volumetric_e','vibration_limit','wipe','xy_size_compensation','z_offset'],
        advancedSetting = {
            // General
            engine                              : '',
            temperature                         : 220,

            // Layers
            layer_height                        : 0.2,
            first_layer_height                  : 0.35,
            perimeters                          : 3,
            top_solid_layers                    : 3,
            bottom_solid_layers                 : 3,

            // Infill
            fill_density                        : 20,
            fill_pattern                        : 'honeycomb',
            spiral_vase                         : 0,

            // Support
            support_material                    : 1,
            support_material_spacing            : 2,
            support_material_threshold          : 55,
            support_material_pattern            : 'auto',
            support_material_contact_distance   : 0.2,
            raft_layers                         : 4,

            // Speed
            travel_speed                        : 80,
            support_material_speed              : 40,
            infill_speed                        : 50,
            first_layer_speed                   : 20,
            solid_infill_speed                  : 20,
            perimeter_speed                     : 30,
            external_perimeter_speed            : 20,
            bridge_speed                        : 40,

            // Custom
            custom                              : ''
        };

    return React.createClass({

        propTypes: {
            lang: React.PropTypes.object,
            setting: React.PropTypes.object,
            onClose: React.PropTypes.func,
            onApply: React.PropTypes.func
        },

        getInitialState: function() {
            return {
                mode                : 1,
                selectedTab         : 1,
                custom              : this.props.setting.custom || '',

                // Presets
                selectedPreset      : '',
                presets             : {}
            };
        },

        componentWillMount: function() {
            lang = this.props.lang.print.advanced;
            Object.assign(advancedSetting, this.props.setting);
            this._updateCustomField();
        },

        _createState: function(key, value) {
            var newState = {};
            newState[key] = value;
            return newState;
        },

        _validateValue: function(e) {
            e.preventDefault();
            if(!this._isValidValue(currentKey, this.state[currentKey])) {
                this.setState(this._createState(currentKey, lastValidValue));
            }
        },

        _isValidValue: function(key, value) {
            var min = parseInt(this.refs[key].getDOMNode().min),
                max = parseInt(this.refs[key].getDOMNode().max);

            return min <= value && value <= max;
        },

        _updateCustomField: function() {
            var keys = Object.keys(advancedSetting),
                custom = this.state.custom.length === 0 ? [] : this.state.custom.split('\n'),
                _entry, _keys, lineNumber;

            for(var i = 0; i < keys.length; i++) {
                _keys = keys[i];
                _entry = _keys + ' = ' + advancedSetting[_keys];
                lineNumber = this._getLineNumber(custom, _keys);

                if(lineNumber >= 0) {
                    custom[lineNumber] = _entry;
                }
                else {
                    if(hiddenPresets.indexOf(_keys) === -1)
                    custom.push(_entry);
                }
            }
            this.setState({ custom: custom.join('\n') });
        },

        _getLineNumber: function(array, key) {
            var entry,
                _key,
                lineNumber = -1;

            for(var i = 0; i < array.length; i++) {
                entry = array[i].split('=');
                _key = entry[0].replace(/ /g, '');
                if(key === _key) {
                    lineNumber = i;
                    break;
                }
            }

            return lineNumber;
        },

        _getPresets: function(callback) {
            Config().read('preset-settings', {
                onFinished: function(response) {
                    callback(response);
                }
            });
        },

        _savePreset: function(presets) {
            var self = this,
                name = this.refs.presetName.getDOMNode().value;
                p = presets === '' ? {} : presets;

            p[name] = JSON.stringify(advancedSetting);
            Config().write('preset-settings', JSON.stringify(p), {
                onFinished: function() {
                    self._handleBackToSetting();
                },
                onError: function(error) {
                    // TODO: log error
                    console.log(error);
                }
            });
        },

        _listPresets: function(presets) {
            if(presets.length === 0) { return; }

            this.setState({
                presets: presets,
                selectedPreset: Object.keys(presets)[0]
            });
        },

        _JSONToKeyValue: function(presetInJSON) {
            if(Object.keys(presetInJSON).length === 0) { return ''; }
            var settings = [];

            Object.keys(presetInJSON).forEach(function(name) {
                if(hiddenPresets.indexOf(name) < 0) {
                    settings.push(name.replace(/,/g,'') + ' = ' + presetInJSON[name] + '\n');
                }
            });

            // remove last newline wow fast
            settings[settings.length -1] = settings[settings.length - 1].replace(/\r?\n|\r/g,'');
            return settings.join('');
        },

        _processCustomInput: function() {
            var settings = this.state.custom.split('\n');
            var _key, _value;

            settings.forEach(function(line) {
                var setting = line.split('=');

                if(setting.length === 2) {
                    _key = setting[0].replace(/ /g, '');
                    _value = setting[1].trim();

                    if(this._isPartOfAdvancedSetting(_key)) {
                        advancedSetting[_key] = parseFloat(_value) || _value;
                    }
                }
            }.bind(this));

            advancedSetting.custom = this.state.custom;
        },

        _isPartOfAdvancedSetting: function(property) {
            return Object.keys(advancedSetting).indexOf(property) >= 0;
        },

        _handleNavigate: function(selectedTab, e) {
            e.preventDefault();
            this.setState({
                selectedTab: selectedTab
            });
            this._handleApply(true);
        },

        _handleParameterChange: function(key, e) {
            var value = e.target.value;
            if(e.target.type === 'checkbox') {
                value = e.target.checked;
            }

            this.setState(this._createState(key, value));
        },

        _handleSelectPreset: function(name) {
            this.setState({ selectedPreset: name });
        },

        _handleLoadPreset: function() {
            var self = this;
            this.setState({ mode: mode.load });
            this._getPresets(function(settings) {
                self._listPresets(settings);
            });
        },

        _handleBackToSetting: function() {
            this.setState({ mode: mode.setup });
        },

        _handleOpenSaveAsPreset: function() {
            this.setState({ mode: mode.save });
        },

        _handleSavePreset: function() {
            var self = this;
            this._getPresets(function(presets) {
                self._savePreset(presets);
            });
        },

        _handleControlValueChange: function(id, value) {
            if(typeof(value) === 'boolean') {
                advancedSetting[id] = value ? 1 : 0;
            }
            else {
                advancedSetting[id] = value;
            }
            this._updateCustomField();
        },

        _handleApplyPreset: function() {
            var p = this.state.presets[this.state.selectedPreset];
            advancedSetting = JSON.parse(p);
            this._updateCustomField();
            this._handleBackToSetting();
        },

        _handleApply: function(showAdvancedSetting) {
            this._processCustomInput();

            var _settings = {};
            Object.keys(advancedSetting).forEach(function(name) {
                _settings[name] = advancedSetting[name];
            });
            this.props.onApply(_settings);
            if(!showAdvancedSetting) {
                this.props.onClose();
            }
        },

        _handleCloseAdvancedSetting: function(e) {
            e.preventDefault();
            this.props.onClose();
        },

        _renderTabs: function() {
            var tabGeneral  = ClassNames('tab', {selected: this.state.selectedTab === tab.General}),
                tabLayers   = ClassNames('tab', {selected: this.state.selectedTab === tab.Layers}),
                tabInfill   = ClassNames('tab', {selected: this.state.selectedTab === tab.Infill}),
                tabSupport  = ClassNames('tab', {selected: this.state.selectedTab === tab.Support}),
                tabSpeed    = ClassNames('tab', {selected: this.state.selectedTab === tab.Speed}),
                tabCustom   = ClassNames('tab', {selected: this.state.selectedTab === tab.Custom});

            return (
                <div className="tab-container">
                    <ul className="tab-list">
                        <li className={tabGeneral} onClick={this._handleNavigate.bind(null, 1)}><a href="#">{lang.general}</a></li>
                        <li className={tabLayers} onClick={this._handleNavigate.bind(null, 2)}><a href="#">{lang.layers}</a></li>
                        <li className={tabInfill} onClick={this._handleNavigate.bind(null, 3)}><a href="#">{lang.infill}</a></li>
                        <li className={tabSupport} onClick={this._handleNavigate.bind(null, 4)}><a href="#">{lang.support}</a></li>
                        <li className={tabSpeed} onClick={this._handleNavigate.bind(null, 5)}><a href="#">{lang.speed}</a></li>
                        <li className={tabCustom} onClick={this._handleNavigate.bind(null, 6)}><a href="#">{lang.custom}</a></li>
                    </ul>
                </div>
            );
        },

        _renderGeneralSection: function() {
            var options = [
                {
                    id: lang.slic3r,
                    name: lang.slic3r
                },
                {
                    id: lang.experiment,
                    name: lang.experiment
                }
            ];
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.slicingEngine}</div>
                        <div className="controls">
                            <div className="label"></div>
                            <RadioControl
                                options={options}
                                onChange={this._handleControlValueChange}
                                />
                        </div>
                    </div>

                    <div className="section">
                        <div className="title">{lang.filament}</div>
                        <SliderControl
                            id="temperature"
                            key="temperature"
                            label={lang.temperature}
                            min={170}
                            max={230}
                            step={1}
                            default={advancedSetting.temperature}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            );
        },

        _renderLayersSection: function() {
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.layerHeight}</div>

                        <SliderControl
                            id="layer_height"
                            key="layer_height"
                            label={lang.layerHeight}
                            min={0.05}
                            max={0.4}
                            step={0.05}
                            default={advancedSetting.layer_height}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="first_layer_height"
                            key="first_layer_height"
                            label={lang.firstLayerHeight}
                            min={0.05}
                            max={0.4}
                            step={0.05}
                            default={advancedSetting.first_layer_height}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.shell}</div>

                        <SliderControl
                            id="perimeters"
                            key="perimeters"
                            label={lang.shellSurface}
                            min={1}
                            max={6}
                            step={1}
                            default={advancedSetting.perimeters}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="top_solid_layers"
                            key="top_solid_layers"
                            label={lang.solidLayerTop}
                            min={1}
                            max={6}
                            step={1}
                            default={advancedSetting.top_solid_layers}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="bottom_solid_layers"
                            key="bottom_solid_layers"
                            label={lang.solidLayerBottom}
                            min={1}
                            max={6}
                            step={1}
                            default={advancedSetting.bottom_solid_layers}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            );
        },

        _renderInfillSection: function() {
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">Infill</div>

                        <SliderControl
                            id="fill_density"
                            key="fill_density"
                            label={lang.density}
                            min={0}
                            max={100}
                            step={1}
                            default={advancedSetting.fill_density}
                            onChange={this._handleControlValueChange} />

                        <DropdownControl
                            id="fill_pattern"
                            label={lang.pattern}
                            options={[lang.auto, lang.line, lang.rectilinear, lang.honeycomb]}
                            default={advancedSetting.fill_pattern}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.blackMagic}</div>

                        <SwitchControl
                            id="spiral_vase"
                            label={lang.spiral}
                            default={advancedSetting.spiral_vase === 1}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            );
        },

        _renderSupportSection: function() {
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.support}</div>

                        <SwitchControl
                            id="support_material"
                            label={lang.generalSupport}
                            default={advancedSetting.support_material === 1}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="support_material_spacing"
                            key="support_material_spacing"
                            label={lang.spacing}
                            min={0}
                            max={5}
                            step={0.1}
                            default={advancedSetting.support_material_spacing}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="support_material_threshold"
                            key="support_material_threshold"
                            label={lang.overhang}
                            min={0}
                            max={90}
                            step={1}
                            default={advancedSetting.support_material_threshold}
                            onChange={this._handleControlValueChange} />

                        <DropdownControl
                            id="support_material_pattern"
                            label={lang.pattern}
                            options={[lang.auto, lang.line, lang.rectilinear, lang.honeycomb]}
                            default={advancedSetting.support_material_pattern}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="support_material_contact_distance"
                            key="support_material_contact_distance"
                            label={lang.zDistance}
                            min={0}
                            max={5}
                            step={0.1}
                            default={advancedSetting.support_material_contact_distance}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.raft}</div>

                        <SliderControl
                            id="raft_layers"
                            key="raft_layers"
                            label={lang.raftLayers}
                            min={1}
                            max={6}
                            step={1}
                            default={advancedSetting.raft_layers}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            );
        },

        _renderSpeedSection: function() {
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.movement}</div>
                        <SliderControl
                            id="travel_speed"
                            key="travel_speed"
                            label={lang.traveling}
                            min={10}
                            max={150}
                            step={1}
                            default={advancedSetting.travel_speed}
                            onChange={this._handleControlValueChange} />
                    </div>

                    <div className="section">
                        <div className="title">{lang.structure}</div>

                        <SliderControl
                            id="support_material_speed"
                            key="support_material_speed"
                            label={lang.support}
                            min={10}
                            max={150}
                            step={1}
                            default={advancedSetting.support_material_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="infill_speed"
                            key="infill_speed"
                            label={lang.infill}
                            min={10}
                            max={150}
                            step={1}
                            default={advancedSetting.infill_speed}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.surface}</div>

                        <SliderControl
                            id="first_layer_speed"
                            key="first_layer_speed"
                            label={lang.firstLayer}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.first_layer_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="solid_infill_speed"
                            key="solid_infill_speed"
                            label={lang.solidLayers}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.solid_infill_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="perimeter_speed"
                            key="perimeter_speed"
                            label={lang.innerShell}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.perimeter_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="external_perimeter_speed"
                            key="external_perimeter_speed"
                            label={lang.outerShell}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.external_perimeter_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="bridge_speed"
                            key="bridge_speed"
                            label={lang.bridge}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.bridge_speed}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            );
        },

        _renderCustomSection: function() {
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.config}</div>
                        <div className="controls">
                            <div className="label pull-left"></div>
                            <div className="control">
                                <div className="textarea-container">
                                    <textarea
                                        rows="20"
                                        cols="50"
                                        value={this.state.custom}
                                        onChange={this._handleParameterChange.bind(null, 'custom')} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            );
        },

        _renderContent: function() {
            var self = this,
                content;

            switch(this.state.selectedTab) {

                case tab.General:
                    content = self._renderGeneralSection(); break;

                case tab.Layers:
                    content = self._renderLayersSection(); break;

                case tab.Infill:
                    content = self._renderInfillSection(); break;

                case tab.Support:
                    content = self._renderSupportSection(); break;

                case tab.Speed:
                    content = self._renderSpeedSection(); break;

                case tab.Custom:
                    content = self._renderCustomSection(); break;

                default:
                    break;
            }

            return content;
        },

        _renderFooter: function() {
            var button1, button2, button3;

            switch(this.state.mode) {

                case mode.setup:
                    button1 = (<a className="btn" onClick={this._handleLoadPreset}>{lang.loadPreset}</a>);
                    button2 = (<a className="btn" onClick={this._handleApply.bind(null, false)}>{lang.apply}</a>);
                    button3 = (<a className="btn" onClick={this._handleOpenSaveAsPreset}>{lang.saveAsPreset}</a>);
                    button4 = (<a className="btn" onClick={this._handleCloseAdvancedSetting}>{lang.cancel}</a>);
                    break;

                case mode.load:
                    button1 = '';
                    button2 = (<a className="btn" onClick={this._handleApplyPreset}>{lang.apply}</a>);
                    button3 = (<a className="btn" onClick={this._handleBackToSetting}>{lang.cancel}</a>);
                    button4 = '';
                    break;

                case mode.save:
                    button1 = '';
                    button2 = (<a className="btn" onClick={this._handleSavePreset}>{lang.saveAndApply}</a>);
                    button3 = (<a className="btn" onClick={this._handleBackToSetting}>{lang.cancel}</a>);
                    button4 = '';
                default:
                    break;

            }

            return (
                <div className="footer">

                    <div className="left">
                        {button1}
                        {button3}
                    </div>

                    <div className="right">
                        {button2}
                        {button4}
                    </div>

                </div>
            );
        },

        _renderSetupUI: function() {
            var tabs    = this._renderTabs(),
                content = this._renderContent(),
                footer  = this._renderFooter();

            return (
                <div id="advanced-panel" className="advanced-panel">
                    {tabs}
                    {content}
                    {footer}
                </div>
            );
        },

        _renderLoadPresetUI: function() {
            var self = this,
                footer = this._renderFooter(),
                entries,
                entryClass,
                presetList = Object.keys(this.state.presets);

            entries = presetList.map(function(entry) {
                entryClass = ClassNames('preset-entry', {'selected': self.state.selectedPreset === entry});
                return (
                    <div className={entryClass} onClick={self._handleSelectPreset.bind(null, entry)}>
                        <span>{entry}</span>
                    </div>
                );
            });

            var preset = this.state.presets[this.state.selectedPreset] || '{}',
                presetContent = this._JSONToKeyValue(JSON.parse(preset));

            return (
                <div id="advanced-panel" className="advanced-panel">
                    <div className="preset-wrapper">
                        <div className="preset-header">{lang.presets}</div>
                        <div className="preset-list">
                            {entries}
                        </div>
                        <textarea className="preset-content" value={presetContent} disabled />
                        {footer}
                    </div>
                </div>
            );
        },

        _renderSavePresetUI: function() {
            var divStyle = {
                    height: '190px'
                },
                footer = this._renderFooter();

            return (
                <div id="advanced-panel" className="advanced-panel" style={divStyle}>
                    <div className="preset-wrapper">
                        <div className="preset-header">{lang.saveAsPreset}</div>
                        <div className="preset-name">
                            <span>{lang.name}</span>
                            <input ref="presetName" type="text" />
                        </div>

                        {footer}
                    </div>
                </div>
            );
        },

        render: function() {
            var self = this,
                UI;

            switch(this.state.mode) {

                case mode.setup:
                    UI = self._renderSetupUI(); break;

                case mode.load:
                    UI = self._renderLoadPresetUI(); break;

                case mode.save:
                    UI = self._renderSavePresetUI(); break;

                default: break;
            }

            return UI;
        }

    });
});
