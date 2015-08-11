define([
    'jquery',
    'react',
    'jsx!widgets/Modal',
    'app/actions/scaned-model',
    'helpers/api/3d-scan-control',
    'helpers/api/3d-scan-modeling',
    'jsx!views/scan/Setup-Panel',
    'jsx!views/scan/Manipulation-Panel',
    'jsx!views/Print-Selector',
    'jsx!views/scan/Export',
    'jsx!views/scan/Progress-Bar',
    'helpers/file-system',
    'helpers/shortcuts'
], function(
    $,
    React,
    Modal,
    scanedModel,
    scanControl,
    scanModeling,
    SetupPanel,
    ManipulationPanel,
    PrinterSelector,
    Export,
    ProgressBar,
    fileSystem,
    shortcuts
) {
    'use strict';

    return function(args) {
        args = args || {};

        var View = React.createClass({

                // ui events
                _rescan: function(e) {
                    this.setState(this.getInitialState());
                },

                _saveAs: function(e) {
                    this.setState({
                        openExportWindow: true
                    });
                },

                _refreshCamera: function() {
                    var self = this;

                    self.setProps.call(self, {
                        scan_modeling_image_method: self.props.scan_ctrl_websocket.getImage(
                            function(image_blobs, mime_type) {
                                var blob = new Blob(image_blobs, {type: mime_type}),
                                    url = (window.URL || window.webkitURL),
                                    objectUrl = url.createObjectURL(blob),
                                    img = self.refs.camera_image.getDOMNode();

                                img.onload = function() {
                                    // release the object URL once the image has loaded
                                    url.revokeObjectURL(objectUrl);
                                    blob = null;
                                };

                                // trigger the image to load
                                img.src = objectUrl;
                            }
                        )
                    });
                },

                _startScan: function(e) {
                    var self = this;

                    self.setState({
                        openPrinterSelectorWindow: true
                    });
                },

                _getMesh: function(index) {
                    index = ('undefined' !== index || 0 > index ? index : this.props.meshes.length - 1);
                    return this.props.meshes.slice(index)[0];
                },

                _getScanSpeed: function() {
                    return parseInt($('[name="scan_speed"] option:selected').val(), 10);
                },

                _onRendering: function(views, chunk_length) {
                    var self = this,
                        scan_speed = self._getScanSpeed(),
                        remaining_sec = ((scan_speed - chunk_length) * (20 * 60 / scan_speed)) || 0,
                        remaining_min = Math.floor(remaining_sec / 60) || 0,
                        progressRemainingTime = self.state.progressRemainingTime,
                        progressPercentage,
                        meshes = self.props.meshes,
                        mesh = self._getMesh(self.state.meshIndex);

                    remaining_sec = remaining_sec % (remaining_min * 60);

                    progressPercentage = Math.min(
                        (chunk_length / scan_speed * 100).toString().substr(0, 5),
                        100
                    );

                    args.state.progressPercentage = progressPercentage;

                    // update remaining time every 20 chunks
                    if (0 === chunk_length % 20) {
                        progressRemainingTime = remaining_min + 'm' + (remaining_sec || 0) + 's';
                    }

                    self.setState({
                        progressPercentage: progressPercentage,
                        progressRemainingTime: progressRemainingTime
                    });

                    if ('undefined' === typeof mesh) {
                        meshes.push({
                            model: scanedModel.appendModel(views),
                            name: ''
                        });
                    }
                    else {
                        mesh.model = scanedModel.updateMesh(mesh.model, views);
                    }

                    // TODO: clear it
                    window.meshes = self.props.meshes;
                },

                _handleScan: function(e, refs) {
                    var self = this,

                        onScanFinished = function(point_cloud) {
                            var upload_name = 'scan-' + (new Date()).getTime(),
                                onUploadFinished = function() {
                                    var mesh = self._getMesh(self.state.meshIndex);

                                    if (0 < self.state.scanTimes) {
                                        // self.props.meshes[0].model.visible = false;
                                        self.props.meshes[0].model.material.opacity = 0.1;
                                        self.props.meshes[0].model.material.transparent = true;

                                        self.setState({
                                            enableMerge: true
                                        });
                                    }

                                    mesh.name = upload_name;

                                    // update scan times
                                    self.setState({
                                        scanTimes: self.state.scanTimes + 1,
                                        openProgressBar: false
                                    });
                                };

                            self.props.scan_modeling_websocket.upload(
                                upload_name,
                                point_cloud,
                                {
                                    onFinished: onUploadFinished
                                }
                            );

                        },
                        openProgressBar = function(callback) {
                            callback();

                            self.setState({
                                openProgressBar: true,
                                meshIndex: self.state.meshIndex + 1
                            });
                        },
                        onScan = function() {
                            var opts = {
                                    onRendering: self._onRendering,
                                    onFinished: onScanFinished
                                },
                                scan_speed = self._getScanSpeed();

                            self.props.scan_ctrl_websocket.scan(scan_speed, opts);
                        },
                        stage;

                    self.refs = $.extend(true, {}, self.refs, refs);

                    if (false === self.props.is_canvas_existing) {
                        stage = scanedModel.init();
                        self.setProps(stage);
                    }

                    self.setProps({
                        is_canvas_existing: true
                    });

                    self.setState({
                        is_scan_started: true
                    });

                    openProgressBar(onScan);
                },

                _doClearNoise: function() {
                    var self = this,
                        last_point_cloud = self.props.scan_modeling_websocket.History.getLatest(),
                        delete_noise_name = 'clear-noise-' + (new Date()).getTime(),
                        onStarting = function(data) {
                            self._openBlocker(true);
                        },
                        onDumpFinished = function(data) {
                            var mesh;

                            mesh = self._getMesh(self.state.meshIndex);
                            mesh.name = delete_noise_name;
                            self._openBlocker(false);
                        },
                        onDumpReceiving = function(data, len) {
                            self._onRendering(data, len);
                        };

                    self.props.scan_modeling_websocket.delete_noise(
                        last_point_cloud.name,
                        delete_noise_name,
                        0.3,
                        {
                            onStarting: onStarting,
                            onFinished: onDumpFinished,
                            onReceiving: onDumpReceiving
                        }
                    );
                },

                _doCropOn: function() {
                    var mesh = this._getMesh(this.state.meshIndex);
                    this.setProps({
                        cylinder: scanedModel.cylinder.create(mesh.model)
                    });
                },

                _doCropOff: function() {
                    var self = this,
                        mesh = this._getMesh(this.state.meshIndex),
                        last_point_cloud = self.props.scan_modeling_websocket.History.getLatest(),
                        cut_name = 'cut-' + (new Date()).getTime(),
                        cylider_box = new THREE.Box3().setFromObject(self.props.cylinder),
                        opts = {
                            onStarting: function() {
                                self._openBlocker(true);
                            },
                            onReceiving: self._onRendering,
                            onFinished: function(data) {
                                self._openBlocker(false);
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

                        self.props.scan_modeling_websocket.cut(
                            last_point_cloud.name,
                            cut_name,
                            args,
                            opts
                        );

                        mesh.name = cut_name;
                    }

                    scanedModel.cylinder.remove(self.props.cylinder);
                    self.setProps({
                        cylinder: undefined
                    });
                },

                _doManualMerge: function() {
                    var self = this,
                        meshes = this.props.meshes,
                        output_name = 'merge-' + (new Date()).getTime(),
                        onMergeFinished = function(data) {
                            self.setState({
                                meshIndex: 0,
                                enableMerge: false
                            });

                            meshes[0].model.material.transparent = false;
                            scanedModel.remove(meshes[1].model);
                            meshes.splice(-1);

                            self._openBlocker(false);
                        },
                        onMergeStarting = function() {
                            self._openBlocker(true);
                        },
                        target_position = meshes[1].model.position,
                        target_rotation = meshes[1].model.rotation,
                        position = {
                            x: target_position.x,
                            y: target_position.y,
                            z: target_position.z
                        },
                        rotation = {
                            x: target_rotation.x,
                            y: target_rotation.y,
                            z: target_rotation.z
                        },
                        box = new THREE.Box3().setFromObject(meshes[1].model);

                    position.z += box.size().z /2;

                    self.props.scan_modeling_websocket.merge(
                        meshes[0].name,
                        meshes[1].name,
                        position,
                        rotation,
                        output_name,
                        {
                            onStarting: onMergeStarting,
                            onReceiving: self._onRendering,
                            onFinished: onMergeFinished
                        }
                    );
                },

                _doAutoMerge: function() {
                    var self = this,
                        meshes = this.props.meshes,
                        mesh = this._getMesh(this.state.meshIndex),
                        output_name = 'automerge-' + (new Date()).getTime(),
                        onMergeFinished = function(data) {
                            var transform_methods = scanedModel.attachControl(self._getMesh(self.state.meshIndex).model);
                            transform_methods.rotate();
                            // update scan times
                            self.setState({
                                autoMerge: false
                            });

                            shortcuts.on(
                                ['r'],
                                function(e) {
                                    transform_methods.rotate();
                                }
                            );

                            shortcuts.on(
                                ['t'],
                                function(e) {
                                    transform_methods.translate();
                                }
                            );

                            mesh.name = output_name;
                            self._openBlocker(false);
                        },
                        onMergeStarting = function() {
                            self._openBlocker(true);
                        };

                    self.props.scan_modeling_websocket.autoMerge(
                        meshes[0].name,
                        meshes[1].name,
                        output_name,
                        {
                            onStarting: onMergeStarting,
                            onReceiving: self._onRendering,
                            onFinished: onMergeFinished
                        }
                    );
                },

                _openBlocker: function(is_open) {
                    this.setState({
                        openBlocker: is_open
                    })
                },

                // render sections
                _renderSettingPanel: function() {
                    var start_scan_text,
                        lang = args.state.lang;

                    // TODO: setting up remaining time
                    lang.scan.remaining_time = '26min';

                    lang.scan.start_scan_text = (
                        0 < this.state.scanTimes
                        ? lang.scan.start_multiscan
                        : lang.scan.start_scan
                    );

                    return (
                        <SetupPanel
                            lang={lang}
                            onScanClick={this._handleScan}
                            enabledScanButton={1 < this.state.scanTimes}
                        >
                        </SetupPanel>
                    );
                },

                _renderManipulationPanel: function() {
                    var state = this.state,
                        lang = args.state.lang,
                        display = 1 > state.scanTimes;

                    return (
                        <ManipulationPanel
                            lang = {lang}
                            display={display}
                            onCropOn={this._doCropOn}
                            onCropOff={this._doCropOff}
                            onClearNoise={this._doClearNoise}
                            onAutoMerge={this._doAutoMerge}
                            onManualMerge={this._doManualMerge}
                            enableMerge={this.state.enableMerge}
                            enableAutoMerge={state.autoMerge}
                        />
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
                                <img ref="camera_image" src={this.state.imageSrc} className={camera_image_class}/>
                            </div>
                        </section>
                    );
                },

                _renderExportWindow: function() {
                    var self = this,
                        lang = self.state.lang,
                        onExport = function(e) {
                            var last_point_cloud = self.props.scan_modeling_websocket.History.getLatest(),
                                file_format = $('[name="file-format"]:checked').val(),
                                file_name = (new Date()).getTime() + '.' + file_format;

                            self.props.scan_modeling_websocket.export(
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

                                        onClose();
                                    }
                                }
                            );
                        },
                        content = (
                            <Export lang={lang} onExport={onExport}/>
                        ),
                        onClose = function(e) {
                            self.setState({
                                openExportWindow: false
                            });
                        };

                    return (
                        <Modal content={content} onClose={onClose}/>
                    );
                },

                _renderProgressBar: function() {
                    var self = this,
                        lang = this.state.lang,
                        content = (
                            <ProgressBar
                                lang={lang}
                                progressPercentage={this.state.progressPercentage}
                                progressRemainingTime={this.state.progressRemainingTime}/>
                        ),
                        onClose = function(e) {
                            self.setState({
                                openProgressBar: false
                            });
                        };

                    return (
                        <Modal disabledEscapeOnBackground="true" content={content} onClose={onClose}/>
                    );
                },

                _renderPrinterSelectorWindow: function() {
                    var self = this,
                        lang = this.state.lang,
                        onGettingPrinter = function(auth_printer) {
                            self.setState({
                                gettingStarted: true,
                                selectedPrinter: auth_printer,
                                openPrinterSelectorWindow: false
                            });
                            self._openBlocker(true);
                        },
                        content = (
                            <PrinterSelector lang={lang} onGettingPrinter={onGettingPrinter}/>
                        ),
                        onClose = function(e) {
                            self.setState({
                                openPrinterSelectorWindow: false
                            });
                        };

                    return (
                        <Modal content={content} onClose={onClose}/>
                    );
                },

                _renderHeader: function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        lang = args.state.lang,
                        header_class;

                    header_class = cx({
                        'top-menu-bar' : true,
                        'btn-h-group'  : true,
                        'invisible'    : 1 > state.scanTimes
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

                getInitialState: function() {
                    return {
                        lang: args.state.lang,
                        imageSrc: '',
                        gettingStarted: false,
                        meshIndex: -1,
                        scanTimes: 0,
                        selectedPrinter: undefined,
                        openExportWindow: false,
                        openPrinterSelectorWindow: false,
                        openProgressBar: false,
                        openBlocker: false,
                        progressPercentage: 0,
                        progressRemainingTime: '20m0s',
                        printerIsReady: false,
                        autoMerge: true,
                        enableMerge: false
                    };
                },

                componentWillUnmount: function() {
                    if ('undefined' !== typeof this.props.scan_ctrl_websocket &&
                        'undefined' !== typeof this.props.scan_modeling_websocket
                    ) {
                        this.props.scan_ctrl_websocket.connection.close(false);
                        this.props.scan_modeling_websocket.connection.close(false);
                    }
                },

                render : function() {
                    var state = this.state,
                        exportWindow = (
                            true === state.openExportWindow ?
                            this._renderExportWindow() :
                            ''
                        ),
                        printerSelectorWindow = (
                            true === state.openPrinterSelectorWindow ?
                            this._renderPrinterSelectorWindow() :
                            ''
                        ),
                        progressBar = (
                            true === state.openProgressBar ?
                            this._renderProgressBar() :
                            ''
                        ),
                        printerBlocker = (
                            true === state.openBlocker ?
                            <Modal content={<div className="spinner-flip spinner-reverse"/>}/> :
                            ''
                        ),
                        cx = React.addons.classSet,
                        lang = state.lang,
                        activeSection,
                        header;

                    header = this._renderHeader();

                    activeSection = (
                        false === state.gettingStarted ?
                        this._renderBeginingSection() :
                        this._renderStageSection()
                    );

                    return (
                        <div className="studio-container scan-studio">
                            {printerBlocker}
                            {header}
                            {exportWindow}
                            {printerSelectorWindow}
                            {progressBar}

                            <div className="stage">

                                {activeSection}

                            </div>
                        </div>
                    );
                },

                componentDidMount: function() {
                    var self = this,
                        opt = {
                            onError: function(data) {
                                console.log('error', data);
                            },
                            onReady: function() {
                                self.setState({
                                    printerIsReady: true
                                });
                                self._openBlocker(false);
                            }
                        },
                        rotateScene = function(dir) {
                            if ('undefined' === typeof self.props.camera) {
                                return;
                            }

                            var x = self.props.camera.position.x,
                                y = self.props.camera.position.y,
                                z = self.props.camera.position.z,
                                speed = 0.5;

                            if ('left' === dir) {
                                self.props.camera.position.x = x * Math.cos(speed) + y * Math.sin(speed);
                                self.props.camera.position.y = y * Math.cos(speed) - x * Math.sin(speed);
                            }
                            else {
                                self.props.camera.position.x = x * Math.cos(speed) - y * Math.sin(speed);
                                self.props.camera.position.y = y * Math.cos(speed) + x * Math.sin(speed);
                            }

                            self.props.camera.lookAt(self.props.scene.position);

                            scanedModel.update();
                        },
                        zoom = function(dir) {
                            if ('undefined' === typeof self.props.camera) {
                                return;
                            }

                            var x = self.props.camera.position.x,
                                y = self.props.camera.position.y,
                                z = self.props.camera.position.z,
                                speed = 0.5;

                            if ('in' === dir) {
                                x = Math.max(x - 0.5, 10);
                                y = Math.max(y - 0.5, 10);
                                z = Math.max(z - 10, 0);
                            }
                            else {
                                x = Math.min(x + 0.5, 200);
                                y = Math.min(y + 0.5, 200);
                                z = Math.min(z + 10, 200);
                            }

                            self.props.camera.position.z = z * Math.cos(speed) + y * Math.sin(speed);
                            self.props.camera.position.set(x, y, z);

                            self.props.camera.lookAt(self.props.scene.position);

                            scanedModel.update();
                        },
                        state, timer;

                    timer = setInterval(function() {
                        state = self.state;

                        if (true === state.gettingStarted && null !== state.selectedPrinter) {
                            self.setProps({
                                scan_ctrl_websocket: scanControl(state.selectedPrinter.serial, opt),
                                scan_modeling_websocket: scanModeling(),
                                meshes: [],
                                cylinder: undefined,
                                is_canvas_existing: false
                            });
                            self._refreshCamera();
                            clearInterval(timer);
                        }
                    }, 100);

                    shortcuts.on(
                        ['left'],
                        function(e) {
                            rotateScene('left');
                        }
                    );

                    shortcuts.on(
                        ['right'],
                        function(e) {
                            rotateScene('right');
                        }
                    );

                    shortcuts.on(
                        ['up'],
                        function(e) {
                            zoom('in');
                        }
                    );

                    shortcuts.on(
                        ['down'],
                        function(e) {
                            zoom('out');
                        }
                    );
                }

            });

        return View;
    };
});