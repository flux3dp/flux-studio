define([
    'jquery',
    'react',
    'app/actions/print'
], function($, React, printController) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onPlatformClick: React.PropTypes.func,
                onSupportClick: React.PropTypes.func,
                onShowAdvancedSetting: React.PropTypes.func,
                onPrintStart: React.PropTypes.func,
                onSpeedChange: React.PropTypes.func
            };
        },
        getInitialState: function() {
            return {
                platformOn: true,
                supportOn: true
            };
        },
        _handlePlatformClick: function (e) {
            this.props.onPlatformClick(this.state.platformOn);
            this.setState({ platformOn: !this.state.platformOn });
        },
        _handleSupportClick: function(e) {
            this.props.onSupportClick(this.state.supportOn);
            this.setState({ supportOn: !this.state.supportOn });
        },
        _handleShowAdvanceSetting: function(e) {
            this.props.onShowAdvancedSetting();
        },
        _handlePrintStart: function(e) {
            this.props.onPrintStart();
        },
        _handlePrintSpeedChange: function(e) {
            this.props.onSpeedChange(e.target.value.toLowerCase());
        },
        render: function() {
            var lang = this.props.lang,
                printSpeedOptions,
                materialOptions,
                boundingBox;

            printSpeedOptions = lang.print.params.beginner.print_speed.options.map(function(o) {
                return (<option>{o.label}</option>);
            });

            materialOptions = lang.print.params.beginner.material.options.map(function(o) {
                return (<option>{o.label}</option>);
            });

            boundingBox = printController.getSelectedObjectSize();
            boundingBox = typeof(boundingBox) === 'undefined' ? {x: 0, y: 0, z: 0} : boundingBox.box.size();

            return (
                <div id="setup-panel" className="setup-panel">
                    <div className="main">
                        <div className="time">1 HR 30 MIN</div>
                        <div className="setup">
                            <div className="icon print-speed"></div>
                            <div className="controls">
                                <div className="label">{lang.print.params.beginner.print_speed.text}</div>
                                <div className="control">
                                    <select onChange={this._handlePrintSpeedChange}>
                                        {printSpeedOptions}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="setup">
                            <div className="icon material"></div>
                            <div className="controls">
                                <div className="label">{lang.print.params.beginner.material.text}</div>
                                <div className="control">
                                    <select>
                                        {materialOptions}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="setup">
                            <div className="icon platform"></div>
                            <div className="controls">
                                <div className="label">{lang.print.params.beginner.platform.text}</div>
                                <div className="control">
                                    <label>{lang.print.params.beginner.platform.options[0].label}</label>
                                    <div className="switchContainer">
                                        <input type="checkbox" id="platformSwtich" name="platformSwtich" className="switch" onClick={this._handlePlatformClick} />
                                        <label htmlFor="platformSwtich">&nbsp;</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="setup">
                            <div className="icon support"></div>
                            <div className="controls">
                                <div className="label">{lang.print.params.beginner.support.text}</div>
                                <div className="control">
                                    <label>{lang.print.params.beginner.support.on}</label>
                                    <div className="switchContainer">
                                        <input type="checkbox" id="supportSwitch" name="supportSwitch" className="switch" onClick={this._handleSupportClick} />
                                        <label htmlFor="supportSwitch">&nbsp;</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="setup">
                            <a className="btn btn-default btn-default" onClick={this._handleShowAdvanceSetting}>{lang.settings.printer.advanced}</a>
                        </div>
                    </div>

                    <div>
                        <button className="btn action file-importer">
                            <div className="fa fa-plus"></div>
                            {lang.print.import}
                            <input type="file" accept=".stl" onChange={this.props.onImport} />
                        </button>
                    </div>
                    <div><a className="btn action btn-save" onClick={this.props.onSave}><span className="fa fa-floppy-o"></span>{lang.print.save}</a></div>
                    <div><a className="btn action btn-print" onClick={this._handlePrintStart}><span className="fa fa-print"></span>{lang.print.start_print}</a></div>
                    <div>{Math.round(boundingBox.x * 0.1) + 'mm x ' + Math.round(boundingBox.y * 0.1) + 'mm x ' + Math.round(boundingBox.z * 0.1) + 'mm'}</div>
                </div>
            );
        }

    });
});
