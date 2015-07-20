define([
    'jquery',
    'react',
    'jsx!widgets/Popup',
    'app/actions/scaned-model',
    'helpers/api/3d-scan-control',
    'helpers/api/3d-scan-modeling',
    'jsx!views/scan/Setup-Panel',
    'jsx!views/scan/Manipulation-Panel',
    'helpers/file-system'
], function($, React, popup, scanedModel, scanControl, scanModeling, SetupPanel, ManipulationPanel, fileSystem) {
    'use strict';

    return function(args) {
        args = args || {};

        var View = React.createClass({
                mesh: null,
                cylinder: null,
                point_cloud_history: [],

                // counter
                scan_times: ('start' === args.step ? 1 : 0),

                scan_ctrl_websocket : null,

                scan_modeling_websocket : null,

                scan_modeling_image_method : null,

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
                        this.point_cloud_history = null;
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
                    var self = this;

                    require(['jsx!views/scan/Export'], function(view) {
                        var popup_window;

                        args.onExport = function(e) {
                            var last_point_cloud = self.point_cloud_history.slice(-1)[0],
                                file_format = $('[name="file-format"]:checked').val(),
                                file_name = (new Date()).getTime() + '.' + file_format;

                            self.scan_modeling_websocket.export(
                                last_point_cloud.name,
                                file_format,
                                {
                                    onFinished: function(blob) {
                                        var file = new File(
                                            [blob],
                                            file_name
                                        );

                                        fileSystem.writeFile(
                                            file,
                                            {
                                                onComplete: function(e, fileEntry) {
                                                    window.open(fileEntry.toURL());
                                                }
                                            }
                                        );

                                        popup_window.close();
                                    }
                                }
                            );
                        };
                        args.disabledEscapeOnBackground = false;

                        popup_window = popup(view, args);
                        popup_window.open();
                    });
                },

                _refreshCamera: function() {
                    var self = this;

                    self.scan_modeling_image_method = this.scan_ctrl_websocket.getImage(
                        function(e, fileEntry) {
                            self.setState({
                                image_src: fileEntry.toURL() + '#' + (new Date()).getTime()
                            });
                        }
                    );
                },

                _startScan: function(e) {
                    location.hash = 'studio/scan/start';
                },

                _onRendering: function(views, chunk_length) {
                    var self = this,
                        scan_speed = parseInt(self.refs.scan_speed.getDOMNode().value, 10),
                        remaining_sec = (scan_speed - chunk_length) * (20 * 60 / scan_speed),
                        remaining_min = Math.floor(remaining_sec / 60);

                    remaining_sec = remaining_sec % (remaining_min * 60);

                    args.state.progressPercentage = (chunk_length / scan_speed * 100).toString().substr(0, 5);

                    // update remaining time every 20 chunks
                    if (0 === chunk_length % 20) {
                        args.state.progressRemainingTime = remaining_min + 'm' + remaining_sec + 's';
                    }

                    if (null === self.mesh) {
                        self.mesh = scanedModel.appendModel(views);
                    }
                    else {
                        self.mesh = scanedModel.updateMesh(self.mesh, views);
                    }

                    window.mesh = self.mesh;
                },

                _handleScan: function(e, refs) {
                    var self = this,
                        popup_window,

                        onScanFinished = function(point_cloud) {
                            var upload_name = 'scan-' + (new Date()).getTime(),
                                onUploadFinished = function() {
                                    // save history
                                    self.point_cloud_history.push({
                                        name: upload_name,
                                        data: point_cloud.total
                                    });

                                    popup_window.close();
                                };
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

                        },
                        openProgressBar = function(callback) {
                            require(['jsx!views/scan/Progress-Bar'], function(view) {
                                self.scan_modeling_image_method.stop();

                                args.disabledEscapeOnBackground = true;
                                args.state.progressPercentage = 0;
                                args.state.progressRemainingTime = '20m0s';

                                popup_window = popup(view, args);
                                popup_window.open();

                                callback();

                            });
                        },
                        onScan = function() {
                            var opts = {
                                onRendering: self._onRendering,
                                onFinished: onScanFinished
                            };

                            self.scan_ctrl_websocket.scan(opts);
                        };

                    self.refs = $.extend(true, {}, self.refs, refs);

                    scanedModel.init();

                    this.setState({
                        is_scan_started: true
                    });

                    openProgressBar(onScan);
                },

                _renderHeader: function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        lang = state.lang,
                        header_class;

                    header_class = cx({
                        'top-menu-bar' : true,
                        'btn-h-group'  : true,
                        'invisible'    : 2 > state.scan_times
                    });

                    return (
                        <header ref="header" className={header_class}>
                            <button className="btn btn-default fa fa-undo" onClick={this._rescan}>{lang.scan.rescan}</button>
                            <button className="btn btn-default fa fa-paper-plane" onClick={this._saveAs}>{lang.scan.export}</button>
                            <button className="btn btn-default fa fa-floppy-o">{lang.scan.share}</button>
                            <button className="btn btn-default fa fa-eye">{lang.scan.print_with_flux}</button>
                        </header>
                    );
                },

                _renderBeginingSection: function() {
                    return (
                        <section className="starting-section">
                            <img className="launch-img absolute-center" src="http://placehold.it/280x193" onClick={this._startScan}/>
                        </section>
                    );
                },

                _doClearNoise: function() {
                    var self = this,
                        last_point_cloud = self.point_cloud_history.slice(-1)[0],
                        delete_noise_name = 'clear-noise-' + (new Date()).getTime(),
                        onDumpFinished = function(data) {
                            console.log('dump finished');
                            self._onRendering(data);

                            self.point_cloud_history.push({
                                name: delete_noise_name,
                                data: data
                            });
                        },
                        onDumpReceiving = function(data, len) {
                            console.log('dump receiving');
                            self._onRendering(data, len);
                        };

                    self.scan_modeling_websocket.delete_noise(
                        last_point_cloud.name,
                        delete_noise_name,
                        0.3,
                        {
                            onFinished: onDumpFinished,
                            onReceiving: onDumpReceiving
                        }
                    );
                },

                _doCropOn: function() {
                    console.log('crop on');
                    this.cylinder = scanedModel.cylinder.create(this.mesh);
                },

                _doCropOff: function() {
                    var self = this,
                        last_point_cloud = self.point_cloud_history.slice(-1)[0],
                        cut_name = 'cut-' + (new Date()).getTime(),
                        cylider_box = new THREE.Box3().setFromObject(self.cylinder),
                        opts = {
                            onReceiving: self._onRendering,
                            onFinished: function(data) {
                                self.point_cloud_history.push({
                                    name: cut_name,
                                    data: data.total
                                });
                            }
                        },
                        args = [
                            // min z
                            { mode: 'z', direction: 'True', value: cylider_box.min.z },
                            // max z
                            { mode: 'z', direction: 'False', value: cylider_box.max.z },
                            // radius
                            { mode: 'r', direction: 'False', value: Math.min(cylider_box.max.y, cylider_box.max.x) }
                        ];

                    if (window.confirm('Do crop?')) {

                        self.scan_modeling_websocket.cut(
                            last_point_cloud.name,
                            cut_name,
                            args,
                            opts
                        );

                    }

                    scanedModel.cylinder.remove(self.cylinder);
                    self.cylinder = null;
                },

                _renderSettingPanel: function() {
                    var state = this.state,
                        start_scan_text,
                        lang = state.lang;

                    // TODO: setting up remaining time
                    lang.scan.remaining_time = '26min';

                    lang.scan.start_scan_text = (
                        1 < state.scan_times
                        ? lang.scan.start_multiscan
                        : lang.scan.start_scan
                    );

                    return (
                        <SetupPanel
                            lang = {lang}
                            onScanClick = {this._handleScan}>
                        </SetupPanel>
                    );
                },

                _renderManipulationPanel: function() {
                    var state = this.state,
                        lang = state.lang,
                        cx = React.addons.classSet,
                        display = 2 > state.scan_times;

                    return (
                        <ManipulationPanel
                            lang = {lang}
                            display={display}
                            onCropOn = {this._doCropOn}
                            onCropOff = {this._doCropOff}
                            onClearNoise = {this._doClearNoise}>
                        </ManipulationPanel>
                    );
                },

                _renderStageSection: function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        camera_image_class,
                        settingPanel = this._renderSettingPanel(),
                        manipulationPanel = this._renderManipulationPanel(),
                        lang = state.lang;

                    camera_image_class = cx({
                        'camera-image' : true,
                        'hide' : true === state.is_scan_started
                    });

                    return (
                        <section className="operating-section">

                            {settingPanel}
                            {manipulationPanel}

                            <div id="model-displayer" className="model-displayer">
                                <img src={this.state.image_src} className={camera_image_class}/>
                            </div>
                        </section>
                    );
                },

                render : function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        lang = state.lang,
                        activeSection,
                        header;

                    state.scan_times = this.scan_times || state.scan_times || 0;
                    header = this._renderHeader();

                    activeSection = (
                        0 === state.scan_times ?
                        this._renderBeginingSection() :
                        this._renderStageSection()
                    );

                    return (
                        <div className="studio-container scan-studio">

                            {header}

                            <div className="stage">

                                {activeSection}

                            </div>
                        </div>
                    );
                }

            });

        return View;
    };
});