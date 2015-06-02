define([
    'jquery',
    'react',
    'jsx!widgets/Popup',
    'jsx!widgets/Select',
    'jsx!widgets/List',
    'helpers/websocket',
    'app/actions/scaned-model',
    'helpers/file-system',
    'threejs'
], function($, React, popup, SelectView, ListView, WebSocket, scanedModel, fileSystem) {
    'use strict';

    return function(args) {
        args = args || {};

        var View = React.createClass({
                // counter
                scan_times: ('start' === args.step ? 1 : 0),

                // web socket
                ws: null,

                getInitialState: function() {
                    this.ws = new WebSocket({
                        // TODO: To get available device
                        method: '3d-scan-control/5ZMPBF415VH67ARLGGFWNKCSP',
                        onMessage: function(result) {
                            var data = result.data;
                        }
                    });
                    return args.state;
                },

                componentDidMount: function() {
                    scanedModel.init();
                },

                // ui events
                _rescan: function(e) {
                    this.scan_times = 0;

                    this.setState({
                        scan_times : this.scan_times
                    });

                    location.hash = 'studio/scan/';
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
                    location.hash = 'studio/scan/start';
                },

                _handleScan: function(e) {
                    var self = this,
                        ws = self.ws,
                        model_blobs = [],
                        image_blobs = [],
                        scan_speed = parseInt(this.refs.scan_speed.getDOMNode().value, 10),
                        popup_window,
                        gettingCameraImage = function(result) {
                            var data = result.data,
                                file;

                            if ('object' === typeof data) {
                                image_blobs.push(result.data);
                            }
                            else if ('finished' === data) {
                                // TODO: get image from camera
                                file = new File(
                                    image_blobs,
                                    'scan.png'
                                );
                                fileSystem.writeFile(file);
                                ws.send('start').onMessage(gettingScanedModel);
                            }
                        },
                        gettingScanedModel = function(result) {
                            var data = result.data;

                            if ('object' === typeof data) {
                                model_blobs.push(data);

                                // update progress percentage
                                args.state.progressPercentage = (model_blobs.length / scan_speed * 100).toString().substr(0, 5);
                            }
                            else if ('finished' === data) {
                                var fileReader = new FileReader();

                                fileReader.onload  = function(progressEvent) {
                                    var typedArray = new Float32Array(this.result);

                                    renderringModel(typedArray);
                                };

                                var blob = new Blob(model_blobs, {type: 'text/plain'});
                                fileReader.readAsArrayBuffer(blob);
                            }
                        },
                        renderringModel = function(views) {
                            popup_window.close();

                            self.scan_times = self.scan_times + 1;

                            self.setState({
                                scan_times : self.scan_times
                            });

                            // TODO: store created model but don't use global variable
                            window.meshs = window.meshs || [];
                            window.meshs.push(scanedModel.appendModel(views));

                            // disconnect
                            ws.send('quit');
                        };

                    require(['jsx!views/scan/Progress-Bar'], function(view) {

                        args.disabledEscapeOnBackground = true;
                        args.state.progressPercentage = 0;

                        popup_window = popup(view, args);
                        popup_window.open();

                        if ('connected' === ws.fetchLastResponse()) {
                            ws.send('image').onMessage(gettingCameraImage);
                        }
                        else {
                            // TODO: error occurs
                        }

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

                    state.scan_times = state.scan_times || this.scan_times || 0;

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
                                                            <SelectView ref="scan_speed" className="span12" options={lang.scan.scan_params.scan_speed.options}/>
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