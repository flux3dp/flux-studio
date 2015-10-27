define([
    'jquery',
    'react',
    'jsx!widgets/Slider-Control',
    'jsx!widgets/Dropdown-Control',
    'jsx!widgets/Switch-Control',
    'plugins/classnames/index'
], function($, React, SliderControl, DropdownControl, SwitchControl, ClassNames) {
    'use strict';

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

    var presets = ['preset 1', 'preset 2', 'preset 3', 'preset 4', 'preset 5'],
        advancedSetting = {
            // General
            engine              : '',
            temperature         : 200,

            // Layers
            layerHeight         : 0.2,
            firstLayerHeight    : 0.25,
            shellSurface        : 3,
            solidLayerTop       : 3,
            solidLayerBottom    : 3,

            // Infill
            density             : 10,
            infillPattern       : 'auto',
            shellSurfaceOn      : false,

            // Support
            generalSupportOn    : true,
            spacing             : 2.5,
            overhang            : 60,
            supportPattern      : 'auto',
            zDistance           : 0.2,
            raftLayers          : 4,

            // Speed
            traveling           : 150,
            support             : 80,
            infill              : 80,
            firstLayer          : 30,
            solidLayers         : 20,
            innerShell          : 70,
            outerShell          : 50,
            bridge              : 60,

            // Custom
            custom              : ''
        }

    return React.createClass({

        getInitialState: function() {
            return {
                mode                : 1,
                selectedTab         : 1,

                // Presets
                selectedPreset      : ''
            }
        },

        componentWillMount: function() {
            lang = this.props.lang.print.advanced;
        },

        _createState: function(key, value) {
            var newState = {};
            newState[key] = value;
            return newState;
        },

        _validateValue: function(e) {
            if(!this._isValidValue(currentKey, this.state[currentKey])) {
                this.setState(this._createState(currentKey, lastValidValue));
            }
        },

        _isValidValue: function(key, value) {
            var min = parseInt(this.refs[key].getDOMNode().min),
                max = parseInt(this.refs[key].getDOMNode().max);

            return min <= value && value <= max;
        },

        _handleNavigate: function(selectedTab, e) {
            e.preventDefault();
            this.setState({
                selectedTab: selectedTab
            });
            // switch(selectedTab) {
            //     case tab.General:
            //         console.log('general');
            //         break;
            //     case tab.Layers:
            //         console.log('layers');
            //         break;
            //     case tab.Infill:
            //         console.log('infill');
            //         break;
            //     case tab.Support:
            //         console.log('support');
            //         break;
            //     case tab.Speed:
            //         console.log('speed');
            //         break;
            //     case tab.Custom:
            //         console.log('custom');
            //         break;
            //     default:
            //         break;
            // }
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
            this.setState({ mode: mode.load });
        },

        _handleBackToSetting: function() {
            this.setState({ mode: mode.setup });
        },

        _handleSavePreset: function() {
            this.setState({ mode: mode.save });
        },

        _handleEditValue: function(e) {
            var newValue    = e.target.value;
            currentKey  = e.target.id;

            if(this._isValidValue(currentKey, newValue)) {
                lastValidValue = newValue;
            }

            this.setState(this._createState(currentKey, newValue));
        },

        _handleControlValueChange: function(id, value) {
            console.log(id, value);
            advancedSetting[id] = value;
        },

        _renderSliderControl: function(key, min, max, step) {
            return (
                <div className="control pull-right">

                    <div className="slider-container">
                        <input className="slider" type="range" min={min} max={max} step={step}
                            ref={key}
                            value={this.state[key]}
                            onChange={this._handleParameterChange.bind(null, key)} />
                    </div>

                    <input id={key} type="text" value={this.state[key]}
                        onChange={this._handleEditValue}
                        onFocus={this._handleEditValue}
                        onBlur={this._validateValue} />
                </div>
            );
        },

        _renderSwitchControl: function(key) {
            return (
                <div className="switch-container">
                    <div className="switch-status">{this.state[key] ? 'ON' : 'OFF'}</div>
                    <div className="onoffswitch">
                        <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={key}
                            onChange={this._handleParameterChange.bind(null, key)}
                            checked={this.state[key]} />
                        <label className="onoffswitch-label" htmlFor={key}>
                            <span className="onoffswitch-inner"></span>
                            <span className="onoffswitch-switch"></span>
                        </label>
                    </div>
                </div>
            );
        },

        _renderDropdownControl: function(key, options, defaultValue) {
            var _options = options.map(function(option) {
                var isSelected = option === defaultValue ? 'selected' : '';
                return (<option value={option} selected={isSelected}>{option}</option>);
            });

            return (
                <select onChange={this._handleParameterChange.bind(null, key)}>
                    {_options}
                </select>
            );
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
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.slicingEngine}</div>
                        <div className="controls">
                            <div className="label"></div>
                            <div className="control">
                                <div>
                                    <div className="radio"></div>
                                    <span>{lang.slic3r}</span>
                                </div>
                                <div>
                                    <div className="radio"></div>
                                    <span>{lang.experiment}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section">
                        <div className="title">{lang.filament}</div>
                        <SliderControl
                            id="temperature"
                            label={lang.temperature}
                            min={10}
                            max={230}
                            step={1}
                            default={advancedSetting.temperature}
                            onChange={this._handleControlValueChange} />

                    </div>

                </div>
            )
        },

        _renderLayersSection: function() {
            return (
                <div className="content-wrapper">

                    <div className="section">
                        <div className="title">{lang.layerHeight}</div>

                        <SliderControl
                            id="layerHeight"
                            label={lang.layerHeight}
                            min={0.02}
                            max={20}
                            step={0.01}
                            default={advancedSetting.layerHeight}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="firstLayerHeight"
                            label={lang.firstLayerHeight}
                            min={0.02}
                            max={0.4}
                            step={0.01}
                            default={advancedSetting.firstLayerHeight}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.shell}</div>

                        <SliderControl
                            id="shellSurface"
                            label={lang.shellSurface}
                            min={0}
                            max={20}
                            step={1}
                            default={advancedSetting.shellSurface}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="solidLayerTop"
                            label={lang.solidLayerTop}
                            min={0}
                            max={20}
                            step={1}
                            default={advancedSetting.solidLayerTop}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="solidLayerBottom"
                            label={lang.solidLayerBottom}
                            min={0}
                            max={20}
                            step={1}
                            default={advancedSetting.solidLayerBottom}
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
                            id="density"
                            label={lang.density}
                            min={0}
                            max={100}
                            step={1}
                            default={advancedSetting.density}
                            onChange={this._handleControlValueChange} />

                        <DropdownControl
                            id="infillPattern"
                            label={lang.pattern}
                            options={[lang.auto, lang.line, lang.rectilinear, lang.honeycomb]}
                            default={advancedSetting.infillPattern}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.blackMagic}</div>

                        <SwitchControl
                            id="shellSurfaceOn"
                            label={lang.shellSurface}
                            default={advancedSetting.shellSurfaceOn}
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
                            id="generalSupportOn"
                            label={lang.generalSupport}
                            default={advancedSetting.generalSupportOn}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="spacing"
                            label={lang.spacing}
                            min={0.1}
                            max={50}
                            step={0.1}
                            default={advancedSetting.spacing}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="overhang"
                            label={lang.overhang}
                            min={0}
                            max={90}
                            step={1}
                            default={advancedSetting.overhang}
                            onChange={this._handleControlValueChange} />

                        <DropdownControl
                            id="supportPattern"
                            label={lang.pattern}
                            options={[lang.auto, lang.line, lang.rectilinear, lang.honeycomb]}
                            default={advancedSetting.supportPattern}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="zDistance"
                            label={lang.zDistance}
                            min={0.05}
                            max={20}
                            step={0.01}
                            default={advancedSetting.zDistance}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.raft}</div>

                        <SliderControl
                            id="raftLayers"
                            label={lang.raftLayers}
                            min={0}
                            max={20}
                            step={1}
                            default={advancedSetting.raftLayers}
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
                            id="traveling"
                            label={lang.traveling}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.traveling}
                            onChange={this._handleControlValueChange} />
                    </div>

                    <div className="section">
                        <div className="title">{lang.structure}</div>

                        <SliderControl
                            id="support"
                            label={lang.support}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.support}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="infill"
                            label={lang.infill}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.infill}
                            onChange={this._handleControlValueChange} />

                    </div>

                    <div className="section">
                        <div className="title">{lang.surface}</div>

                        <SliderControl
                            id="firstLayer"
                            label={lang.firstLayer}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.firstLayer}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="solidLayers"
                            label={lang.solidLayers}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.solidLayers}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="innerShell"
                            label={lang.innerShell}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.innerShell}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="outerShell"
                            label={lang.outerShell}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.outerShell}
                            onChange={this._handleControlValueChange} />

                        <SliderControl
                            id="bridge"
                            label={lang.bridge}
                            min={1}
                            max={150}
                            step={1}
                            default={advancedSetting.bridge}
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
                                    <textarea rows="20" cols="50" value={this.state.custom} onChange={this._handleParameterChange.bind(null, 'custom')} />
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
                    button2 = (<a className="btn">{lang.apply}</a>);
                    button3 = (<a className="btn" onClick={this._handleSavePreset}>{lang.saveAsPreset}</a>);
                    break;

                case mode.load:
                    button1 = '';
                    button2 = (<a className="btn">{lang.apply}</a>);
                    button3 = (<a className="btn" onClick={this._handleBackToSetting}>{lang.cancel}</a>);
                    break;

                case mode.save:
                    button1 = '';
                    button2 = (<a className="btn">{lang.saveAndApply}</a>);
                    button3 = (<a className="btn" onClick={this._handleBackToSetting}>{lang.cancel}</a>);

                default:
                    break;

            }

            return (
                <div className="footer">

                    <div className="left">
                        {button1}
                    </div>

                    <div className="right">
                        {button2}
                        {button3}
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
                entryClass;

            entries = presets.map(function(entry) {
                entryClass = ClassNames('preset-entry', {'selected': self.state.selectedPreset === entry});
                return (
                    <div className={entryClass} onClick={self._handleSelectPreset.bind(null, entry)}>
                        <span>{entry}</span>
                    </div>
                );
            });

            return (
                <div id="advanced-panel" className="advanced-panel">
                    <div className="preset-wrapper">
                        <div className="preset-header">{lang.presets}</div>
                        <div className="preset-list">
                            {entries}
                        </div>
                        <div className="preset-content"></div>
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
                            <input type="text" />
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
