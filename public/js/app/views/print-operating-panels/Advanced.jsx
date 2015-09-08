define([
    'jquery',
    'react'
], function($, React) {
    'use strict';
    var advancedSetting;
    return React.createClass({
        getDefaultProps: function() {
            return {
                onCancel: React.PropTypes.func,
                onDone  : React.PropTypes.func,
                setting : React.PropTypes.object
            };
        },
        getInitialState: function() {
            advancedSetting = this.props.setting;
            return {
                infill          : advancedSetting.infill * 100 || 20,
                layerHeight     : advancedSetting.layerHeight || 0.2,
                travelingSpeed  : advancedSetting.travelingSpeed || 88,
                extrudingSpeed  : advancedSetting.extrudingSpeed || 58,
                temperature     : advancedSetting.temperature || 200,
                advancedSettings: advancedSetting.advancedSettings
            };
        },
        _handleLayerHeightChange: function(e) {
            var layerHeight = parseFloat(e.target.value);
            advancedSetting.layerHeight = layerHeight;
            this.setState({ layerHeight: layerHeight });
        },
        _handleInfillChange: function(e) {
            var infill = parseInt(e.target.value);
            advancedSetting.infill = infill / 100;
            this.setState({ infill: infill });
        },
        _handleTravelingSpeedChange: function(e) {
            var travelingSpeed = parseInt(e.target.value);
            advancedSetting.travelingSpeed = travelingSpeed;
            this.setState({ travelingSpeed: travelingSpeed });
        },
        _handleExtrudingSpeedChange: function(e) {
            var extrudingSpeed = parseInt(e.target.value);
            advancedSetting.extrudingSpeed = extrudingSpeed;
            this.setState({ extrudingSpeed: extrudingSpeed });
        },
        _handleTemperatureChange: function(e) {
            var temperature = parseInt(e.target.value);
            advancedSetting.temperature = temperature;
            this.setState({ temperature: temperature });
        },
        _handleSupportChange: function(e) {
            advancedSetting.support = e.target.value;
        },
        _handleIniChange: function(e) {
            var value = !!e.target.value ? e.target.value : ' ';
            advancedSetting.advancedSettings = value;
            this.setState({ advancedSettings: value });
        },
        _handleCancel: function(e) {
            this.props.onCancel(e);
        },
        _handleDone: function(e) {
            this.props.onDone(advancedSetting);
        },
        _renderQualitySection: function(lang) {
            return (
                <div className="section">
                    <div className="title">{lang.quality}</div>
                    <div className="controls">
                        <div className="label pull-left">{lang.layer_height}</div>
                        <div className="control pull-right">
                            <div className="slider-container">
                                <input className="slider" type="range" min="0.02" max="0.3" step="0.01" value={this.state.layerHeight} onChange={this._handleLayerHeightChange} />
                            </div>
                            <input type="text" readOnly value={this.state.layerHeight + 'mm'} />
                        </div>
                    </div>
                    <div className="controls">
                        <div className="label pull-left">{lang.infill}</div>
                        <div className="control pull-right">
                            <div className="slider-container">
                                <input className="slider" type="range" min="0" max="100" value={this.state.infill} onChange={this._handleInfillChange} />
                            </div>
                            <input type="text" readOnly value={this.state.infill + '%'} />
                        </div>
                    </div>
                </div>
            );
        },
        _renderSpeedSection: function(lang) {
            return (
                <div className="section">
                    <div className="title">{lang.speed}</div>
                    <div className="controls">
                        <div className="label pull-left">{lang.speed_while_traveling}</div>
                        <div className="control pull-right">
                            <div className="slider-container">
                                <input className="slider" type="range" min="5" max="200" step="1" value={this.state.travelingSpeed} onChange={this._handleTravelingSpeedChange} />
                            </div>
                            <input type="text" readOnly value={this.state.travelingSpeed} />
                        </div>
                    </div>
                    <div className="controls">
                        <div className="label pull-left">{lang.speed_while_extruding}</div>
                        <div className="control pull-right">
                            <div className="slider-container">
                                <input className="slider" type="range" min="5" max="200" step="1" value={this.state.extrudingSpeed} onChange={this._handleExtrudingSpeedChange} />
                            </div>
                            <input type="text" readOnly value={this.state.extrudingSpeed} />
                        </div>
                    </div>
                </div>
            );
        },
        _renderTemperatureSection: function(lang) {
            return(
                <div className="section">
                    <div className="title">{lang.temperature}</div>
                    <div className="controls">
                        <div className="label pull-left">{lang.printing_temperature}</div>
                        <div className="control pull-right">
                            <div className="slider-container">
                                <input className="slider" type="range" min="160" max="250" step="1" value={this.state.temperature} onChange={this._handleTemperatureChange} />
                            </div>
                            <input type="text" readOnly value={this.state.temperature} />
                        </div>
                    </div>
                </div>
            );
        },
        _renderSupportSection: function(lang) {
            return '';
            // this feature will be support in the future
            /*
            var lang = this.props.lang.print.advanced;
            return (
                <div className="section">
                    <div className="title">{lang.support}</div>
                    <div className="controls">
                        <div className="label pull-left">{lang.support_type.label}</div>
                        <div className="control pull-right">
                            <select onChange={this._handleSupportChange}>
                                <option>{lang.support_type.touch_buildplate}</option>
                                <option>{lang.support_type.everywhere}</option>
                            </select>
                        </div>
                    </div>
                </div>
            );
            */
        },
        _renderIniSection: function(lang) {
            return (
                <div className="section">
                    <div className="title">{lang.direct_setting}</div>
                    <div className="controls">
                        <div className="control">
                            <textarea value={this.state.advancedSettings} onChange={this._handleIniChange}></textarea>
                        </div>
                    </div>
                </div>
            );
        },
        _renderFooter: function() {
            return (
                <div className="footer">
                    <a data-ga-event="cancel-print-advanced" className="btn btn-default" onClick={this._handleCancel}>{this.props.lang.print.cancel}</a>
                    <a data-ga-event="apply-print-advanced" className="btn btn-confirm" onClick={this._handleDone}>{this.props.lang.print.done}</a>
                </div>
            );
        },
        render: function() {
            var lang = this.props.lang.print.advanced,
                qualitySection = this._renderQualitySection(lang),
                speedSection = this._renderSpeedSection(lang),
                temperatureSection = this._renderTemperatureSection(lang),
                supportSection = this._renderSupportSection(lang),
                iniSection = this._renderIniSection(lang),
                footer = this._renderFooter(lang);

            return (
                <div id="advanced-panel" className="advanced-panel">

                    <div className="container">

                        <div className="header">{lang.label}</div>

                        {qualitySection}

                        {speedSection}

                        {temperatureSection}

                        {supportSection}

                        {iniSection}

                    </div>

                    {footer}

                </div>

            );
        }

    });
});
