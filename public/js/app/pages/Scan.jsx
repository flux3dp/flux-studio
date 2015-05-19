define([
    'jquery',
    'react',
    'app/actions/scan',
    'jsx!widgets/Select',
    'jsx!widgets/List',
], function($, React, scanEvents, SelectView, ListView) {
    'use strict';

    return function(args) {
        args = args || {};

        var view = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div className="studio-container scan-studio">
                            <header className="scan-herader invisible">
                                <button className="btn fa fa-undo" id="btn-rescan">{lang.scan.rescan}</button>
                                <button className="btn fa fa-paper-plane" id="btn-export">{lang.scan.export}</button>
                                <button className="btn fa fa-floppy-o">{lang.scan.share}</button>
                                <button className="btn fa fa-eye">{lang.scan.print_with_flux}</button>
                            </header>
                            <div className="section-container">
                                <section className="starting-section">
                                    <img className="launch-img absolute-center" src="http://placehold.it/280x193"/>
                                </section>
                                <section className="operating-section hide">
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
                                                <button id="btn-scan" className="btn span12 fa fa-bullseye">
                                                    {lang.scan.start_scan}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="model-displayer" className="model-displayer"></div>
                                </section>
                            </div>
                        </div>
                    )
                },
                getInitialState: function() {
                    return args.state;
                },
                componentDidMount: function() {
                    scanEvents(args);
                }

            });

        return view;
    };
});