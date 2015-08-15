define([
    'react',
    'jsx!widgets/Select'
], function(React, SelectView) {
    'use strict';

    return React.createClass({
        // UI events
        _onScanClick: function (e) {
            this.props.onScanClick(e, this.refs);
        },

        _onCancelClick: function (e) {
            this.props.onCancelClick(e);
        },

        _onSaveClick: function (e) {
            this.props.onSaveClick(e);
        },

        _onConvertClick: function (e) {
            this.props.onConvertClick(e);
        },

        _onScanAgainClick: function (e) {
            console.log('again');
            this.props.onScanAgainClick(e);
        },

        _getButtonsConfig: function(lang) {
            var self = this,
                props = self.props,
                cx = React.addons.classSet,
                basicStyle = {
                    'btn': true,
                    'btn-action': true,
                    'btn-full-width': true,
                    'fa': true
                },
                buttons = [
                    // scan | multiscan
                    {
                        label: (
                            0 < props.scanTimes
                            ? lang.scan.start_multiscan
                            : lang.scan.start_scan
                        ),
                        eventHandler: self._onScanClick,
                        basicStyle: JSON.parse(JSON.stringify(basicStyle)),
                        specificStyle: {
                            'fa-bullseye': true,
                            // limits 2 times
                            'btn-disabled': 2 === props.scanTimes || true === props.disabledScanButton
                        },
                        display: true === props.showScanButton
                    },
                    // cancel scan
                    {
                        label: lang.scan.cancel_scan,
                        eventHandler: self._onCancelClick,
                        basicStyle: JSON.parse(JSON.stringify(basicStyle)),
                        specificStyle: {
                            'fa-stop': true,
                            'btn-disabled': false
                        },
                        display: false === props.showScanButton
                    },
                    // convert
                    {
                        label: lang.scan.convert_to_stl,
                        eventHandler: self._onConvertClick,
                        basicStyle: JSON.parse(JSON.stringify(basicStyle)),
                        specificStyle: {
                            'fa-bullseye': true,
                            'btn-disabled': true === props.isScanStarted || true === props.disabledConvertButton
                        },
                        display: 0 < props.scanTimes
                    },
                    // save (export)
                    {
                        label: lang.scan.do_save,
                        eventHandler: self._onSaveClick,
                        basicStyle: JSON.parse(JSON.stringify(basicStyle)),
                        specificStyle: {
                            'fa-bullseye': true,
                            'btn-disabled': true === props.isScanStarted
                        },
                        display: 0 < props.scanTimes
                    },
                    // scan again
                    {
                        label: lang.scan.scan_again,
                        eventHandler: self._onScanAgainClick,
                        basicStyle: JSON.parse(JSON.stringify(basicStyle)),
                        specificStyle: {
                            'fa-bullseye': true,
                            'btn-disabled': true === props.isScanStarted
                        },
                        display: 0 < props.scanTimes
                    }
                ];

            return buttons.map(function(button) {
                var styles = button.basicStyle;

                for (var key in button.specificStyle) {
                    styles[key] = button.specificStyle[key];
                }

                styles = cx(styles);

                if (true === button.display) {
                    return (
                        <button onClick={button.eventHandler} className={styles}>
                            {button.label}
                        </button>
                    );
                }
                else {
                    return '';
                }

            });
        },

        _renderButtons: function(lang) {
            var props = this.props,
                buttons = this._getButtonsConfig(lang);

            return (
                <div className="action-buttons">
                    {buttons}
                </div>
            );
        },

        render: function() {
            var props = this.props,
                start_scan_text,
                cx = React.addons.classSet,
                lang = props.lang,
                buttons = this._renderButtons(lang);

            return (
                <div className="setup-panel operating-panel">
                    <div className="main">
                        <div className="time">
                            {lang.scan.remaining_time}
                        </div>
                        <div className="setup">
                            <div className="icon print-speed"></div>
                            <div className="controls">
                                <div className="label">{lang.scan.scan_params.scan_speed.text}</div>
                                <div className="control">
                                    <SelectView name="scan_speed" ref="scan_speed" className="span12" options={lang.scan.scan_params.scan_speed.options}/>
                                </div>
                            </div>
                        </div>
                        <div className="setup">
                            <div className="icon material"></div>
                            <div className="controls">
                                <div className="label">{lang.scan.scan_params.luminance.text}</div>
                                <div className="control">
                                    <SelectView ref="luminance" className="luminance span12" options={lang.scan.scan_params.luminance.options}/>
                                </div>
                            </div>
                        </div>
                        <div className="setup last-setup">
                            <div className="icon material"></div>
                            <div className="controls">
                                <div className="label">{lang.scan.scan_params.object.text}</div>
                                <div className="control">
                                    <SelectView ref="object_height" className="object-height span12" options={lang.scan.scan_params.object.options}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {buttons}
                </div>
            );
        },

        getDefaultProps: function() {
            return {
                onScanClick: React.PropTypes.func,
                onCancelClick: React.PropTypes.func,
                onSaveClick: React.PropTypes.func,
                onConvertClick: React.PropTypes.func,
                onScanAgainClick: React.PropTypes.func,
                scanTimes: React.PropTypes.number,
                isScanStarted: React.PropTypes.bool,
                showScanButton: React.PropTypes.bool,
                disabledScanButton: React.PropTypes.bool,
                disabledConvertButton: React.PropTypes.bool
            };
        }

    });
});