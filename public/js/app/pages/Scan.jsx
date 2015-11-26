define([
    'jquery',
    'react',
    'jsx!widgets/List',
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
    'jsx!views/scan/Action-Buttons',
    'helpers/shortcuts',
    'helpers/array-findindex',
    'plugins/file-saver/file-saver.min'
], function(
    $,
    React,
    List,
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
    ActionButtons,
    shortcuts
) {
    'use strict';

    return function(args) {
        args = args || {};

        var View = React.createClass({

                getDefaultProps: function () {
                    return {
                        progressRemainingTime: 1200 // 20 minutes
                    };
                },

                // ui events
                _rescan: function(e) {
                    this.setState(this.getInitialState());
                },

                _refreshCamera: function() {
                    var self = this;

                    self.setState({
                        scanControlImageMethods: self.state.scanCtrlWebSocket.getImage(
                            function(image_blobs, mime_type) {
                                var blob = new Blob(image_blobs, {type: mime_type}),
                                    url = (window.URL || window.webkitURL),
                                    objectUrl = url.createObjectURL(blob),
                                    img = self.refs.camera_image.getDOMNode();

                                if (false === self.state.showCamera) {
                                    self.setState({
                                        showCamera: true
                                    });
                                }

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
                    var meshes = this.state.meshes,
                        findIndex = function(el) {
                            return el.index === index;
                        },
                        existingIndex = meshes.findIndex(findIndex);

                    return meshes[existingIndex];
                },

                _getScanSpeed: function() {
                    return parseInt(this.refs.setupPanel.getSettings().resolution.value, 10);
                },

                _onRendering: function(views, chunk_length) {
                    var self = this,
                        scan_speed = self._getScanSpeed(),
                        progressRemainingTime = self.props.progressRemainingTime / scan_speed * (scan_speed - chunk_length),
                        progressElapsedTime = parseInt(((new Date()).getTime() - self.state.scanStartTime) / 1000, 10),
                        progressPercentage,
                        meshes = self.state.meshes,
                        mesh = self._getMesh(self.state.scanTimes);

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
                            name: '',
                            index: self.state.scanTimes,
                            choose: false
                        });
                    }
                    else {
                        mesh.model = scanedModel.updateMesh(mesh.model, views);
                    }
                },

                _onConvert: function(e) {
                    var self = this,
                        last_point_cloud = self.state.scanModelingWebSocket.History.getLatest(),
                        file_format = 'stl',
                        onClose = function(e) {
                            self.state.meshes.forEach(function(mesh, e) {
                                scanedModel.remove(mesh.model);
                            });
                            self._openBlocker(false);
                            self.setState({
                                meshes: [],
                                saveFileType: 'stl',
                                hasConvert: true,
                                disabledConvertButton: true,
                                disabledScanButton: true
                            });
                        };

                    self._openBlocker(true);

                    // merge every mesh


                    self.state.scanModelingWebSocket.export(
                        last_point_cloud.name,
                        file_format,
                        {
                            onFinished: function(blob) {
                                self.setState({
                                    stlBlob: blob
                                });

                                scanedModel.loadStl(blob, onClose);
                            }
                        }
                    );
                },

                _onSave: function(e) {
                    var self = this,
                        doExport = function() {
                            var last_point_cloud = self.state.scanModelingWebSocket.History.getLatest(),
                                file_format = self.state.saveFileType,
                                file_name = (new Date()).getTime() + '.' + file_format;

                            self._openBlocker(true);

                            if (self.state.stlBlob instanceof Blob) {
                                saveAs(self.state.stlBlob, file_name);
                                self._openBlocker(false);
                            }
                            else {
                                self.state.scanModelingWebSocket.export(
                                    last_point_cloud.name,
                                    file_format,
                                    {
                                        onFinished: function(blob) {
                                            saveAs(blob, file_name);
                                            onClose();
                                        }
                                    }
                                );
                            }
                        },
                        onClose = function(e) {
                            self._openBlocker(false);
                        };

                    doExport();
                },

                _handleScan: function(e) {
                    var self = this,
                        onScanFinished = function(point_cloud) {
                            var upload_name = 'scan-' + (new Date()).getTime(),
                                onUploadFinished = function() {
                                    var mesh = self._getMesh(self.state.scanTimes);

                                    if (0 < self.state.scanTimes) {
                                        self.setState({
                                            enableMerge: true
                                        });
                                    }

                                    mesh.name = upload_name;

                                    self._openBlocker(false);

                                    // update scan times
                                    self.setState({
                                        openProgressBar: false,
                                        isScanStarted: false
                                    });
                                };

                            self.state.scanModelingWebSocket.upload(
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
                                openProgressBar: true
                            });
                        },
                        checkLenOpened = function() {
                            var opts = {
                                onPass: function() {
                                    self._openBlocker(false);
                                    openProgressBar(onScan);
                                },
                                onFail: function(message) {
                                    self._openBlocker(false);
                                    self.setState({
                                        openAlert: true,
                                        isScanStarted: false,
                                        showCamera: true,
                                        error: {
                                            caption: self.state.lang.scan.error,
                                            message: message
                                        },
                                        scanTimes: self.state.scanTimes - 1
                                    });
                                }
                            };

                            self.state.scanCtrlWebSocket.check(opts);
                        },
                        onScan = function() {
                            var opts = {
                                    onRendering: self._onRendering,
                                    onFinished: onScanFinished
                                },
                                scan_speed = self._getScanSpeed();

                            if ('undefined' === typeof self.state.scanMethods) {
                                self.setState({
                                    scanMethods: self.state.scanCtrlWebSocket.scan(scan_speed, opts)
                                });
                            }
                            else {
                                self.state.scanCtrlWebSocket.scan(scan_speed, opts);
                            }
                        },
                        stage;

                    stage = scanedModel.init();

                    self.state.scanControlImageMethods.stop();

                    self._openBlocker(true);
                    self.setState({
                        scanStartTime: (new Date()).getTime(),
                        scanTimes: self.state.scanTimes + 1,
                        isScanStarted: true,
                        showCamera: false
                    });

                    openProgressBar(onScan);
                    // checkLenOpened();
                },

                _onScanAgain: function(e) {
                    this.setState(this.getInitialState());
                },

                _doClearNoise: function() {
                    var self = this,
                        last_point_cloud = self.state.scanModelingWebSocket.History.getLatest(),
                        delete_noise_name = 'clear-noise-' + (new Date()).getTime(),
                        onStarting = function(data) {
                            self._openBlocker(true);
                        },
                        onDumpFinished = function(data) {
                            var mesh;

                            mesh = self._getMesh(self.state.scanTimes);
                            mesh.name = delete_noise_name;
                            self._openBlocker(false);
                        },
                        onDumpReceiving = function(data, len) {
                            self._onRendering(data, len);
                        };

                    self.state.scanModelingWebSocket.delete_noise(
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
                    var mesh = this._getMesh(this.state.scanTimes);
                    this.setState({
                        cylinder: scanedModel.cylinder.create(mesh.model)
                    });
                },

                _doCropOff: function() {
                    var self = this,
                        mesh = this._getMesh(this.state.scanTimes),
                        last_point_cloud = self.state.scanModelingWebSocket.History.getLatest(),
                        cut_name = 'cut-' + (new Date()).getTime(),
                        cylider_box = new THREE.Box3().setFromObject(self.state.cylinder),
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

                        self.state.scanModelingWebSocket.cut(
                            last_point_cloud.name,
                            cut_name,
                            args,
                            opts
                        );

                        mesh.name = cut_name;
                    }

                    scanedModel.cylinder.remove(self.state.cylinder);
                    self.setState({
                        cylinder: undefined
                    });
                },

                _doManualMerge: function() {
                    var self = this,
                        meshes = this.state.meshes,
                        output_name = 'merge-' + (new Date()).getTime(),
                        onMergeFinished = function(data) {
                            self.setState({
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

                    self.state.scanModelingWebSocket.merge(
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
                        meshes = this.state.meshes,
                        mesh = this._getMesh(this.state.scanTimes),
                        output_name = 'automerge-' + (new Date()).getTime(),
                        onMergeFinished = function(data) {
                            var transform_methods = scanedModel.attachControl(self._getMesh(self.state.scanTimes).model);
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

                    self.state.scanModelingWebSocket.autoMerge(
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

                _openConfirm: function(open, opts) {
                    opts = opts || {};

                    this.setState({
                        confirm: {
                            show: open,
                            caption: opts.caption || '',
                            message: opts.message || '',
                            onOK: opts.onOK || function() {},
                            onCancel: opts.onCancel || function() {}
                        }
                    });
                },

                _openBlocker: function(is_open) {
                    this.setState({
                        openBlocker: is_open
                    })
                },

                _onScanCancel: function(e) {
                    var self = this,
                        mesh = self._getMesh(self.state.scanTimes);

                    self.state.scanMethods.stop();
                    // TODO: restore to the status before scan

                    self.setState({
                        openProgressBar: false,
                        scanTimes: (0 === self.state.scanTimes ? 0 : self.state.scanTimes),
                        isScanStarted: false
                    });
                },

                // render sections
                _renderSettingPanel: function() {
                    var self = this,
                        start_scan_text,
                        lang = args.state.lang,
                        className = {
                            'hide': 0 < self.state.scanTimes
                        };

                    return (
                        <SetupPanel className={className} ref="setupPanel" lang={lang}/>
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

                _renderStageSection: function(lang) {
                    var self = this,
                        state = self.state,
                        cx = React.addons.classSet,
                        camera_image_class,
                        settingPanel = self._renderSettingPanel(lang),
                        manipulationPanel = self._renderManipulationPanel(lang),
                        meshThumbnails = this._renderMeshThumbnail(lang),
                        closeSubPopup = function(e) {
                            self.refs.setupPanel.openSubPopup(e);
                        };

                    camera_image_class = cx({
                        'camera-image' : true,
                        'hide' : 0 < state.scanTimes
                    });

                    return (
                        true === state.printerIsReady ?
                        <section ref="operatingSection" className="operating-section">
                            {meshThumbnails}
                            <div id="model-displayer" className="model-displayer">
                                <img ref="camera_image" src="" className={camera_image_class} onClick={closeSubPopup}/>
                            </div>
                            {settingPanel}
                            {manipulationPanel}
                        </section> :
                        ''
                    );
                },

                _renderActionButtons: function(lang) {
                    var className = {
                        'hide': this.state.isScanStarted,
                        'action-buttons': true
                    };

                    return (
                        true === this.state.gettingStarted ?
                        <ActionButtons
                            className={className}
                            meshes={this.state.meshes}
                            lang={lang}
                            hasConvert={this.state.hasConvert}
                            scanTimes={this.state.scanTimes}
                            onScanClick={this._handleScan}
                            onRollbackClick={this._onRollbackClick}
                            onConvertClick={this._onConvert}
                            onSaveClick={this._onSave}
                            onScanAgainClick={this._onScanAgain}
                        /> :
                        ''
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
                        true === this.state.openProgressBar ?
                        <ProgressBar
                            lang={lang}
                            percentage={this.state.progressPercentage}
                            remainingTime={this.state.progressRemainingTime}
                            elapsedTime={this.state.progressElapsedTime}
                        /> :
                        ''
                    );
                },

                _renderPrinterSelectorWindow: function(lang) {
                    var self = this,
                        opts = {
                            onError: function(data) {
                                self._openBlocker(false);
                                self.setState({
                                    openAlert: true,
                                    gettingStarted: false,
                                    error: {
                                        caption: lang.scan.error,
                                        message: data.error
                                    }
                                });
                            },
                            onReady: function() {
                                self.setState({
                                    printerIsReady: true
                                });
                                self._openBlocker(false);

                                self._refreshCamera();
                            }
                        },
                        onGettingPrinter = function(auth_printer) {
                            self.setState({
                                gettingStarted: true,
                                selectedPrinter: auth_printer,
                                scanCtrlWebSocket: scanControl(auth_printer.uuid, opts),
                                scanModelingWebSocket: scanModeling(opts)
                            });

                            self._openBlocker(true);
                        },
                        content = (
                            <PrinterSelector className="scan-printer-selection" lang={lang} onGettingPrinter={onGettingPrinter}/>
                        ),
                        className = {
                            'modal-printer-selecter': true
                        };

                    return (
                        false === self.state.gettingStarted ?
                        <Modal content={content} className={className} disabledEscapeOnBackground={true}/> :
                        ''
                    );
                },

                _renderAlert: function(lang) {
                    var self = this,
                        onClose = function(e) {
                            (self.state.error.onClose || function() {})();
                            self.setState({
                                openAlert: false
                            });
                        },
                        buttons = [{
                            label: lang.scan.confirm,
                            onClick: onClose
                        }],
                        content = (
                            <Alert
                                lang={lang}
                                caption={self.state.error.caption}
                                message={self.state.error.message}
                                buttons={buttons}
                            />
                        );

                    return (
                        true === self.state.openAlert ?
                        <Modal content={content} disabledEscapeOnBackground={true}/> :
                        ''
                    );
                },

                _renderConfirm: function(lang) {
                    var self = this,
                        onOK = function(e) {
                            (self.state.confirm.onOK || function() {})();
                            self._openConfirm(false);
                        },
                        onCancel = function(e) {
                            (self.state.confirm.onCancel || function() {})();
                            self._openConfirm(false);
                        },
                        buttons = [{
                            label: lang.scan.confirm,
                            onClick: onOK
                        },
                        {
                            label: lang.scan.cancel,
                            onClick: onCancel
                        }],
                        content = (
                            <Alert
                                lang={lang}
                                caption={self.state.confirm.caption}
                                message={self.state.confirm.message}
                                buttons={buttons}
                            />
                        );

                    return (
                        true === self.state.confirm.show ?
                        <Modal content={content} disabledEscapeOnBackground={true}/> :
                        ''
                    );
                },

                _renderBlocker: function(lang) {
                    return (
                        true === this.state.openBlocker ?
                        <Modal content={<div className="spinner-flip spinner-reverse"/>}/> :
                        ''
                    );
                },

                _renderMeshThumbnail: function(lang) {
                    var self = this,
                        thumbnails = [],
                        meshes = self.state.meshes,
                        cx = React.addons.classSet,
                        itemClass = {};

                    thumbnails = meshes.map(function(mesh, i) {
                        var onChooseMesh = function(e) {
                                var me = e.currentTarget,
                                    mesh = self._getMesh(parseInt(me.dataset.index, 10));

                                if (false === e.shiftKey) {
                                    meshes.forEach(function(mesh, key) {
                                        if (key !== i) {
                                            mesh.choose = false;
                                            mesh.model.material.opacity = 0.3;
                                        }
                                    });
                                }

                                // store selected mesh
                                mesh.choose = !mesh.choose;

                                mesh.model.material.opacity = (true === mesh.choose ? 1 : 0.3);

                                self.setState({
                                    selectedMeshes: meshes.filter(function(mesh) {
                                            return mesh.choose;
                                        })
                                });

                                scanedModel.render();

                                self.forceUpdate();
                            },
                            onDeleteMesh = function(e) {
                                var deleteMesh = function() {
                                    scanedModel.remove(mesh.model);
                                    meshes.splice(i, 1);

                                    self.setState({
                                        meshes: meshes,
                                        scanTimes: (0 === meshes.length ? 0 : self.state.scanTimes)
                                    });
                                };

                                self._openConfirm(
                                    true,
                                    {
                                        caption: lang.scan.caution,
                                        message: lang.scan.delete_mesh,
                                        onOK: deleteMesh
                                    }
                                );
                            };

                        itemClass = {
                            'mesh-thumbnail-item': true,
                            'choose': mesh.choose
                        };

                        return {
                            label: (
                                <div className={cx(itemClass)} data-index={mesh.index} onClick={onChooseMesh}>
                                    {mesh.index}
                                    <div className="mesh-thumbnail-close fa fa-times" onClick={onDeleteMesh}></div>
                                </div>
                            )
                        }
                    });

                    return (
                        0 < meshes.length ?
                        <List className="mesh-thumbnail" items={thumbnails}/> :
                        ''
                    );
                },

                getInitialState: function() {
                    return {
                        lang: args.state.lang,
                        gettingStarted: false,  // selecting machine
                        scanTimes: 0,   // how many scan executed
                        selectedPrinter: undefined, // which machine selected
                        confirm: {
                            show: false,
                            caption: '',
                            message: '',
                            onOK: function() {},
                            onCancel: function() {}
                        },
                        openAlert: false,
                        openProgressBar: false,
                        openBlocker: false,
                        hasConvert: false,  // point cloud into stl
                        progressPercentage: 0,
                        progressRemainingTime: this.props.progressRemainingTime,    // 20 minutes
                        progressElapsedTime: 0,
                        printerIsReady: false,
                        autoMerge: true,
                        enableMerge: false,
                        isScanStarted: false,   // scan getting started
                        showCamera: true,
                        disabledScanButton: false,
                        disabledConvertButton: false,
                        scanStartTime: undefined,   // when the scan started
                        scanMethods: undefined,
                        scanCtrlWebSocket: undefined,
                        scanModelingWebSocket: undefined,
                        meshes: [],
                        selectedMeshes: [],
                        cylinder: undefined,
                        saveFileType: 'pcd',
                        error: {
                            caption: '',
                            message: '',
                            onClose: function() {}
                        },
                        stlBlob: undefined
                    };
                },

                componentWillUnmount: function() {
                    if ('undefined' !== typeof this.state.scanCtrlWebSocket &&
                        'undefined' !== typeof this.state.scanModelingWebSocket
                    ) {
                        this.state.scanCtrlWebSocket.connection.close(false);
                        this.state.scanModelingWebSocket.connection.close(false);
                    }

                    scanedModel.destroy();
                },

                render : function() {
                    var state = this.state,
                        lang = state.lang,
                        progressBar = this._renderProgressBar(lang),
                        printerBlocker = this._renderBlocker(lang),
                        alert = this._renderAlert(lang),
                        confirm = this._renderConfirm(lang),
                        cx = React.addons.classSet,
                        selectPrinter = this._renderPrinterSelectorWindow(lang),
                        actionButtons = this._renderActionButtons(lang),
                        scanStage = this._renderStageSection(lang);

                    return (
                        <div className="studio-container scan-studio">
                            {selectPrinter}
                            {scanStage}
                            {actionButtons}
                            {progressBar}
                            {printerBlocker}
                            {alert}
                            {confirm}
                        </div>
                    );
                }

            });

        return View;
    };
});