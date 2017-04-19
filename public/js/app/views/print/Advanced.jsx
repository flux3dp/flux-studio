define([
    'jquery',
    'react',
    'jsx!widgets/Slider-Control',
    'jsx!widgets/Dropdown-Control',
    'jsx!widgets/Switch-Control',
    'jsx!widgets/Radio-Control',
    'jsx!widgets/Modal',
    'app/actions/input-lightbox-actions',
    'plugins/classnames/index',
    'helpers/api/config',
    'app/actions/alert-actions',
    'app/default-print-settings',
    'helpers/slicer-settings',
    'helpers/object-assign'
], function(
    $,
    React,
    SliderControl,
    DropdownControl,
    SwitchControl,
    RadioControl,
    Modal,
    InputLightboxActions,
    ClassNames,
    Config,
    AlertActions,
    DefaultPrintSettings,
    SlicerSettings
) {
    'use strict';

    var mode = {
            'setup'     : 1,
            'load'      : 2,
            'save'      : 3
        },
        tab = {
            'GENERAL'   : 1,
            'LAYERS'    : 2,
            'INFILL'    : 3,
            'SUPPORT'   : 4,
            'SPEED'     : 5,
            'CUSTOM'    : 6
        },
        lang,
        currentKey,
        lastValidValue;

    var hiddenPresets = ['engine', 'custom', 'raft_on'],
        slic3rInfill,
        slic3rSupport,
        curaInfill,
        cura2Infill,
        curaSupport,
        cura2Support,
        configs = ['avoid_crossing_perimeters','bed_shape','bed_temperature','before_layer_gcode','bottom_solid_layers','bridge_acceleration','bridge_fan_speed','bridge_flow_ratio','bridge_speed','brim_width','complete_objects','cooling','default_acceleration','disable_fan_first_layers','dont_support_bridges','duplicate_distance','end_gcode','external_fill_pattern','external_perimeter_extrusion_width','external_perimeter_speed','external_perimeters_first','extra_perimeters','extruder_clearance_height','extruder_clearance_radius','extruder_offset','extrusion_axis','extrusion_multiplier','extrusion_width','fan_always_on','fan_below_layer_time','filament_colour','filament_diameter','fill_angle','fill_density','fill_pattern','first_layer_acceleration','first_layer_bed_temperature','first_layer_extrusion_width','first_layer_height','first_layer_speed','first_layer_temperature','gap_fill_speed','gcode_arcs','gcode_comments','gcode_flavor','infill_acceleration','infill_every_layers','infill_extruder','infill_extrusion_width','infill_first','infill_only_where_needed','infill_overlap','infill_speed','interface_shells','layer_gcode','layer_height','max_fan_speed','max_print_speed','max_volumetric_speed','min_fan_speed','min_print_speed','min_skirt_length','notes','nozzle_diameter','octoprint_apikey','octoprint_host','only_retract_when_crossing_perimeters','ooze_prevention','output_filename_format','overhangs','perimeter_acceleration','perimeter_extruder','perimeter_extrusion_width','perimeter_speed','perimeters','post_process','pressure_advance','raft', 'raft_layers','resolution','retract_before_travel','retract_layer_change','retract_length','retract_length_toolchange','retract_lift','retract_restart_extra','retract_restart_extra_toolchange','retract_speed','seam_position','skirt_distance','skirt_height','skirts','slowdown_below_layer_time','small_perimeter_speed','solid_infill_below_area','solid_infill_every_layers','solid_infill_extruder','solid_infill_extrusion_width','solid_infill_speed','spiral_vase','standby_temperature_delta','start_gcode','support_material','support_material_angle','support_material_contact_distance','support_material_enforce_layers','support_material_extruder','support_material_extrusion_width','support_material_interface_extruder','support_material_interface_layers','support_material_interface_spacing','support_material_interface_speed','support_material_pattern','support_material_spacing','support_material_speed','support_material_threshold','temperature','thin_walls','threads','toolchange_gcode','top_infill_extrusion_width','top_solid_infill_speed','top_solid_layers','travel_speed','use_firmware_retraction','use_relative_e_distances','use_volumetric_e','vibration_limit','wipe','xy_size_compensation','z_offset'],
        advancedSetting = new SlicerSettings('advanced');

    return React.createClass({

        propTypes: {
            lang            : React.PropTypes.object,
            setting         : React.PropTypes.object,
            onClose         : React.PropTypes.func,
            onApply         : React.PropTypes.funcs
        },

        getInitialState: function() {
            return {
                mode                : 1,
                selectedTab         : 1,
                custom              : this.props.setting.custom || '',
                customCura2         : this.props.setting.customCura2 || '',
                showBridgeSpeed     : this.props.setting.engine !== 'cura2',

                // Presets
                selectedPreset      : '',
                presets             : {}
            };
        },

        componentWillMount: function() {
            lang = this.props.lang.print.advanced;
            slic3rInfill = [
                { label: lang.rectilinear, value: 'rectilinear' },
                { label: lang.line, value: 'line' },
                { label: lang.honeycomb, value: 'honeycomb' }
            ];
            slic3rSupport = [
                { label: lang.rectilinearGrid, value: 'rectilinear-grid' },
                { label: lang.rectilinear, value: 'rectilinear' },
                { label: lang.honeycomb, value: 'honeycomb' }
            ];
            curaInfill = [
                { label: lang.curaInfill.automatic, value: 'AUTOMATIC' },
                { label: lang.curaInfill.grid, value: 'GRID' },
                { label: lang.curaInfill.lines, value: 'LINES' },
                { label: lang.curaInfill.concentric, value: 'CONCENTRIC' }
            ];
            cura2Infill = [
                { label: lang.curaInfill.automatic, value: 'AUTOMATIC' },
                { label: lang.curaInfill.grid, value: 'GRID' },
                { label: lang.curaInfill.lines, value: 'LINES' },
                { label: lang.curaInfill.concentric, value: 'CONCENTRIC' },
                { label: lang.curaInfill.concentric_3d, value: 'CONCENTRIC_3D' },
                { label: lang.curaInfill.cubic, value: 'CUBIC' },
                { label: lang.curaInfill.cubicsubdiv, value: 'CUBICSUBDIV' },
                { label: lang.curaInfill.tetrahedral, value: 'TETRAHEDRAL' },
                { label: lang.curaInfill.triangles, value: 'TRIANGLES' },
                { label: lang.curaInfill.zigzag, value: 'ZIGZAG' },
            ];
            curaSupport = [
                { label: lang.curaSupport.grid, value: 'GRID' },
                { label: lang.curaSupport.lines, value: 'LINES' }
            ];
            cura2Support = [
                { label: lang.curaSupport.grid, value: 'GRID' },
                { label: lang.curaSupport.lines, value: 'LINES' },
                { label: lang.curaSupport.zigzag, value: 'ZIGZAG' }
            ];
            advancedSetting.engine = this.props.setting.engine;
            advancedSetting.load(this.props.setting, true);

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
                console.log('validate ', this.state);
                this.setState(this._createState(currentKey, lastValidValue));
            }
        },

        _isValidValue: function(key, value) {
            var min = parseInt(this.refs[key].getDOMNode().min),
                max = parseInt(this.refs[key].getDOMNode().max);

            return min <= value && value <= max;
        },

        _updateCustomField: function() {
            this.setState({ custom: advancedSetting.toExpert(this.state.custom, 'slic3r'),
                            customCura2: advancedSetting.toExpert(this.state.customCura2, 'cura2') });
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

        _savePreset: function(presetName, presets) {
            var self = this,
                p = presets === '' ? {} : presets;

            p[presetName] = advancedSetting.toString();

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
            advancedSetting.load(this.state[advancedSetting.getExpertKey()]);
        },

        _handleNavigate: function(selectedTab, e) {
            if(this.state.selectedTab === tab.CUSTOM) {
                this._processCustomInput();
            }
            e.preventDefault();
            if(this.state.selectedTab === tab.Custom) {
                this._processCustomInput();
            }
            this.setState({
                selectedTab: selectedTab
            });
        },

        _handleParameterChange: function(key, e) {
            if(e.type === 'keyup') {
                if(e.keyCode !== 8) {
                    return;
                }
            }
            var value = e.target.value;
            if(e.target.type === 'checkbox') {
                value = e.target.checked;
            }
            this.setState(this._createState(key, value));
        },

        _handleSelectPreset: function(name) {
            this.setState({ selectedPreset: name });
        },

        _handleListPreset: function() {
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

            InputLightboxActions.open('save-print-preset', {
                caption     : lang.saveAsPreset,
                inputHeader : lang.name,
                confirmText : lang.save,
                onSubmit    : this._handleSavePreset,
                onClose     : this._handleBackToSetting
            });
        },

        _handleSavePreset: function(presetName) {
            var self = this;
            this._getPresets(function(presets) {
                self._savePreset(presetName, presets);
            });
        },

        _handleControlValueChange: function(id, value) {
            if(typeof(value) === 'boolean') {
                var onValue = 1;
                if(id === 'skirts') {
                    onValue = 2;
                }
                advancedSetting.set(id, value ? onValue : 0);
            }
            else {
                advancedSetting.set(id, value);
            }

            const setFillPatternToRectilinear = () => {
                advancedSetting.set('fill_pattern', 'rectilinear');
                this.removeInfillSection = true;
                this.forceUpdate();
                setTimeout(() => { this.forceUpdate(); }, 10);
                AlertActions.showPopupError('', this.props.lang.slicer.pattern_not_supported_at_100_percent_infill);
            }
            let { engine, fill_density, fill_pattern } = advancedSetting;

            if(id === 'engine') {
                advancedSetting.engine = value;
                advancedSetting.fill_pattern = {'slic3r': 'honeycomb', 'cura': 'GRID', 'cura2':'TRIANGLES'}[value];
                advancedSetting.support_material_pattern = {'slic3r': 'rectilinear', 'cura': 'LINES', 'cura2':'ZIGZAG'}[value];
                this.setState({ showBridgeSpeed: value !== 'cura2' });
            }
            else if(id === 'fill_pattern' && value !== 'rectilinear') {
                if(engine === 'slic3r' && fill_density === '100') {
                    setFillPatternToRectilinear();
                }
            }
            else if(id === 'fill_density' && value === '100') {
                if(engine === 'slic3r' && fill_pattern !== 'rectilinear') {
                    setFillPatternToRectilinear();
                }
            }

            console.log("end of fillpattern", fill_pattern);

            this._updateCustomField();
        },

        _handleApplyPreset: function() {
            var p = this.state.presets[this.state.selectedPreset];
            advancedSetting.load(JSON.parse(p));
            var customKey = advancedSetting.getExpertKey();
            this.setState({ [customKey]: advancedSetting[customKey] }, function() {
                this._updateCustomField();
                this._handleBackToSetting();
            });
        },

        _handleApply: function(showAdvancedSetting) {
            this._processCustomInput();

            var _settings = advancedSetting.deepClone();
            this.props.onApply(_settings);
            if(!showAdvancedSetting) {
                this.props.onClose();
            }
        },

        _handleDeletePreset: function(e) {
            var self = this,
                presets = this.state.presets;

            delete presets[this.state.selectedPreset];

            self.setState({
                presets: presets,
                selectedPreset: Object.keys(presets)[0]
            });

            Config().write('preset-settings', JSON.stringify(presets));
        },

        _handleCloseAdvancedSetting: function(e) {
            e.preventDefault();
            this.props.onClose();
        },

        _handleLoadPreset: function() {
            this.setState({ custom: DefaultPrintSettings.custom,
                            customCura2: DefaultPrintSettings.customCura2  });
            if (advancedSetting.engine == 'cura2') {
                advancedSetting.load(DefaultPrintSettings.customCura2);
            } else {
                advancedSetting.load(DefaultPrintSettings.custom);
            }
        },

        _renderTabs: function() {
            var tabGeneral  = ClassNames('tab', {selected: this.state.selectedTab === tab.GENERAL}),
                tabLayers   = ClassNames('tab', {selected: this.state.selectedTab === tab.LAYERS}),
                tabInfill   = ClassNames('tab', {selected: this.state.selectedTab === tab.INFILL}),
                tabSupport  = ClassNames('tab', {selected: this.state.selectedTab === tab.SUPPORT}),
                tabSpeed    = ClassNames('tab', {selected: this.state.selectedTab === tab.SPEED}),
                tabCustom   = ClassNames('tab', {selected: this.state.selectedTab === tab.CUSTOM});

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
                    id: 'slic3r',
                    name: lang.slic3r
                },
                {
                    id: 'cura',
                    name: lang.cura
                },
                {
                    id: 'cura2',
                    name: lang.cura2
                }
            ];
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.slicingEngine}</div>
                        <div className="controls">
                            <div className="label"></div>
                            <RadioControl
                                id="engine"
                                options={options}
                                default={advancedSetting.engine}
                                onChange={this._handleControlValueChange}
                                />
                        </div>
                    </div>

                    <div className="section">
                        <div className="title">{lang.temperature}</div>
                        <SliderControl
                            id="temperature"
                            key="temperature"
                            label={lang.printing}
                            min={180}
                            max={230}
                            step={1}
                            default={advancedSetting.temperature}
                            onChange={this._handleControlValueChange} />
                        <SliderControl
                            id="first_layer_temperature"
                            key="first_layer_temperature"
                            label={lang.firstLayerTemperature}
                            min={180}
                            max={230}
                            step={1}
                            default={advancedSetting.first_layer_temperature}
                            onChange={this._handleControlValueChange} />
                        {/* <SwitchControl
                            id="detect_filament_runout"
                            label={lang.detect_filament_runout}
                            default={advancedSetting.detect_filament_runout === 1}
                            onChange={this._handleControlValueChange} /> */}
                    </div>

                    {/* <div className="section">
                        <div className="title">{lang.general}</div>
                        <SwitchControl
                            id="flux_calibration"
                            label={lang.flux_calibration}
                            default={advancedSetting.flux_calibration === 1}
                            onChange={this._handleControlValueChange} />
                        <SwitchControl
                            id="detect_head_tilt"
                            label={lang.detect_head_tilt}
                            default={advancedSetting.detect_head_tilt === 1}
                            onChange={this._handleControlValueChange} />
                    </div> */}

                </div>
            );
        },

        _renderLayersSection: function() {
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.layer_height_title}</div>

                        <SliderControl
                            id="layer_height"
                            key="layer_height"
                            label={lang.layer_height}
                            min={0.05}
                            max={0.3}
                            step={0.025}
                            default={advancedSetting.layer_height}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="first_layer_height"
                            key="first_layer_height"
                            label={lang.firstLayerHeight}
                            min={0.2}
                            max={0.35}
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
                            min={0}
                            max={12}
                            step={1}
                            default={advancedSetting.top_solid_layers}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="bottom_solid_layers"
                            key="bottom_solid_layers"
                            label={lang.solidLayerBottom}
                            min={0}
                            max={12}
                            step={1}
                            default={advancedSetting.bottom_solid_layers}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            );
        },

        _renderInfillSection: function() {
            if(this.removeInfillSection) {
                this.removeInfillSection = false;
                return <div></div>;
            }
            var infillPattern;
            if(advancedSetting.engine === 'cura') {
                infillPattern = curaInfill;
            } else if(advancedSetting.engine === 'cura2') {
                infillPattern = cura2Infill;
            }
            else {
                infillPattern = slic3rInfill;
            }

            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.infill}</div>

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
                            options={infillPattern}
                            default={advancedSetting.fill_pattern}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            );
        },

        _renderSupportSection: function() {
            console.log('render support', advancedSetting);

            var supportPattern;
            if(advancedSetting.engine === 'cura'){
                supportPattern = curaSupport;
            }
            else if(advancedSetting.engine === 'cura2') {
                supportPattern = cura2Support;
            }
            else {
                supportPattern = slic3rSupport;
            }

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
                            min={0.4}
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
                            options={supportPattern}
                            default={advancedSetting.support_material_pattern}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="support_material_contact_distance"
                            key="support_material_contact_distance"
                            label={lang.zDistance}
                            min={0}
                            max={1}
                            step={0.1}
                            default={advancedSetting.support_material_contact_distance}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.raft}</div>

                        <SwitchControl
                            id="raft"
                            label={lang.raft}
                            default={advancedSetting.raft === 1}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="raft_layers"
                            key="raft_layers"
                            label={lang.raftLayers}
                            min={0}
                            max={6}
                            step={1}
                            default={advancedSetting.raft_layers}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="brim_width"
                            key="brim_width"
                            label={lang.brim}
                            min={0}
                            max={10}
                            step={1}
                            default={advancedSetting.brim_width}
                            onChange={this._handleControlValueChange} />

                        <SwitchControl
                            id="skirts"
                            label={lang.skirts}
                            default={advancedSetting.skirts > 0}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            );
        },

        _renderSpeedSection: function() {
            let bridgeSpeed = (
                <SliderControl
                    id="bridge_speed"
                    key="bridge_speed"
                    label={lang.bridge}
                    min={1}
                    max={100}
                    step={1}
                    default={advancedSetting.bridge_speed}
                    onChange={this._handleControlValueChange} />
            );
            bridgeSpeed = this.state.showBridgeSpeed ? bridgeSpeed : '';
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.movement}</div>
                        <SliderControl
                            id="travel_speed"
                            key="travel_speed"
                            label={lang.traveling}
                            min={10}
                            max={200}
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
                            max={100}
                            step={1}
                            default={advancedSetting.support_material_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="infill_speed"
                            key="infill_speed"
                            label={lang.infill}
                            min={10}
                            max={100}
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
                            max={100}
                            step={1}
                            default={advancedSetting.first_layer_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="solid_infill_speed"
                            key="solid_infill_speed"
                            label={lang.solidLayers}
                            min={1}
                            max={100}
                            step={1}
                            default={advancedSetting.solid_infill_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="perimeter_speed"
                            key="perimeter_speed"
                            label={lang.innerShell}
                            min={1}
                            max={100}
                            step={1}
                            default={advancedSetting.perimeter_speed}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="external_perimeter_speed"
                            key="external_perimeter_speed"
                            label={lang.outerShell}
                            min={1}
                            max={100}
                            step={1}
                            default={advancedSetting.external_perimeter_speed}
                            onChange={this._handleControlValueChange} />

                        {bridgeSpeed}

                    </div>

                </div>
            );
        },

        _renderCustomSection: function() {
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.config}
                            <div className="load-preset" onClick={this._handleLoadPreset}>{lang.reloadPreset}</div>
                        </div>

                        <div className="controls">
                            <div className="label pull-left"></div>
                            <div className="control">
                                <div className="textarea-container">
                                    <textarea
                                        rows="20"
                                        cols="50"
                                        value={this.state[advancedSetting.getExpertKey()]}
                                        onChange={this._handleParameterChange.bind(null, advancedSetting.engine === 'cura2' ? 'customCura2' : 'custom')}
                                        // onKeyUp={this._handleParameterChange.bind(null, advancedSetting.engine === 'cura2' ? 'customCura2' : 'custom')}
                                    />
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

                case tab.GENERAL:
                    content = self._renderGeneralSection(); break;

                case tab.LAYERS:
                    content = self._renderLayersSection(); break;

                case tab.INFILL:
                    content = self._renderInfillSection(); break;

                case tab.SUPPORT:
                    content = self._renderSupportSection(); break;

                case tab.SPEED:
                    content = self._renderSpeedSection(); break;

                case tab.CUSTOM:
                    content = self._renderCustomSection(); break;

                default:
                    break;
            }

            return content;
        },

        _renderFooter: function() {
            var buttons = [];

            switch(this.state.mode) {

                case mode.setup:
                    buttons[0] = (<button className="btn btn-default" data-ga-event="load-preset" title={lang.loadPreset} onClick={this._handleListPreset}><i className="fa fa-folder-open-o"></i></button>);
                    buttons[1] = (<button className="btn btn-default" data-ga-event="cancel-preset" onClick={this._handleCloseAdvancedSetting}>{lang.cancel}</button>);
                    buttons[2] = (<button className="btn btn-default" data-ga-event="save-preset" title={lang.savePreset} onClick={this._handleOpenSaveAsPreset}><i className="fa fa-floppy-o"></i></button>);
                    buttons[3] = (<button className="btn btn-default" data-ga-event="apply-preset" onClick={this._handleApply.bind(null, false)}>{lang.apply}</button>);
                    break;

                case mode.load:
                    buttons[0] = (<button className="btn btn-default" data-ga-event="delete-preset" onClick={this._handleDeletePreset}>{lang.delete}</button>);
                    buttons[2] = '';
                    buttons[1] = (<button className="btn btn-default" data-ga-event="back-to-preset-setting" onClick={this._handleBackToSetting}>{lang.cancel}</button>);
                    buttons[3] = (<button className="btn btn-default" data-ga-event="apply-preset" onClick={this._handleApplyPreset}>{lang.apply}</button>);
                    break;

                default:
                    break;

            }

            return (
                <div className="footer">

                    <div className="left">
                        {buttons[0]}
                        {buttons[2]}
                    </div>

                    <div className="right">
                        {buttons[1]}
                        {buttons[3]}
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
                presetContent = JSON.parse(preset),
                custom = preset.engine === 'cura2' ? presetContent.customCura2 : presetContent.custom;

            console.log('preset.engine', preset.engine);

            return (
                <div id="advanced-panel" className="advanced-panel">
                    <div className="preset-wrapper">
                        <div className="preset-header">{lang.loadPreset}</div>
                        <div className="preset-list">
                            {entries}
                        </div>
                        <textarea className="preset-content" value={custom} disabled />
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
                cx = React.addons.classSet,
                className = {
                    'hide': (this.state.mode === mode.save),
                    'box-shadow': true
                },
                UI;

            switch(this.state.mode) {

                case mode.setup:
                    UI = self._renderSetupUI(); break;

                case mode.load:
                    UI = self._renderLoadPresetUI(); break;

                default: break;
            }

            return <Modal className={className} content={UI} onClose={this._handleCloseAdvancedSetting}/>;
        }

    });
});
