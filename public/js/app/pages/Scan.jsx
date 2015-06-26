define([
    'jquery',
    'react',
    'jsx!widgets/Popup',
    'jsx!widgets/Select',
    'jsx!widgets/List',
    'helpers/websocket',
    'app/actions/scaned-model',
    'helpers/api/3d-scan-control',
    'helpers/api/3d-scan-modeling',
    'threejs'
], function($, React, popup, SelectView, ListView, WebSocket, scanedModel, scanControl, scanModeling) {
    'use strict';

    return function(args) {
        args = args || {};

        var View = React.createClass({
                // counter
                scan_times: ('start' === args.step ? 1 : 0),

                scan_ctrl_websocket : null,

                scan_modeling_websocket : null,

                getInitialState: function() {
                    args.state.image_src = '';

                    return args.state;
                },

                componentDidMount: function() {
                    if ('start' === args.step) {
                        this.scan_ctrl_websocket = scanControl('5ZMPBF415VH67ARLGGFWNKCSP');
                        this.scan_modeling_websocket = scanModeling();
                        this._refreshCamera();
                    }
                },

                componentWillUnmount: function() {
                    if (false === location.hash.startsWith('#studio/scan') &&
                        null !== this.scan_ctrl_websocket &&
                        null !== this.scan_modeling_websocket
                    ) {
                        this.scan_ctrl_websocket.connection.close(false);
                        this.scan_modeling_websocket.connection.close(false);
                    }
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

                _refreshCamera: function() {
                    var self = this;

                    this.scan_ctrl_websocket.getImage(
                        function(e, fileEntry) {
                            self.setState({
                                image_src: fileEntry.toURL()
                            });
                        }
                    );
                },

                _startScan: function(e) {
                    location.hash = 'studio/scan/start';
                },

                _handleScan: function(e) {
                    var self = this,
                        scan_speed = parseInt(this.refs.scan_speed.getDOMNode().value, 10),
                        mesh = null,
                        popup_window,
                        onRendering = function(views, chunk_length) {
                            var remaining_sec = (scan_speed - chunk_length) * (20 * 60 / scan_speed),
                                remaining_min = Math.floor(remaining_sec / 60);

                            remaining_sec = remaining_sec % (remaining_min * 60);
                            // console.log(remaining_sec, remaining_sec > 59);

                            args.state.progressPercentage = (chunk_length / scan_speed * 100).toString().substr(0, 5);

                            // update remaining time every 20 chunks
                            if (0 === chunk_length % 20) {
                                args.state.progressRemainingTime = remaining_min + 'm' + remaining_sec + 's';
                            }

                            if (null === mesh) {

                                mesh = scanedModel.appendModel(views);
                            }
                            else {
                                mesh = scanedModel.updateMesh(mesh, views);
                            }

                            window.mesh = mesh;
                        },
                        onFinished = function(point_cloud) {
                            var upload_name = 'scan-' + (new Date()).getTime(),
                                onUploadFinished = function() {

                                    self.scan_modeling_websocket.dump(
                                        upload_name,
                                        {
                                            onFinished: onDumpFinished,
                                            onReceiving: onDumpReceiving,
                                        }
                                    );
                                },
                                onDumpFinished = function() {
                                    console.log('dump finished');
                                },
                                onDumpReceiving = function(data, len) {
                                    console.log('dump receiving');
                                };

                            popup_window.close();

                            // update scan times
                            self.scan_times = self.scan_times + 1;

                            self.setState({
                                scan_times : self.scan_times
                            });

                            // TODO: show operation panel
                            self.scan_modeling_websocket.upload(
                                upload_name,
                                point_cloud,
                                {
                                    onFinished: onUploadFinished
                                }
                            );
                            // delete_noise(in_name, out_name, c)
                        };

                    scanedModel.init();

                    this.setState({
                        is_scan_started: true
                    });

                    require(['jsx!views/scan/Progress-Bar'], function(view) {
                        var opts = {
                            onRendering: onRendering,
                            onFinished: onFinished
                        };

                        args.disabledEscapeOnBackground = true;
                        args.state.progressPercentage = 0;
                        args.state.progressRemainingTime = '20m0s';

                        popup_window = popup(view, args);
                        popup_window.open();

                        self.scan_ctrl_websocket.scan(opts);

                    });
                },

                render : function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        lang = state.lang,
                        start_scan_text,
                        header_class,
                        camera_image_class,
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

                    camera_image_class = cx({
                        'camera-image' : true,
                        'hide' : true === state.is_scan_started
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
                                    <div id="model-displayer" className="model-displayer">
                                        <img src={this.state.image_src} className={camera_image_class}/>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )
                }

            });

        return View;
    };
});