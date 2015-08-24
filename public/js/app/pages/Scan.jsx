define([
    'jquery',
    'react',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'app/actions/scaned-model',
    'helpers/api/3d-scan-control',
    'helpers/api/3d-scan-modeling',
    'jsx!views/scan/Setup-Panel',
    'jsx!views/scan/Manipulation-Panel',
    'jsx!views/Print-Selector',
    'jsx!views/scan/Export',
    'jsx!views/scan/Progress-Bar',
    'helpers/file-system',
    'helpers/shortcuts',
    'plugins/file-saver/file-saver.min'
], function(
    $,
    React,
    Modal,
    Alert,
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
                _progressRemainingTime: 1200,    // 20 minutes

                // ui events
                _rescan: function(e) {
                    this.setState(this.getInitialState());
                },

                _refreshCamera: function() {
                    var self = this;

                    self.setState({
                        showCamera: true
                    });

                    self.setProps.call(self, {
                        scanControlImageMethods: self.props.scanCtrlWebSocket.getImage(
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
                        progressRemainingTime = self._progressRemainingTime / scan_speed * (scan_speed - chunk_length),
                        progressElapsedTime = parseInt(((new Date()).getTime() - self.props.scanStartTime) / 1000, 10),
                        progressPercentage,
                        meshes = self.props.meshes,
                        mesh = self._getMesh(self.state.meshIndex);

                    progressPercentage = Math.min(
                        (chunk_length / scan_speed * 100).toString().substr(0, 5),
                        100
                    );

                    self.setState({
                        progressPercentage: progressPercentage,
                        progressRemainingTime: progressRemainingTime,
                        progressElapsedTime: progressElapsedTime
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
                },

                _onConvert: function(e) {
                    var self = this,
                        last_point_cloud = self.props.scanModelingWebSocket.History.getLatest(),
                        file_format = 'stl',
                        onClose = function(e) {
                            self.props.meshes.forEach(function(mesh, e) {
                                scanedModel.remove(mesh.model);
                            });
                            self.setProps({
                                meshes: [],
                                saveFileType: 'stl'
                            });
                            self.setState({
                                openBlocker: false,
                                meshIndex: -1,
                                disabledConvertButton: true,
                                disabledScanButton: true
                            });
                        };

                    self.setState({
                        openBlocker: true
                    });

                    self.props.scanModelingWebSocket.export(
                        last_point_cloud.name,
                        file_format,
                        {
                            onFinished: function(blob) {
                                scanedModel.loadStl(blob, onClose);
                            }
                        }
                    );
                },

                _onSave: function(e) {
                    var self = this,
                        doExport = function() {
                            var last_point_cloud = self.props.scanModelingWebSocket.History.getLatest(),
                                file_format = self.props.saveFileType,
                                file_name = (new Date()).getTime() + '.' + file_format;

                            self.setState({
                                openBlocker: true
                            });

                            self.props.scanModelingWebSocket.export(
                                last_point_cloud.name,
                                file_format,
                                {
                                    onFinished: function(blob) {
                                        saveAs(blob, file_name);
                                        onClose();
                                    }
                                }
                            );
                        },
                        onClose = function(e) {
                            self.setState({
                                openBlocker: false
                            });
                        };

                    doExport();
                },

                _handleScan: function(e, refs) {
                    var self = this,
                        mesh = self._getMesh(self.state.meshIndex),
                        onScanFinished = function(point_cloud) {
                            var upload_name = 'scan-' + (new Date()).getTime(),
                                onUploadFinished = function() {
                                    var control;
                                    mesh = self._getMesh(self.state.meshIndex);

                                    if (0 < self.state.scanTimes) {
                                        control = scanedModel.attachControl(mesh.model);
                                        control.rotate();

                                        shortcuts.on(['r'], function(e) {
                                            control.rotate();
                                        });

                                        shortcuts.on(['t'], function(e) {
                                            control.translate();
                                        });

                                        self.setState({
                                            enableMerge: true
                                        });
                                    }

                                    mesh.name = upload_name;

                                    // update scan times
                                    self.setState({
                                        scanTimes: self.state.scanTimes + 1,
                                        openProgressBar: false,
                                        isScanStarted: false,
                                        showScanButton: true
                                    });
                                };

                            self.props.scanModelingWebSocket.upload(
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

                            self.setProps({
                                scanMethods: self.props.scanCtrlWebSocket.scan(scan_speed, opts)
                            });
                        },
                        stage;

                    stage = scanedModel.init();
                    self.setProps(stage);

                    self.setProps({
                        scanStartTime: (new Date()).getTime()
                    });

                    self.setState({
                        isScanStarted: true,
                        showScanButton: false,
                        showCamera: false
                    });

                    if ('undefined' !== typeof mesh) {
                        mesh.model.material.opacity = 0.5;
                        mesh.model.material.transparent = true;
                    }

                    openProgressBar(onScan);
                },

                _onScanAgain: function(e) {
                    location.hash = '#studio/scan/' + (new Date()).getTime();
                },

                _doClearNoise: function() {
                    var self = this,
                        last_point_cloud = self.props.scanModelingWebSocket.History.getLatest(),
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

                    self.props.scanModelingWebSocket.delete_noise(
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
                        last_point_cloud = self.props.scanModelingWebSocket.History.getLatest(),
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

                        self.props.scanModelingWebSocket.cut(
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
                        target_rotation = meshes[1].model.rotation,
                        box = new THREE.Box3().setFromObject(meshes[1].model),
                        position = {
                            x: box.center().x,
                            y: box.center().y,
                            z: box.center().z
                        },
                        rotation = {
                            x: target_rotation.x,
                            y: target_rotation.y,
                            z: target_rotation.z
                        };

                    self.props.scanModelingWebSocket.merge(
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

                    self.props.scanModelingWebSocket.autoMerge(
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

                _onScanCancel: function(e) {
                    var self = this,
                        mesh = self._getMesh(self.state.meshIndex);

                    self.props.scanMethods.stop();

                    if (0 === self.state.meshIndex) {
                        self._refreshCamera();

                        self.setState({
                            isScanStarted: false
                        });

                        $('#model-displayer canvas').hide();
                    }

                    window.meshes = self.props.meshes;

                    if ('undefined' !== typeof mesh) {
                        scanedModel.remove(mesh.model);

                        self.setProps({
                            meshes: self.props.meshes.splice(0, self.state.meshIndex)
                        });
                    }

                    self.setState({
                        openProgressBar: false,
                        meshIndex: self.state.meshIndex - 1,
                        scanTimes: (0 === self.state.scanTimes ? 0 : self.state.scanTimes),
                        isScanStarted: false,
                        showScanButton: true
                    });
                },

                // render sections
                _renderSettingPanel: function() {
                    var self = this,
                        start_scan_text,
                        lang = args.state.lang;

                    return (
                        <SetupPanel
                            lang={lang}
                            onScanClick={this._handleScan}
                            onCancelClick={this._onScanCancel}
                            onConvertClick={this._onConvert}
                            onSaveClick={this._onSave}
                            onScanAgainClick={this._onScanAgain}
                            scanTimes={this.state.scanTimes}
                            enableMultiScan={1 < this.state.scanTimes}
                            isScanStarted={this.state.isScanStarted}
                            showScanButton={this.state.showScanButton}
                            disabledScanButton={this.state.disabledScanButton}
                            disabledConvertButton={this.state.disabledConvertButton}
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
                        'hide' : false === state.showCamera
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

                _renderProgressBar: function(lang) {
                    var self = this,
                        content,
                        onClose = function(e) {
                            self.setState({
                                openProgressBar: false
                            });
                        };

                    return (
                        <ProgressBar
                            lang={lang}
                            percentage={this.state.progressPercentage}
                            remainingTime={this.state.progressRemainingTime}
                            elapsedTime={this.state.progressElapsedTime}
                        />
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
                        },
                        className = {
                            'modal-printer-selecter': true
                        };

                    return (
                        <Modal content={content} className={className} disabledEscapeOnBackground={true} onClose={onClose}/>
                    );
                },

                _renderAlert: function(lang) {
                    var self = this,
                        onClose = function(e) {
                            self._onScanAgain(e);
                        },
                        content = (
                            <Alert lang={lang} message={self.props.error.reason} handleClose={onClose}/>
                        );

                    return (
                        <Modal content={content} disabledEscapeOnBackground={true} onClose={onClose}/>
                    );
                },

                _setManualTracking: function() {
                    var self = this,
                        rotateScene = function(dir) {
                            if ('undefined' === typeof self.props.camera) {
                                return;
                            }

                            var cameraPosition = self.props.camera,
                                x = cameraPosition.position.x,
                                y = cameraPosition.position.y,
                                z = cameraPosition.position.z,
                                speed = Math.PI / 180 * 10; // 10 deg

                            if ('left' === dir) {
                                cameraPosition.position.x = x * Math.cos(speed) + y * Math.sin(speed);
                                cameraPosition.position.y = y * Math.cos(speed) - x * Math.sin(speed);
                            }
                            else {
                                cameraPosition.position.x = x * Math.cos(speed) - y * Math.sin(speed);
                                cameraPosition.position.y = y * Math.cos(speed) + x * Math.sin(speed);
                            }

                            cameraPosition.lookAt(self.props.scene.position);

                            scanedModel.update();
                        },
                        zoom = function(dir) {
                            if ('undefined' === typeof self.props.camera) {
                                return;
                            }

                            var distance = 100 * ( ('out' === dir) ? 1 : -1),
                                mb = distance > 0 ? 1.1 : 0.9,
                                cameraPosition = self.props.camera.position;

                            if (isNaN(cameraPosition.x) || isNaN(cameraPosition.y) || isNaN(cameraPosition.y)) {
                                return;
                            }

                            if (('in' === dir && 20 >= cameraPosition.z) ||
                                ('out' === dir && 200 <= cameraPosition.z)
                            ) {
                                return;
                            }

                            cameraPosition.x = cameraPosition.x * mb;
                            cameraPosition.y = cameraPosition.y * mb;
                            cameraPosition.z = cameraPosition.z * mb;

                            scanedModel.update();
                        };

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
                },

                getInitialState: function() {
                    return {
                        lang: args.state.lang,
                        imageSrc: '',
                        gettingStarted: false,
                        meshIndex: -1,
                        scanTimes: 0,
                        selectedPrinter: undefined,
                        openPrinterSelectorWindow: true,
                        openAlert: false,
                        openProgressBar: false,
                        openBlocker: false,
                        progressPercentage: 0,
                        progressRemainingTime: this._progressRemainingTime,    // 20 minutes
                        progressElapsedTime: 0,
                        printerIsReady: false,
                        autoMerge: true,
                        enableMerge: false,
                        isScanStarted: false,
                        showScanButton: true,
                        showCamera: true,
                        disabledScanButton: false,
                        disabledConvertButton: false
                    };
                },

                getDefaultProps: function () {
                    return {
                          scanStartTime: null,
                          scanMethods: null,
                          scanCtrlWebSocket: null,
                          scanModelingWebSocket: null,
                          meshes: [],
                          cylinder: null,
                          saveFileType: 'pcd',
                          error: {}
                    };
                },

                componentWillUnmount: function() {
                    if ('undefined' !== typeof this.props.scanCtrlWebSocket &&
                        'undefined' !== typeof this.props.scanModelingWebSocket
                    ) {
                        this.props.scanCtrlWebSocket.connection.close(false);
                        this.props.scanModelingWebSocket.connection.close(false);
                    }

                    scanedModel.destroy();
                },

                render : function() {
                    var state = this.state,
                        lang = state.lang,
                        progressBar = (
                            true === state.openProgressBar ?
                            this._renderProgressBar(lang) :
                            ''
                        ),
                        printerBlocker = (
                            true === state.openBlocker ?
                            <Modal content={<div className="spinner-flip spinner-reverse"/>}/> :
                            ''
                        ),
                        alert = (
                            true === state.openAlert ?
                            this._renderAlert(lang) :
                            ''
                        ),
                        cx = React.addons.classSet,
                        activeSection,
                        header;

                    activeSection = (
                        false === state.gettingStarted ?
                        this._renderPrinterSelectorWindow() :
                        this._renderStageSection()
                    );

                    this._setManualTracking();

                    return (
                        <div className="studio-container scan-studio">

                            <div className="stage">

                                {activeSection}

                            </div>

                            {progressBar}
                            {printerBlocker}
                            {alert}
                        </div>
                    );
                },

                componentDidMount: function() {
                    var self = this,
                        opts = {
                            onError: function(data) {
                                self.setState({
                                    openAlert: true
                                })
                                self._openBlocker(false);
                                self.setProps({
                                    error: data
                                });
                            },
                            onReady: function() {
                                self.setState({
                                    printerIsReady: true
                                });
                                self._openBlocker(false);
                            }
                        },
                        state, timer;

                    timer = setInterval(function() {
                        state = self.state;

                        if (true === state.gettingStarted && null !== state.selectedPrinter) {
                            self.setProps({
                                scanStartTime: null,
                                scanMethods: null,
                                scanCtrlWebSocket: scanControl(state.selectedPrinter.serial, opts),
                                scanModelingWebSocket: scanModeling(opts),
                                meshes: [],
                                cylinder: undefined,
                                saveFileType: 'pcd',
                                error: {}
                            });
                            self._refreshCamera();
                            clearInterval(timer);
                        }
                    }, 100);
                }

            });

        return View;
    };
});