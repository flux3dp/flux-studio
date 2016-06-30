define([
    'jquery',
    'react',
    'jsx!widgets/List',
    'jsx!widgets/Modal',
    'app/actions/scaned-model',
    'helpers/api/3d-scan-control',
    'helpers/api/3d-scan-modeling',
    'jsx!views/scan/Setup-Panel',
    'jsx!views/scan/Manipulation-Panel',
    'jsx!views/Print-Selector',
    'jsx!views/scan/Export',
    'jsx!views/scan/Progress-Bar',
    'jsx!views/scan/Action-Buttons',
    'jsx!widgets/File-Uploader',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/progress-actions',
    'app/stores/progress-store',
    'app/constants/progress-constants',
    'helpers/shortcuts',
    'helpers/round',
    'helpers/dnd-handler',
    'helpers/nwjs/menu-factory',
    'helpers/point-cloud',
    'Rx',
    // non-return
    'helpers/array-findindex',
    'helpers/object-assign',
    'plugins/file-saver/file-saver.min'
], function(
    $,
    React,
    List,
    Modal,
    scanedModel,
    scanControl,
    scanModeling,
    SetupPanel,
    ManipulationPanel,
    PrinterSelector,
    Export,
    ProgressBar,
    ActionButtons,
    FileUploader,
    AlertActions,
    AlertStore,
    ProgressActions,
    ProgressStore,
    ProgressConstants,
    shortcuts,
    round,
    dndHandler,
    menuFactory,
    PointCloudHelper,
    Rx
) {
    'use strict';

    return function(args) {
        args = args || {};

        var meshUpdateStream = new Rx.Subject(),
            meshAddRemoveStream = new Rx.Subject(),
            subscriber,
            meshAddRemoveSubscriber;

        var View = React.createClass({
                MAX_MESHES: 5,

                getInitialState: function() {
                    return {
                        lang: args.state.lang,
                        gettingStarted: false,  // selecting machine
                        scanTimes: 0,   // how many scan executed
                        selectedPrinter: undefined, // which machine selected
                        deleting_mesh: undefined,
                        cameraImageSrc: undefined,
                        history: [],
                        openProgressBar: false,
                        openBlocker: false,
                        hasConvert: false,  // point cloud into stl
                        hasMultiScan: false,    // ready to multi scan
                        progressPercentage: 0,
                        progressRemainingTime: 0,
                        currentSteps: 0,
                        printerIsReady: false,
                        isScanStarted: false,   // scan getting started
                        showCamera: true,
                        scanStartTime: undefined,   // when the scan started
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
                        stlMesh: undefined,
                        objectDialogPosition: {
                            left: 0,
                            top: 0
                        },
                        selectedObject: {
                            position: {},
                            size: {},
                            rotate: {},
                        },
                        stage: undefined // three stages (scene, camera, renderer)
                    };
                },

                componentDidMount: function() {
                    var self = this,
                        lang = self.state.lang,
                        object,
                        pushToHistory = function(mesh, arrayIndex) {
                            mesh.type = 'update';
                            mesh.arrayIndex = arrayIndex;
                            self.setState({
                               history: self.state.history.concat([mesh])
                            });
                        },
                        fireUndo = function() {
                            if (0 < self.state.history.length) {
                                self._undo();
                            }
                            else {
                                AlertActions.showPopupError('cant-undo', lang.scan.cant_undo);
                            }
                        };

                    subscriber = meshUpdateStream.subscribe((m) => {
                        object = Object.assign({}, m);
                        object.oldBlob = self.state.scanModelingWebSocket.History.findByName(m.oldName)[0].data;
                        object.isUndo = false;
                        object.name = m.oldName;
                        pushToHistory(object, m.arrayIndex);
                    });

                    meshAddRemoveSubscriber = meshAddRemoveStream.subscribe((changedMeshes) => {
                        changedMeshes.forEach((m) => {
                            var o = Object.assign({}, m.mesh);
                            if(o.isUndo !== true) {
                                o.type = m.type;
                                self.setState({
                                    history: self.state.history.concat([o])
                                });
                            }
                            else {
                                m.mesh.isUndo = false;
                            }
                        });
                    });

                    shortcuts.on(['cmd', 'z'], fireUndo);

                    AlertStore.onRetry(self._retry);
                    AlertStore.onYes(self._onYes);
                    AlertStore.onCancel(self._onCancel);
                    dndHandler.plug(document, self._importPCD);

                    self.setState({
                        stage: scanedModel.init()
                    });

                    menuFactory.items.undo.enabled = true;
                    menuFactory.items.undo.onClick = fireUndo;
                    menuFactory.items.import.enabled = false === self.state.isScanStarted;
                    menuFactory.items.import.onClick = function() {
                        self.refs.fileUploader.getDOMNode().click();
                    };
                },

                componentWillUnmount: function() {
                    var self = this,
                        stopGettingImage = function() {
                            if ('undefined' !== typeof self.state.scanCtrlWebSocket) {
                                self.state.scanCtrlWebSocket.stopGettingImage().done(function() {
                                    self.state.scanCtrlWebSocket.connection.close(false);
                                });
                            }
                        };

                    AlertStore.removeRetryListener(self._retry);
                    AlertStore.removeYesListener(self._onYes);
                    AlertStore.removeCancelListener(self._onCancel);
                    dndHandler.unplug(document);

                    if ('undefined' !== typeof self.state.scanModelingWebSocket) {
                        self.state.scanModelingWebSocket.connection.close(false);
                    }

                    stopGettingImage();

                    scanedModel.destroy();
                    subscriber.dispose();
                    meshAddRemoveSubscriber.dispose();
                },

                // ui events
                _undo: function() {
                    var self = this,
                        currentMesh,
                        actionMap = {
                            add: function(mesh) {
                                var revertTimes = mesh.associted || 0;

                                currentMesh = self._getMesh(mesh.index);
                                currentMesh.isUndo = true;

                                // ask for delete
                                if (0 === revertTimes) {
                                    self._onDeletingMesh(currentMesh, mesh.arrayIndex);
                                }
                                else {
                                    self._onDeleteMesh(mesh.arrayIndex, currentMesh);

                                    // delete associted mesh
                                    for (var i = 0; i < revertTimes; i++) {
                                        currentMesh = self.state.history.pop();
                                        actionMap.remove(currentMesh);
                                    }
                                }
                            },
                            update: function(mesh) {
                                var fileReader = new FileReader(),
                                    meshes = self.state.meshes,
                                    newMesh = {},
                                    typedArray;

                                fileReader.onload = function() {

                                    // remove current
                                    currentMesh = self._getMesh(mesh.index);
                                    currentMesh.isUndo = true;
                                    currentMesh.transformMethods.hide();
                                    self._onDeleteMesh(mesh.arrayIndex, currentMesh);

                                    // add old
                                    typedArray = new Float32Array(this.result);

                                    // update point cloud
                                    mesh.model = scanedModel.updateMesh(mesh.model, typedArray);

                                    newMesh = self._newMesh({
                                        model: mesh.model,
                                        name: mesh.name,
                                        index: mesh.index
                                    });

                                    scanedModel.add(mesh.model);
                                    newMesh.isUndo = true;
                                    meshes.splice(mesh.arrayIndex, 0, newMesh);
                                    self.state.scanCtrlWebSocket.stopGettingImage();
                                    self.setState({
                                        showCamera: false,
                                        meshes: meshes
                                    }, () => {
                                        meshAddRemoveStream.onNext([{mesh: newMesh, type:'add'}]);
                                    });
                                };

                                fileReader.readAsArrayBuffer(mesh.oldBlob);
                            },
                            remove: function(mesh) {
                                // add
                                mesh.model.material.opacity = 0.3;
                                mesh.choose = false;
                                mesh.isUndo = true;
                                scanedModel.add(mesh.model);
                                self.state.meshes.splice(mesh.arrayIndex, 0, mesh);
                                self.state.scanCtrlWebSocket.stopGettingImage();
                                self.setState({
                                    showCamera: false,
                                    meshes: self.state.meshes
                                }, () => {
                                    meshAddRemoveStream.onNext([{mesh: mesh, type:'remove'}]);
                                });
                            }
                        },
                        lastAction = self.state.history.pop() || {},
                        undoAction = actionMap[lastAction.type];

                    if ('undefined' !== typeof undoAction && false === this.state.isScanStarted) {
                        undoAction(lastAction);
                    }
                },

                _retry: function(id) {
                    var self = this;

                    switch (id) {
                    case 'scan-retry':
                        self.state.scanCtrlWebSocket.retry();
                        break;
                    case 'calibrate':
                        self._onCalibrate();
                        break;
                    }
                },

                _onYes: function(id) {
                    var self = this;

                    switch (id) {
                    case 'deleting-mesh':
                        self._onDeleteMesh(self.state.deleting_mesh.index, self.state.deleting_mesh.object);
                        break;
                    case 'scan-again':
                        self.setState(self.getInitialState());
                        scanedModel.clear();
                        self.state.scanCtrlWebSocket.stopGettingImage().done(function() {
                           self.state.scanCtrlWebSocket.connection.close(false);
                        });
                        break;
                    }
                },

                _onCancel: function(id) {
                    var self = this;

                    switch (id) {
                    case 'scan-device-busy':
                        history.back();
                        break;
                    case 'deleting-mesh':
                        self._revertDeletingMeshToHistory();
                        break;
                    case 'calibrate':
                        self._refreshCamera();

                        self.setState({
                            isScanStarted: false
                        });

                        break;
                    }
                },

                _onReadingPCD: function(file, isEnd, deferred) {
                    if (true === isEnd) {
                        deferred.resolve();
                    }
                },

                _importPCD: function(e, files) {
                    var self = this,
                        lang = self.state.lang,
                        fileReader,
                        fileName,
                        meshes = self.state.meshes,
                        allowedfiles = [],
                        uploadFiles,
                        convertedfiles = [],
                        file,
                        blob,
                        scanTimes,
                        typedArray,
                        fileReader,
                        model,
                        doImport,
                        checkFiles = function(files) {
                            var allowedfiles = [],
                                checker = /.*[.]pcd$/,
                                file;

                            files.forEach(function(file) {
                                file.isPCD = checker.test(file.name);

                                if (true === file.isPCD) {
                                    allowedfiles.push(file);
                                }
                            });

                            return allowedfiles;
                        },
                        cantUpload = function(files) {
                            return files.some(function(file) {
                                return false === file.isPCD;
                            })
                        },
                        uploadQuota;

                    if ('undefined' === typeof files) {
                        uploadFiles = e.originalEvent.dataTransfer.files;
                    }
                    else {
                        uploadFiles = files;
                    }

                    for (var i = 0; i < uploadFiles.length; i++) {
                        convertedfiles.push(uploadFiles[i] || uploadFiles.item(i));
                    }

                    allowedfiles = checkFiles(convertedfiles);

                    uploadQuota = self.MAX_MESHES - meshes.length - allowedfiles.length;

                    if (true === this.state.gettingStarted && 0 > uploadQuota) {
                        AlertActions.showPopupError('over-quota', lang.scan.over_quota);
                        return;
                    }

                    if (true === this.state.gettingStarted && false === cantUpload(allowedfiles)) {
                        self._openBlocker(true, ProgressConstants.NONSTOP);

                        doImport = function() {
                            file = allowedfiles.pop();
                            fileName = (new Date).getTime();
                            blob = file.blob || new Blob([file]);
                            scanTimes = self.state.scanTimes + 1;

                            self.state.scanModelingWebSocket.import(fileName, 'pcd', blob, blob.size).done(function(pointCloud) {
                                self.state.scanCtrlWebSocket.stopGettingImage();

                                fileReader = new FileReader();

                                fileReader.onload = function() {
                                    typedArray = new Float32Array(this.result);
                                    model = scanedModel.appendModel(typedArray);

                                    meshes.push(self._newMesh({
                                        name: fileName,
                                        model: model,
                                        index: scanTimes
                                    }));

                                    self.setState({
                                        scanTimes: scanTimes,
                                        showCamera: false
                                    }, function() {
                                        if (0 < allowedfiles.length) {
                                            doImport();
                                        }
                                        else {
                                            self._openBlocker(false);
                                        }
                                    });
                                };

                                fileReader.readAsArrayBuffer(pointCloud.total);


                            });
                        };

                        doImport();
                    }
                },

                _refreshCamera: function() {
                    var self = this,
                        ctrlControl = self.state.scanCtrlWebSocket,
                        imageMethods = ctrlControl.getImage();

                    imageMethods.progress(function(response) {
                        if ('ok' === response.status) {
                            imageMethods.getImage();

                            self.setState({
                                cameraImageSrc: response.url
                            });
                        }
                    });

                    self.setState({
                        printerIsReady: true,
                        showCamera: true
                    });

                    self._openBlocker(false);
                },

                _getMesh: function(index) {
                    var meshes = this.state.meshes,
                        findIndex = function(el) {
                            return el.index === index;
                        },
                        existingIndex = meshes.findIndex(findIndex);

                    return meshes[existingIndex];
                },

                _updateMeshInHistory: function(mesh) {
                    var temp = this.state.history.map((h) => {
                        if(h.name === mesh.oldName) {
                            h.oldName = mesh.oldName;
                            h.name = mesh.name;
                            h.associted = mesh.associted;
                        }
                        return h;
                    });
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

                _newMesh: function(args) {
                    args = args || {};

                    return {
                        model: args.model || undefined,
                        transformMethods: {
                            hide: function() {}
                        },
                        name: args.name || '',
                        index: args.index,
                        choose: false,
                        display: true,
                        associted: 0
                    };
                },

                _onRendering: function(views, currentSteps, mesh) {
                    var self = this,
                        scan_speed = self._getScanSpeed(),
                        left_step = (scan_speed - currentSteps),
                        progressRemainingTime,
                        progressPercentage,
                        elapsedTime = ((new Date()).getTime() - self.state.scanStartTime) / 1000,
                        meshes = self.state.meshes,
                        mesh = mesh || self._getMesh(self.state.scanTimes),
                        model,
                        transformMethods;

                    progressRemainingTime = parseInt((elapsedTime / currentSteps), 10) * left_step;

                    progressPercentage = Math.min(
                        round(currentSteps / scan_speed * 100, -2),
                        100
                    );

                    self.setState({
                        currentSteps: currentSteps,
                        progressPercentage: progressPercentage,
                        progressRemainingTime: progressRemainingTime
                    });

                    if ('undefined' === typeof mesh) {
                        model = scanedModel.appendModel(views);
                        var newMesh = self._newMesh({
                            name: 'scan-' + (new Date()).getTime(),
                            model: model,
                            index: self.state.scanTimes
                        });
                        newMesh.arrayIndex = meshes.length;
                        meshes.push(newMesh);

                        self.setState({
                            meshes: meshes,
                            progressPercentage: progressPercentage,
                            progressRemainingTime: progressRemainingTime
                        }, () => {
                            meshAddRemoveStream.onNext([{mesh: newMesh, type: 'add'}]);
                        });
                    }
                    else {
                        mesh.model = scanedModel.updateMesh(mesh.model, views);
                    }
                },

                _onRollback: function(e) {
                    var self = this,
                        meshes = self.state.meshes;

                    meshes.forEach(function(mesh) {
                        mesh.display = true;
                        mesh.choose = false;
                        mesh.model.material.opacity = 0.3;
                    });

                    scanedModel.remove(self.state.stlMesh);

                    self.setState({
                        meshes: meshes,
                        selectedMeshes: [],
                        hasConvert: false,
                        stlBlob: undefined,
                        saveFileType: 'pcd'
                    });
                },

                _onConvert: function(e) {
                    var self = this,
                        fileFormat = 'stl',
                        isStopConvert = false,
                        collectName = '',
                        onClose = function(stlMesh) {
                            self.state.meshes.forEach(function(mesh, e) {
                                mesh.model.material.opacity = 0;
                                mesh.transformMethods.hide();
                            });
                            self._openBlocker(false);
                            self.setState({
                                saveFileType: fileFormat,
                                hasConvert: true,
                                stlMesh: stlMesh,
                                meshes: self._switchMeshes(false, false)
                            });
                            self._switchMeshes(true, false);
                        },
                        startExportSTL = function(outputName) {
                            self.state.scanModelingWebSocket.export_threading(outputName, fileFormat).
                                done(function(response) {
                                    endExportSTL(response.collect_name);
                                });
                        },
                        endExportSTL = function(collectName) {
                            if (false === isStopConvert) {
                                self.state.scanModelingWebSocket.export_collect(collectName).
                                    always(function() {
                                        self._openBlocker(false);
                                    }).
                                    progress(function(response) {
                                        switch (response.status) {
                                        case 'binary':
                                            self.setState({
                                                stlBlob: response.data
                                            });

                                            scanedModel.loadStl(response.data, onClose);
                                            break;
                                        case 'computing':
                                            endExportSTL(collectName);
                                            break;
                                        }
                                    });
                            }
                            else {
                                self._openBlocker(false);
                            }
                        },
                        doStopConverting = function() {
                            isStopConvert = true;
                            self.setState({
                                saveFileType: 'pcd',
                                hasConvert: false
                            });
                            self._switchMeshes(true, false);
                        };

                    self._openBlocker(true, ProgressConstants.WAITING, '', true, '', {
                        onStop: doStopConverting
                    });

                    this._mergeAll(startExportSTL, false);
                },

                _switchMeshes: function(display, choose) {
                    var meshes = this.state.meshes;

                    meshes.forEach(function(mesh) {
                        mesh.display = display;
                        mesh.choose = choose;
                    });

                    return meshes;
                },

                _mergeAll: function(callback, display) {
                    display = ('boolean' === typeof display ? display : false);
                    callback = callback || function() {};

                    var self = this,
                        meshes = self._switchMeshes(display, true);

                    self.setState({
                        meshes: meshes,
                        selectedMeshes: meshes
                    }, function() {
                        // merge each mesh
                        self._doManualMerge(meshes, callback, false);

                        self.setState({
                            selectedMeshes: []
                        });
                    });
                },

                _onSavePCD: function() {
                    var self = this,
                        selectedMeshes = self.state.selectedMeshes,
                        fileName = (new Date()).getTime() + '.pcd';

                    self._doManualMerge(
                        selectedMeshes,
                        function(outputName) {
                            self.state.scanModelingWebSocket.export(
                                outputName,
                                'pcd',
                                {
                                    onFinished: function(blob) {
                                        saveAs(blob, fileName);
                                        self._openBlocker(false);
                                    }
                                }
                            );
                        },
                        false
                    );
                    self._openBlocker(true, ProgressConstants.NONSTOP);
                },

                _onSave: function(e) {
                    var self = this,
                        exportFile = function(outputName) {
                            var fileFormat = self.state.saveFileType,
                                fileName = (new Date()).getTime() + '.' + fileFormat;

                            if (self.state.stlBlob instanceof Blob) {
                                saveAs(self.state.stlBlob, fileName);
                                self._openBlocker(false);
                            }
                            else {
                                self.state.scanModelingWebSocket.export(
                                    outputName,
                                    fileFormat,
                                    {
                                        onFinished: function(blob) {
                                            saveAs(blob, fileName);
                                            self._openBlocker(false);
                                        }
                                    }
                                );
                            }

                            self._switchMeshes(true, false);
                        };

                    self._openBlocker(true, ProgressConstants.NONSTOP);
                    this._mergeAll(exportFile, false);
                },

                _onScanFinished: function(point_cloud) {
                    var self = this,
                        mesh = self._getMesh(self.state.scanTimes),
                        onUploadFinished = function() {
                            // update scan times
                            self.setState({
                                openProgressBar: false,
                                isScanStarted: false,
                                hasMultiScan: false,
                                cameraImageSrc: undefined,
                                progressPercentage: 0,
                                progressRemainingTime: 0,
                                currentSteps: 0
                            }, function() {
                                self._openBlocker(false);
                            });
                        };

                    self.state.scanModelingWebSocket.upload(
                        mesh.name,
                        point_cloud,
                        {
                            onStarting: function() {
                                self._openBlocker(true, ProgressConstants.NONSTOP);
                            },
                            onFinished: onUploadFinished
                        }
                    );
                },

                _handleCheck: function() {
                    return this.state.scanCtrlWebSocket.check();
                },

                _handleScan: function(e) {
                    var self = this,
                        openProgressBar = function(callback) {
                            callback();

                            self.setState({
                                openProgressBar: true
                            });
                        },
                        checkLenOpened = function() {
                            self._openBlocker(true, ProgressConstants.NONSTOP);

                            var onPass = function() {
                                self._openBlocker(false);
                                openProgressBar(onScan);
                            };

                            self._handleCheck().done(function(data) {
                                switch (data.message) {
                                case 'good':
                                case 'no object':
                                case 'no laser':
                                    onPass();
                                    break;
                                case 'not open':
                                default:
                                    self._onCalibrateFail(data.message, AlertActions.showPopupError);
                                    break;
                                }
                            });
                        },
                        pointCloud = new PointCloudHelper(),
                        onScan = function() {
                            var scanResolution = self._getScanSpeed(),
                                scanAction = self.state.scanCtrlWebSocket.scan,
                                $scanDeferred = scanAction(scanResolution, self.state.currentSteps, pointCloud, self._onRendering),
                                opts = {
                                    onError: function(data) {
                                        self.state.scanCtrlWebSocket.takeControl(function(response) {
                                            self._openBlocker(false);
                                        });
                                    },
                                    onReady: function() {
                                        onScan();
                                    }
                                };

                            $scanDeferred.done(function(response) {
                                self._onScanFinished(response.pointCloud);
                            }).fail(function(response) {
                                self.setState({
                                    scanCtrlWebSocket: scanControl(self.state.selectedPrinter.uuid, opts)
                                });

                            });
                        },
                        meshes = self.state.meshes,
                        stage;

                    meshes.forEach(function(mesh) {
                        mesh.choose = false;
                        mesh.transformMethods.hide();
                    });

                    self.setState({
                        progressRemainingTime: self.AVERAGE_STEP_TIME * self._getScanSpeed(),
                        scanStartTime: (new Date()).getTime(),
                        scanTimes: self.state.scanTimes + 1,
                        isScanStarted: true,
                        showCamera: false,
                        stage: stage,
                        currentSteps: 0,
                        progressPercentage: 0
                    });

                    checkLenOpened();
                },

                _onScanAgain: function(e) {
                    var self = this,
                        onYes = function(id) {
                            self.state.scanCtrlWebSocket.stopGettingImage();
                            self.setState(self.getInitialState());
                            scanedModel.clear();
                            AlertStore.removeYesListener(onYes);
                        };

                    AlertStore.onYes(onYes);
                    AlertActions.showPopupYesNo('scan-again', self.state.lang.scan.scan_again_confirm);
                },

                _onScanStop: function(e) {
                    var self = this;

                    self.setState({
                        openProgressBar: false,
                        hasMultiScan: false,
                        isScanStarted: false,
                        showCamera: false,
                        progressPercentage: 100 // total complete,
                    });

                    if ('undefined' !== typeof self.state.scanCtrlWebSocket) {
                        self.state.scanCtrlWebSocket.stopScan();
                    }

                    // on scanning or had point cloud
                    if (true === self.state.isScanStarted && 0 === self.state.meshes.length) {
                        self.setState(self.getInitialState());
                        scanedModel.clear();

                        if ('undefined' !== typeof self.state.scanCtrlWebSocket) {
                            self.state.scanCtrlWebSocket.connection.close(false);
                        }
                    }
                },

                _doClearNoise: function(mesh) {
                    var self = this,
                        delete_noise_name = 'clear-noise-' + (new Date()).getTime(),
                        onStarting = function(data) {
                            self._openBlocker(true, ProgressConstants.NONSTOP);
                        },
                        onDumpFinished = function(data) {
                            mesh.oldName = mesh.name;
                            mesh.name = delete_noise_name;
                            meshUpdateStream.onNext(mesh);
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
                                self._openBlocker(true, ProgressConstants.NONSTOP);
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
                        mesh.oldName = mesh.name;
                        mesh.name = cut_name;
                        meshUpdateStream.onNext(mesh);
                    }

                    self._removeCylinder(mesh);
                },

                _removeCylinder: function(mesh) {
                    scanedModel.cylinder.remove(mesh.model);
                    this.setState({
                        cylinder: undefined
                    });
                },

                _doApplyTransform: function(nextAction) {
                    nextAction = nextAction || function() {};

                    var self = this,
                        selectedMeshes = self.state.selectedMeshes,
                        endIndex = selectedMeshes.length - 1,
                        currentIndex = 0,
                        isEnd = function() {
                            return (endIndex <= currentIndex);
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

                    doingApplyTransform();
                },

                _doManualMerge: function(selectedMeshes, callback, isNewMesh) {
                    isNewMesh = ('boolean' === typeof isNewMesh ? isNewMesh : true);

                    var self = this,
                        meshes = this.state.meshes,
                        selectedMeshes = (true === selectedMeshes instanceof Array ? selectedMeshes : this.state.selectedMeshes),
                        lengthSelectedMeshes = selectedMeshes.length,
                        outputName = '';

                    self._doApplyTransform(function(response) {
                        var onMergeFinished = function(data) {
                                if (false === isEnd()) {
                                    currentIndex++;
                                    doingMerge();
                                }
                                else {
                                    afterMerge(outputName);
                                }
                            },
                            afterMerge = callback || function(outputName) {
                                var mesh,
                                    updatedMeshes = [],
                                    deferred = $.Deferred(),
                                    onUpdate = function(response) {
                                        mesh = self._getMesh(self.state.scanTimes);
                                        mesh.oldName = mesh.name;
                                        mesh.name = outputName;
                                        mesh.associted = lengthSelectedMeshes;
                                        self._updateMeshInHistory(mesh);
                                    };

                                deferred.done(onUpdate);

                                self.state.scanModelingWebSocket.dump(
                                    outputName,
                                    {
                                        onReceiving: function(typedArray, blobs_len) {
                                            self._onRendering(typedArray, blobs_len);
                                            deferred.resolve();
                                        },
                                        onFinished: function(response) {
                                            self.state.selectedMeshes.forEach(function(selectedMesh, i) {
                                                scanedModel.remove(selectedMesh.model);
                                            });

                                            for (var i = self.state.meshes.length - 1; i >= 0; i--) {
                                                if (true === self.state.meshes[i].choose) {
                                                    meshAddRemoveStream.onNext([{mesh: self.state.meshes[i], type: 'remove'}]);
                                                    self.state.meshes.splice(i, 1);
                                                }
                                            }

                                            self.setState({
                                                meshes: self.state.meshes,
                                                selectedMeshes: []
                                            });

                                            self._openBlocker(false);
                                        }
                                    }
                                );
                            },
                            onMergeStarting = function() {
                                self._openBlocker(true, ProgressConstants.NONSTOP);
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
                                else {
                                    afterMerge(baseMesh.name);
                                }

                            },
                            baseName,
                            baseMesh,
                            targetMesh;

                        if (1 < self.state.scanTimes && 1 < meshes.length) {
                            self.setState({
                                // take merge as scan
                                scanTimes: (true === isNewMesh ? self.state.scanTimes + 1 : self.state.scanTimes)
                            }, function() {
                                doingMerge();
                            });
                        }
                        else {
                            afterMerge(selectedMeshes[currentIndex].name);
                        }
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

                _openBlocker: function(is_open, type, message, hasStop, caption, events) {
                    events = events || {};
                    this.setState({
                        openBlocker: is_open
                    });

                    if (true === is_open) {
                        ProgressActions.open(
                            type,
                            caption ? caption : '',
                            message,
                            hasStop,
                            events.onFinished || function() {},
                            events.onOpened || function() {},
                            events.onStop || function() {}
                        );
                    }
                    else {
                        ProgressActions.close();
                    }

                },

                _onScanCancel: function(e) {
                    var self = this,
                        mesh = self._getMesh(self.state.scanTimes);

                    self.state.scanCtrlWebSocket.stopScan();
                    // TODO: restore to the status before scan

                    self.setState({
                        openProgressBar: false,
                        isScanStarted: false
                    });
                },

                _onMultiScan: function(isMultiScan) {
                    var self = this;

                    self.setState({
                        hasMultiScan: isMultiScan,
                        showCamera: isMultiScan
                    });

                    if (true === isMultiScan) {
                        self._refreshCamera();

                        self.state.selectedMeshes.forEach(function(mesh) {
                            self._removeCylinder(mesh);
                        });

                    }
                    else {
                        self.state.scanCtrlWebSocket.stopGettingImage();
                    }
                },

                _onCalibrateFail: function(message, Popup) {
                    var self = this,
                        imageSrc,
                        failMessage = self.state.lang.scan.messages[message] || {
                            caption: '',
                            message: message
                        };

                    switch (message) {
                    case 'not open':
                        imageSrc = '/img/not-open.png';
                        break;
                    case 'no object':
                        imageSrc = '/img/no-object.png';
                        break;
                    case 'no laser':
                        imageSrc = '/img/no-laser.png';
                    default:
                        break;
                    }

                    self._openBlocker(false);
                    Popup(
                        'calibrate',
                        (
                            <div>
                                <img className="calibrate-image" src={imageSrc}/>
                                <p>{failMessage.message}</p>
                            </div>
                        ),
                        failMessage.caption
                    );
                },

                _onCalibrate: function() {
                    var self = this,
                        onPass = function() {
                            var scanCtrlWebSocket = self.state.scanCtrlWebSocket,
                                calibrateDeferred = scanCtrlWebSocket.calibrate(),
                                done = function(data) {
                                    self._refreshCamera();
                                    self._openBlocker(false);
                                    AlertActions.showPopupInfo('calibrat-done', self.state.lang.scan.calibration_done.message, self.state.lang.scan.calibration_done.caption );
                                },
                                fail = function(data) {
                                    self._refreshCamera();
                                    self._openBlocker(false);
                                    self._onCalibrateFail(data.message, AlertActions.showPopupRetry);
                                };

                            calibrateDeferred.done(done).fail(fail);
                        };

                    self._handleCheck().done(function(data) {
                        switch (data.message) {
                        case 'good':
                            onPass();
                            break;
                        case 'no object':
                        case 'not open':
                        case 'no laser':
                        default:
                            self._refreshCamera();
                            self._onCalibrateFail(data.message, AlertActions.showPopupRetry);
                        }
                    });

                    self._openBlocker(true, ProgressConstants.WAITING, '', false, self.state.lang.scan.calibration_is_running);
                },

                _onDeletingMesh: function(mesh, arrayIndex) {
                    var self = this,
                        lang = self.state.lang;

                    self.setState({
                        deleting_mesh: {
                            object: mesh,
                            index: arrayIndex
                        }
                    }, function() {
                        AlertActions.showPopupYesNo('deleting-mesh', lang.scan.delete_mesh, lang.scan.caution);
                    });
                },

                _revertDeletingMeshToHistory: function() {
                    var self = this,
                        mesh = self.state.deleting_mesh.object,
                        newMesh = self._newMesh(mesh);

                    newMesh.type = mesh.type;
                    self.state.history.push(newMesh);
                    self.setState({
                        history: self.state.history
                    });
                },

                _onDeleteMesh: function(index, mesh) {
                    var self = this,
                        meshes = self.state.meshes;

                    scanedModel.remove(mesh.model);
                    meshes.splice(index, 1);

                    self.setState({
                        meshes: meshes,
                        selectedMeshes: (0 === meshes.length ? [] : self.state.selectedMeshes)
                    });

                    if (0 === meshes.length) {
                        self._refreshCamera();
                    }
                },

                _connectToScanControl: function(printer) {
                    var self = this,
                        ctrlOpts = {
                            onError: function(data) {
                                data.info = data.info || '';

                                if (-1 < data.info.toUpperCase().indexOf('ZOMBIE')) {
                                    self.state.scanCtrlWebSocket.takeControl(function(response) {
                                        self._openBlocker(false);
                                    });
                                }
                                else if ('DEVICE_BUSY' === data.error) {
                                    self._openBlocker(false);
                                    AlertActions.showDeviceBusyPopup('scan-device-busy');
                                }
                                else {
                                    self._openBlocker(false);
                                    AlertActions.showPopupRetry('scan-retry', data.error);
                                }
                            },
                            onReady: function() {
                                self._refreshCamera();
                            }
                        };

                    self.setState({
                        scanCtrlWebSocket: scanControl(printer.uuid, ctrlOpts)
                    });
                },

                // render sections
                _renderSettingPanel: function() {
                    var self = this,
                        start_scan_text,
                        lang = args.state.lang,
                        className = {
                            'hide': 0 < self.state.scanTimes && false === self.state.showCamera
                        };

                    return (
                        <SetupPanel className={className} ref="setupPanel" lang={lang} onCalibrate={this._onCalibrate}/>
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
                        0 < state.selectedMeshes.length &&
                        false === state.isScanStarted &&
                        false === state.openBlocker &&
                        false === state.showCamera ?
                        <ManipulationPanel
                            lang={lang}
                            selectedMeshes={state.selectedMeshes}
                            switchTransformMode={this._switchTransformMode}
                            onCropOn={this._doCropOn}
                            onCropOff={this._doCropOff}
                            onClearNoise={this._doClearNoise}
                            onSavePCD={this._onSavePCD}
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
                        },
                        cameraImage = (self.state.cameraImageSrc || '/img/menu/main_logo.svg');

                    camera_image_class = cx({
                        'camera-image' : true === this.state.showCamera,
                        'hide' : false === this.state.showCamera
                    });

                    return (
                        <section ref="operatingSection" className="operating-section">
                            {meshThumbnails}
                            <div id="model-displayer" className="model-displayer">
                                <img src={cameraImage} className={camera_image_class} onClick={closeSubPopup}/>
                            </div>
                            {settingPanel}
                            {manipulationPanel}
                        </section>
                    );
                },

                _renderActionButtons: function(lang) {
                    var className = {
                            'hide': this.state.isScanStarted,
                            'action-buttons': true,
                            'beehive-buttons': true
                        },
                        mode = (0 < this.state.meshes.length ? 'SCANNED' : 'NOT_SCAN');

                    if (true === this.state.hasConvert) {
                        mode = 'CONVERTED';
                    }

                    if (true === this.state.hasMultiScan) {
                        mode = 'MULTI_SCAN';
                    }

                    return (
                        true === this.state.gettingStarted && true === this.state.printerIsReady ?
                        <ActionButtons
                            mode={mode}
                            className={className}
                            lang={lang}
                            disabledScan={this.state.meshes.length === this.MAX_MESHES}
                            hasConvert={this.state.hasConvert}
                            onScanClick={this._handleScan}
                            onRollbackClick={this._onRollback}
                            onConvertClick={this._onConvert}
                            onSaveClick={this._onSave}
                            onScanAgainClick={this._onScanAgain}
                            onMultiScanClick={this._onMultiScan.bind(null, true)}
                            onCancelMultiScanClick={this._onMultiScan.bind(null, false)}
                        /> :
                        ''
                    );
                },

                _renderProgressBar: function(lang) {
                    return (
                        true === this.state.openProgressBar ?
                        <ProgressBar
                            lang={lang}
                            percentage={this.state.progressPercentage}
                            remainingTime={this.state.progressRemainingTime}
                            currentSteps={this.state.currentSteps}
                            onStop={this._onScanStop}
                        /> :
                        ''
                    );
                },

                _renderPrinterSelectorWindow: function(lang) {
                    var self = this,
                        ModelingOpts = {
                            onError: function(data) {
                                self._openBlocker(false);
                                AlertActions.showPopupError('scan-modeling-error', data.error);
                            },
                            onFatal: function(data) {
                                self._openBlocker(false);
                                AlertActions.showPopupError('scan-fatal-error', data.error);
                            }
                        },
                        onGettingPrinter = function(auth_printer) {
                            self._connectToScanControl(auth_printer);
                            self.setState({
                                gettingStarted: true,
                                selectedPrinter: auth_printer,
                                scanModelingWebSocket: scanModeling(ModelingOpts)
                            });

                            menuFactory.items.import.enabled = true;
                            self._openBlocker(true, ProgressConstants.NONSTOP);
                        },
                        noDeviceAvailable = function() {
                            history.go(-1);
                        },
                        content = (
                            <PrinterSelector
                                uniqleId="scan"
                                className="scan-printer-selection"
                                lang={lang}
                                onClose={noDeviceAvailable}
                                onGettingPrinter={onGettingPrinter}
                            />
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

                                meshes.forEach(function(mesh, key) {
                                    self._removeCylinder(mesh);

                                    if (false === e.shiftKey) {
                                        if (key !== i) {
                                            mesh.transformMethods.hide();
                                            mesh.choose = false;
                                            mesh.model.material.opacity = 0.3;
                                        }
                                    }
                                    else {
                                        mesh.transformMethods.hide();
                                    }
                                });

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
                            };

                        itemClass = {
                            'mesh-thumbnail-item': true,
                            'choose': mesh.choose,
                            'hide': !mesh.display || true === self.state.isScanStarted || true === self.state.showCamera
                        };

                        return {
                            label: (
                                <div className={cx(itemClass)}>
                                    <div className="mesh-thumbnail-no" data-index={mesh.index} onClick={onChooseMesh}>{mesh.index}</div>
                                    <div className="mesh-thumbnail-close fa fa-times" onClick={self._onDeletingMesh.bind(self, mesh, i)}></div>
                                </div>
                            )
                        }
                    });

                    return (
                        0 < meshes.length && false === self.state.hasConvert ?
                        <List className="mesh-thumbnail" items={thumbnails}/> :
                        ''
                    );
                },

                render: function() {
                    var state = this.state,
                        lang = state.lang,
                        progressBar = this._renderProgressBar(lang),
                        cx = React.addons.classSet,
                        actionButtons = this._renderActionButtons(lang),
                        scanStage = this._renderStageSection(lang),
                        selectPrinter = this._renderPrinterSelectorWindow(lang);

                    return (
                        <div className="studio-container scan-studio">
                            <FileUploader
                                ref="fileUploader"
                                className={{ hide: true }}
                                onReadingFile={this._onReadingPCD}
                                onReadEnd={this._importPCD}
                            />
                            {selectPrinter}
                            {scanStage}
                            {actionButtons}
                            {progressBar}
                            {alert}
                        </div>
                    );
                }

            });

        return View;
    };
});
