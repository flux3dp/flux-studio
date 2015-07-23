define([
    'react',
    'jsx!widgets/Select'
], function(React, SelectView) {
    'use strict';

    return React.createClass({
        render: function() {
            var props = this.props,
                lang = props.lang,
                mode = ('engrave' === props.mode ? lang.laser.start_engrave : lang.laser.start_cut);

            return (
                <div className="setup-panel operating-panel">
                    <div className="main">
                        <div className="time">1 hr 30min</div>
                        <div className="setup">
                            <div className="icon print-speed"></div>
                            <div className="controls">
                                <div className="label">{lang.laser.print_params.material.text}</div>
                                <div className="control">
                                    <SelectView className="span12" name="material" options={lang.laser.print_params.material.options}/>
                                </div>
                            </div>
                        </div>
                        <div className="setup">
                            <div className="icon material"></div>
                            <div className="controls">
                                <div className="label">{lang.laser.print_params.object_height.text}</div>
                                <div className="control">
                                    0.3
                                    <span>{lang.laser.print_params.object_height.unit}</span>
                                </div>
                            </div>
                        </div>
                        <div className="setup last-setup">
                            <button className="btn btn-default btn-full-width">{lang.laser.advenced}</button>
                        </div>
                    </div>
                    <button id="btn-start" className="btn btn-action btn-full-width btn-start">
                        <img src="/img/icon-laser-s.png"/>
                        {mode}
                    </button>
                </div>
            );
        }

    });
});