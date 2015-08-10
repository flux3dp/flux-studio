define([
    'react',
    'jsx!widgets/Select'
], function(React, SelectView) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onScanClick: React.PropTypes.func,
                enabledScanButton: React.PropTypes.bool
            };
        },
        _onScanClick: function (e) {
            this.props.onScanClick(e, this.refs);
        },
        render: function() {
            var props = this.props,
                start_scan_text,
                cx = React.addons.classSet,
                lang = props.lang,
                button_class = cx({
                    'btn btn-action span12 fa fa-bullseye': true,
                    'btn-disabled': props.enabledScanButton
                });

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
                    <button id="btn-scan" onClick={this._onScanClick} className={button_class}>
                        {lang.scan.start_scan_text}
                    </button>
                </div>
            );
        }

    });
});