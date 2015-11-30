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
    'helpers/round',
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
    shortcuts,
    round
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

                _refreshObjectDialogPosition: function(objectScreenPosition, matrix) {
                    var self = this,
                        state = self.state;

                    self.setState({
                        selectedObject: matrix,
                        objectDialogPosition: {
                            left: objectScreenPosition.x,
                            top: objectScreenPosition.y
                        }
                    });
                },

                _onRendering: function(views, chunk_length, mesh) {
                    var self = this,
                        scan_speed = self._getScanSpeed(),
                        progressRemainingTime = self.props.progressRemainingTime / scan_speed * (scan_speed - chunk_length),
                        progressElapsedTime = parseInt(((new Date()).getTime() - self.state.scanStartTime) / 1000, 10),
                        progressPercentage,
                        meshes = self.state.meshes,
                        mesh = mesh || self._getMesh(self.state.scanTimes),
                        model, transformMethods;

                    progressPercentage = Math.min(
                        round(chunk_length / scan_speed * 100, -2),
                        100
                    );

                    self.setState({
                        progressPercentage: progressPercentage,
                        progressRemainingTime: progressRemainingTime,
                        progressElapsedTime: progressElapsedTime
                    });

                    if ('undefined' === typeof mesh) {
                        model = scanedModel.appendModel(views);

                        meshes.push({
                            model: model,
                            transformMethods: {
                                hide: function() {}
                            },
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
                                hasConvert: true
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

                                    mesh.name = upload_name;

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

                    self.setState({
                        scanStartTime: (new Date()).getTime(),
                        scanTimes: self.state.scanTimes + 1,
                        isScanStarted: true,
                        showCamera: false,
                        stage: stage
                    });

                    checkLenOpened();
                },

                _onScanAgain: function(e) {
                    this.setState(this.getInitialState());
                },

                _doClearNoise: function(mesh) {
                    var self = this,
                        delete_noise_name = 'clear-noise-' + (new Date()).getTime(),
                        onStarting = function(data) {
                            self._openBlocker(true);
                        },
                        onDumpFinished = function(data) {
                            var newMesh;

                            newMesh = self._getMesh(self.state.scanTimes);
                            newMesh.name = delete_noise_name;
                            self._openBlocker(false);
                        },
                        onDumpReceiving = function(data, len) {
                            self._onRendering(data, len, mesh);
                        };

                    self.state.scanModelingWebSocket.deleteNoise(
                        mesh.name,
                        delete_noise_name,
                        0.3,
                        {
                            onStarting: onStarting,
                            onFinished: onDumpFinished,
                            onReceiving: onDumpReceiving
                        }
                    );
                },

                _doCropOn: function(mesh) {
                    mesh.transformMethods.hide();
                    this.setState({
                        cylinder: scanedModel.cylinder.create(mesh.model)
                    });
                },

                _doCropOff: function(mesh) {
                    var self = this,
                        cut_name = 'cut-' + (new Date()).getTime(),
                        cylider_box = new THREE.Box3().setFromObject(self.state.cylinder),
                        opts = {
                            onStarting: function() {
                                self._openBlocker(true);
                            },
                            onReceiving: self._onRendering,
                            onFinished: function(data) {
                                mesh.transformMethods.show();
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
                            mesh.name,
                            cut_name,
                            args,
                            opts
                        );

                        mesh.name = cut_name;
                    }

                    scanedModel.cylinder.remove(mesh.model);
                    self.setState({
                        cylinder: undefined
                    });
                },

                _doApplyTransform: function(nextAction) {
                    nextAction = nextAction || function() {};

                    var self = this,
                        selectedMeshes = this.state.selectedMeshes,
                        endIndex = selectedMeshes.length - 1,
                        currentIndex = 0,
                        isEnd = function() {
                            return (endIndex === currentIndex);
                        },
                        doingApplyTransform = function() {
                            currentMesh = selectedMeshes[currentIndex];
                            matrixValue = scanedModel.matrix(currentMesh.model);
                            params = {
                                pX: matrixValue.position.center.x,
                                pY: matrixValue.position.center.y,
                                pZ: matrixValue.position.center.z,
                                rX: matrixValue.rotation.x,
                                rY: matrixValue.rotation.y,
                                rZ: matrixValue.rotation.z
                            };

                            // baseName, outName, params, onFinished
                            self.state.scanModelingWebSocket.applyTransform(
                                currentMesh.name,
                                currentMesh.name,
                                params,
                                onFinished
                            );

                        },
                        onFinished = function() {
                            if (false === isEnd()) {
                                currentIndex++;
                                doingApplyTransform();
                            }
                            else {
                                nextAction();
                            }
                        },
                        params,
                        currentMesh,
                        matrixValue;

                    if (false === isEnd()) {
                        doingApplyTransform();
                    }
                },

                _doManualMerge: function() {
                    var self = this,
                        meshes = this.state.meshes,
                        selectedMeshes = this.state.selectedMeshes,
                        outputName = '';

                    this._doApplyTransform(function(response) {
                        var onMergeFinished = function(data) {
                                if (false === isEnd()) {
                                    currentIndex++;
                                    doingMerge();
                                }
                                else {
                                    doingDump(outputName);
                                }
                            },
                            doingDump = function(outputName) {
                                var mesh,
                                    updatedMeshes = [];

                                self.state.scanModelingWebSocket.dump(
                                    outputName,
                                    {
                                        onReceiving: self._onRendering,
                                        onFinished: function(response) {

                                            // TODO: BLACK MAGIC!!! i've no idea why the state.meshes doesn't update?
                                            var timer = setInterval(function() {
                                                if (self.state.scanTimes === self.state.meshes.length) {
                                                    mesh = self._getMesh(self.state.scanTimes);
                                                    mesh.name = outputName;

                                                    self.state.selectedMeshes.forEach(function(selectedMesh, i) {
                                                        scanedModel.remove(selectedMesh.model);
                                                    });

                                                    for (var i = self.state.meshes.length - 1; i >= 0; i--) {
                                                        if (true === self.state.meshes[i].choose) {
                                                            self.state.meshes.splice(i, 1);
                                                        }
                                                    }

                                                    self.setState({
                                                        meshes: self.state.meshes,
                                                        selectedMeshes: []
                                                    });

                                                    self._openBlocker(false);

                                                    clearInterval(timer);
                                                }
                                            }, 100);

                                        }
                                    }
                                );
                            },
                            onMergeStarting = function() {
                                self._openBlocker(true);
                            },
                            isEnd = function() {
                                return (endIndex === currentIndex);
                            },
                            currentIndex = 0,
                            endIndex = selectedMeshes.length - 2,
                            doingMerge = function() {
                                baseMesh = selectedMeshes[currentIndex];
                                targetMesh = selectedMeshes[currentIndex + 1];
                                baseName = baseMesh.name;

                                if ('' === outputName) {
                                    outputName = 'merge-' + (new Date()).getTime();
                                }
                                else {
                                    baseName = outputName;
                                }

                                if ('undefined' !== typeof targetMesh) {
                                    self.state.scanModelingWebSocket.merge(
                                        baseName,
                                        targetMesh.name,
                                        outputName,
                                        {
                                            onStarting: onMergeStarting,
                                            onReceiving: self._onRendering,
                                            onFinished: onMergeFinished
                                        }
                                    );
                                }
                            },
                            baseName,
                            baseMesh,
                            targetMesh;

                        self.setState({
                            // take merge as scan
                            scanTimes: self.state.scanTimes + 1
                        }, function() {
                            doingMerge();
                        });
                    });
                },

                _switchTransformMode: function(mode, e) {
                    var self = this,
                        methods = self.state.selectedMeshes[0].transformMethods;

                    switch (mode) {
                    case 'scale':
                        methods.show().scale();
                        break;
                    case 'rotate':
                        methods.show().rotate();
                        break;
                    case 'translate':
                        methods.show().translate();
                        break;
                    }
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

                _renderManipulationPanel: function(lang) {
                    var state = this.state,
                        refreshMatrix = function(mesh, matrix) {
                            mesh.model.position.set(matrix.position.x , matrix.position.y , matrix.position.z);
                            mesh.model.rotation.set(matrix.rotation.x , matrix.rotation.y , matrix.rotation.z);

                            scanedModel.render();
                        };

                    return (
                        0 < state.selectedMeshes.length && false === state.openBlocker ?
                        <ManipulationPanel
                            lang = {lang}
                            selectedMeshes={state.selectedMeshes}
                            switchTransformMode={this._switchTransformMode}
                            onCropOn={this._doCropOn}
                            onCropOff={this._doCropOff}
                            onClearNoise={this._doClearNoise}
                            onManualMerge={this._doManualMerge}
                            object={state.selectedObject}
                            position={state.objectDialogPosition}
                            onChange={refreshMatrix}
                        /> :
                        ''
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
                                e.preventDefault();

                                var me = e.currentTarget,
                                    mesh = self._getMesh(parseInt(me.dataset.index, 10)),
                                    position = scanedModel.toScreenPosition(mesh.model),
                                    transformMethods = scanedModel.attachControl(mesh.model, self._refreshObjectDialogPosition),
                                    selectedMeshes;

                                mesh.transformMethods = transformMethods;

                                if (false === e.shiftKey) {
                                    meshes.forEach(function(mesh, key) {
                                        if (key !== i) {
                                            mesh.transformMethods.hide();
                                            mesh.choose = false;
                                            mesh.model.material.opacity = 0.3;
                                        }
                                    });
                                }
                                else {
                                    meshes.forEach(function(mesh, key) {
                                        mesh.transformMethods.hide();
                                    });
                                }

                                // store selected mesh
                                mesh.choose = !mesh.choose;

                                mesh.model.material.opacity = (true === mesh.choose ? 1 : 0.3);

                                selectedMeshes = meshes.filter(function(mesh) {
                                    return true === mesh.choose;
                                });

                                self.setState({
                                    selectedMeshes: selectedMeshes,
                                    selectedObject: scanedModel.matrix(mesh.model),
                                    objectDialogPosition: {
                                        left: position.x,
                                        top: position.y
                                    }
                                }, function() {
                                    scanedModel.cylinder.remove();

                                    if (1 === selectedMeshes.length && true === mesh.choose) {
                                        mesh.transformMethods.show();
                                    }
                                    else {
                                        mesh.transformMethods.hide();
                                    }

                                    scanedModel.render();
                                });
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
                        isScanStarted: false,   // scan getting started
                        showCamera: true,
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
                        stlBlob: undefined,
                        objectDialogPosition: {
                            left: 0,
                            top: 0
                        },
                        selectedObject: {
                            position: {},
                            size: {},
                            rotate: {},
                        },
                        stage: undefined // three stage (scene, camera, renderer)
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

                render: function() {
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
                            {alert}
                            {confirm}
                            {printerBlocker}
                        </div>
                    );
                }

            });

        return View;
    };
});