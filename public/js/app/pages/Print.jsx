define([
    'jquery',
    'react',
    'helpers/display',
    'app/actions/print',
    'jsx!widgets/Radio-Group',
    'css!cssHome/pages/print'
], function($, React, display, printEvents, RadioGroupView) {
    'use strict';

    return function(args) {
        args = args || {};

        var lang = args.state.lang,
            view = React.createClass({
                getInitialState: function() {
                    return ({
                        checked: false
                    });
                },
                componentDidMount: function() {
                    printEvents(args);
                },
                _handleCheck: function(e) {
                },
                _renderHeader: function() {
                    return (
                        <header>
                            <div id="uploader">
                                <button className="btn">
                                    <i className="fa fa-plus"></i>
                                    {lang.print.import}
                                </button>
                            </div>

                            <div className="pull-right">
                                <i></i>
                                <span>{lang.print.quick_print}</span>
                                <i className="fa fa-caret-down"></i>
                            </div>

                            <div className="pull-right">
                                <i className="fa fa-eye"></i>
                                <span>{lang.print.normal_preview}</span>
                                <i className="fa fa-caret-down"></i>
                            </div>
                        </header>
                    );
                },
                _renderOperatingPanel: function() {
                    return (
                        <div id="operating-panel" className="operating-panel">
                            <div className="panel">
                                <div className="operation up"><img src="/img/icon-3d-arrow-up.png" /></div>
                                <div className="operation right"><img src="/img/icon-3d-arrow-right.png" /></div>
                                <div className="operation down"><img src="/img/icon-3d-arrow-down.png" /></div>
                                <div className="operation left"><img src="/img/icon-3d-arrow-left.png" /></div>
                                <div className="operation home"><img src="/img/icon-home-s.png" /></div>
                                <div className="operation command">
                                    <div className="scale"></div>
                                    <div className="rotate"></div>
                                    <div className="center"></div>
                                    <div className="delete"></div>
                                </div>
                            </div>
                            <div className="panel">
                                <div className="zoom">
                                    <div className="out"><img src="/img/icon-zoomout.png" /></div>
                                    <div className="divider"></div>
                                    <div className="in"><img src="/img/icon-zoomin.png" /></div>
                                </div>
                            </div>
                        </div>
                    );
                },
                _renderSetupPanel: function() {
                    var printSpeedOptions,
                        materialOptions;

                    printSpeedOptions = lang.print.params.beginner.print_speed.options.map(function(o) {
                        return (<option>{o.label}</option>);
                    });

                    materialOptions = lang.print.params.beginner.material.options.map(function(o) {
                        return (<option>{o.label}</option>);
                    });

                    // console.log(materialOptions);

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
                                                <input type="checkbox" id="platformSwtich" name="platformSwtich" className="switch" onClick={this._handleCheck} />
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
                                                <input type="checkbox" id="supportSwitch" name="supportSwitch" className="switch" onClick={this._handleCheck} />
                                                <label htmlFor="supportSwitch">&nbsp;</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*<div className="action">
                                <a className="btn"><img src="/img/icon-goprint.png" />{lang.menu.print}</a>
                            </div>*/}
                        </div>
                    );
                },
                render : function() {
                    var lang = this.state.lang,
                        header = this._renderHeader(),
                        operatingPanel = this._renderOperatingPanel(),
                        setupPanel = this._renderSetupPanel();

                    return (
                        <div className="studio-container print-studio">

                            {header}

                            {operatingPanel}

                            {setupPanel}

                            <div id="model-displayer" className="model-displayer"></div>
                        </div>
                    );
                }
            });

        return view;
    };
});