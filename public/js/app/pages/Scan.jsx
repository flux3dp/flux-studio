define([
    'jquery',
    'react',
    'jsx!widgets/Popup',
    'jsx!widgets/Select',
    'jsx!widgets/List',
], function($, React, popup, SelectView, ListView) {
    'use strict';

    return function(args) {
        args = args || {};

        var View = React.createClass({
                // counter
                scan_times: 0,

                getInitialState: function() {
                    return args.state;
                },

                componentDidMount: function() {
                },

                // ui events
                _rescan: function(e) {
                    this.scan_times = 0;

                    this.setState({
                        scan_times : this.scan_times
                    });
                },

                _saveAs: function(e) {
                    require(['jsx!views/scan/Export'], function(view) {
                        var popup_window;

                        args.disabledEscapeOnBackground = true;

                        popup_window = popup(view, args);
                        popup_window.open();
                    });
                },

                _startScan: function(e) {
                    this.scan_times = 1;

                    this.setState({
                        scan_times : this.scan_times
                    });
                },

                _handleScan: function(e) {
                    var self = this;

                    require(['jsx!views/scan/Progress-Bar'], function(view) {
                        var popup_window;

                        args.disabledEscapeOnBackground = true;

                        popup_window = popup(view, args);
                        popup_window.open();

                        // TODO: scan complete
                        setTimeout(function() {
                            popup_window.close();
                            self.scan_times = self.scan_times + 1;

                            self.setState({
                                scan_times : self.scan_times
                            });
                        }, 1000);
                    });
                },

                render : function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        lang = state.lang,
                        start_scan_text,
                        header_class,
                        starting_section,
                        operating_section;

                    state.scan_times = state.scan_times || 0;

                    start_scan_text = (
                        1 < state.scan_times
                        ? lang.scan.start_multiscan
                        : lang.scan.start_scan
                    );

                    header_class = cx({
                        'scan-herader' : true,
                        'invisible'    : 2 > state.scan_times
                    });

                    starting_section = cx({
                        'starting-section' : true,
                        'hide' : 0 < state.scan_times
                    });

                    operating_section = cx({
                        'operating-section' : true,
                        'hide' : 0 === state.scan_times
                    });

                    return (
                        <div className="studio-container scan-studio">
                            <header ref="header" className={header_class}>
                                <button className="btn fa fa-undo" onClick={this._rescan}>{lang.scan.rescan}</button>
                                <button className="btn fa fa-paper-plane" onClick={this._saveAs}>{lang.scan.export}</button>
                                <button className="btn fa fa-floppy-o">{lang.scan.share}</button>
                                <button className="btn fa fa-eye">{lang.scan.print_with_flux}</button>
                            </header>
                            <div className="section-container">
                                <section className={starting_section}>
                                    <img className="launch-img absolute-center" src="http://placehold.it/280x193" onClick={this._startScan}/>
                                </section>
                                <section className={operating_section}>
                                    <div id="operating-panel" className="operating-panel">
                                        <div className="panel print-params">
                                            <div>
                                                <h2>
                                                    <span className="fa fa-clock-o"></span>
                                                    26min
                                                </h2>
                                                <div className="row-fluid clearfix">
                                                    <div className="col span3">
                                                        <span className="param-icon fa fa-print"></span>
                                                    </div>
                                                    <div className="param col span9">
                                                        <h4>
                                                            {lang.scan.scan_params.scan_speed.text}
                                                        </h4>
                                                        <p>
                                                            <SelectView className="span12" options={lang.scan.scan_params.scan_speed.options}/>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="row-fluid clearfix">
                                                    <div className="col span3">
                                                        <span className="param-icon fa fa-lightbulb-o"></span>
                                                    </div>
                                                    <div className="param col span9">
                                                        <h4>
                                                            {lang.scan.scan_params.object.text}
                                                            <div className="tooltip">
                                                                <div className="tooltip-content">
                                                                    {lang.scan.scan_params.object.tooltip.text}
                                                                    <ListView className="illumination" items={lang.scan.scan_params.object.tooltip.items}/>
                                                                </div>
                                                            </div>
                                                        </h4>
                                                        <p>
                                                            <SelectView className="span12" options={lang.scan.scan_params.object.options}/>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <button id="btn-scan" onClick={this._handleScan} className="btn span12 fa fa-bullseye">
                                                    {start_scan_text}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="model-displayer" className="model-displayer"></div>
                                </section>
                            </div>
                        </div>
                    )
                }

            });

        return View;
    };
});