define([
    'jquery',
    'react',
], function($, React) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onPlatformClick: React.PropTypes.func,
                onSupportClick: React.PropTypes.func,
                onShowAdvancedSetting: React.PropTypes.func,
                onPrintStart: React.PropTypes.func
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
        render: function() {
            var lang = this.props.lang,
                printSpeedOptions,
                materialOptions;

            printSpeedOptions = lang.print.params.beginner.print_speed.options.map(function(o) {
                return (<option>{o.label}</option>);
            });

            materialOptions = lang.print.params.beginner.material.options.map(function(o) {
                return (<option>{o.label}</option>);
            });

            return (
                <div id="setup-panel" className="setup-panel">
                    <div className="main">
                        <div className="time">1 HR 30 MIN</div>
                        <div className="setup">
                            <div className="icon print-speed"></div>
                            <div className="controls">
                                <div className="label">{lang.print.params.beginner.print_speed.text}</div>
                                <div className="control">
                                    <select>
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
                                    <label>{lang.print.params.beginner.support.options[0].label}</label>
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

                    <a className="btn btn-print" onClick={this._handlePrintStart}><span className="fa fa-print"></span>{lang.print.start_print}</a>
                </div>
            );
        }

    });
});