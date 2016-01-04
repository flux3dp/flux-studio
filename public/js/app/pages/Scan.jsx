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
    'jsx!widgets/File-Uploader',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'helpers/shortcuts',
    'helpers/round',
    'helpers/dnd-handler',
    'helpers/nwjs/menu-factory',
    'helpers/observe',
    // non-return
    'helpers/array-findindex',
    'helpers/object-assign',
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
    FileUploader,
    AlertActions,
    AlertStore,
    ProgressActions,
    ProgressConstants,
    shortcuts,
    round,
    dndHandler,
    menuFactory,
    observe
) {
    'use strict';

    return function(args) {
        args = args || {};

        var View = React.createClass({
                progressRemainingTime: 1200, // 20 minutes
                MAX_MESHES: 5,

                getInitialState: function() {
                    return {
                        lang: args.state.lang,
                        gettingStarted: false,  // selecting machine
                        scanTimes: 0,   // how many scan executed
                        selectedPrinter: undefined, // which machine selected
                        deleting_mesh: undefined,
                        history: [],
                        openAlert: false,
                        openProgressBar: false,
                        blocker: false,
                        hasConvert: false,  // point cloud into stl
                        hasMultiScan: false,    // ready to multi scan
                        progressPercentage: 0,
                        progressRemainingTime: this.progressRemainingTime,    // 20 minutes
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
                        stage: undefined // three stage (scene, camera, renderer)
                    };
                },

                componentDidMount: function() {
                    var self = this,
                        object,
                        objectObserve = function(mesh, arrayIndex) {
                            var disableLogging = ['transformMethods', 'choose', 'display'],
                                pushToHistory = function(mesh, arrayIndex) {
                                    mesh.type = 'update';
                                    mesh.arrayIndex = arrayIndex;
                                    self.state.history.push(mesh);
                                    self.setState({
                                        history: self.state.history
                                    });
                                };

                            (function(arrayIndex) {
                                Object.observe(mesh, function(changes) {
                                    for (var i in changes) {
                                        if (true === changes.hasOwnProperty(i) &&
                                            'name' === changes[i].name
                                        ) {
                                            object = Object.assign({}, changes[i].object);
                                            object.oldBlob = self.state.scanModelingWebSocket.History.findByName(changes[i].oldValue)[0].data;
                                            pushToHistory(object, arrayIndex);
                                        }
                                    }
                                });
                            })(arrayIndex);
                        },
                        objectGroupObserve = function(meshes, arrayIndex) {
                            meshes.forEach(function(mesh, i) {
                                objectObserve(mesh, arrayIndex);
                            });
                        };

                    Array.observe(this.state.meshes, function(changes) {
                        changes.forEach(function(change, i) {
                            // add new entry
                            if (0 < change.addedCount) {
                                object = Object.assign({}, change.object[change.index]);
                                object.type = 'add';
                                object.arrayIndex = change.index;
                                self.state.history.push(object);
                                self.setState({
                                    history: self.state.history
                                });
                                objectGroupObserve(change.object, change.index);
                            }
                            // remove an entry
                            else if (0 < change.removed.length) {
                                change.removed.forEach(function(object) {
                                    if (true !== object.forceDelete) {
                                        object = Object.assign({}, object);
                                        object.type = 'remove';
                                        object.arrayIndex = change.index;
                                        self.state.history.push(object);
                                    }
                                });

                                self.setState({
                                    history: self.state.history
                                });
                            }
                        });
                    });

                    shortcuts.on(['ctrl', 'z'], function(e) {
                        self._undo();
                    });

                    AlertStore.onRetry(self._retry);
                    AlertStore.onYes(self._onYes);
                    AlertStore.onCancel(self._onCancel);
                    dndHandler.plug(document, self._importPCD);

                    self.setState({
                        stage: scanedModel.init()
                    });

                    menuFactory.items.import.enabled = false;
                    menuFactory.items.import.onClick = function() {
                        self.refs.fileUploader.getDOMNode().click();
                    };
                },

                componentWillUnmount: function() {
                    var self = this;

                    AlertStore.removeRetryListener(self._retry);
                    AlertStore.removeYesListener(self._onYes);
                    AlertStore.removeCancelListener(self._onCancel);
                    dndHandler.unplug(document);

                    if ('undefined' !== typeof self.state.scanCtrlWebSocket &&
                        'undefined' !== typeof self.state.scanModelingWebSocket
                    ) {
                        if ('undefined' !== typeof self.state.scanControlImageMethods) {
                            self.state.scanControlImageMethods.stop(function() {
                               self.state.scanCtrlWebSocket.connection.close(false);
                            });
                        }
                        self.state.scanModelingWebSocket.connection.close(false);
                    }

                    scanedModel.destroy();
                },

                // ui events
                _undo: function() {
                    var self = this,
                        currentMesh,
                        actionMap = {
                            add: function(mesh) {
                                // delete
                                currentMesh = self._getMesh(mesh.index);
                                currentMesh.forceDelete = true;
                                self._onDeleteMesh(mesh.arrayIndex, mesh);
                            },
                            update: function(mesh) {
                                var fileReader = new FileReader(),
                                    typedArray;

                                currentMesh = self._getMesh(mesh.index);

                                fileReader.onload = function() {
                                    typedArray = new Float32Array(this.result);
                                    currentMesh.model = scanedModel.updateMesh(currentMesh.model, typedArray);
                                };

                                fileReader.readAsArrayBuffer(mesh.oldBlob);
                            },
                            remove: function(mesh) {
                                // add
                                scanedModel.add(mesh.model);
                                self.state.meshes.push(mesh);
                                self.state.scanControlImageMethods.stop();

                                self.setState({
                                    showCamera: false,
                                    meshes: self.state.meshes
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
                    }
                },

                _onCancel: function(id) {
                    var self = this;

                    switch (id) {
                    case 'scan-device-busy':
                        history.back();
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

                            for (var i = 0; i < files.length; i++) {
                                file = files.item(i);

                                file.isPCD = checker.test(file.name);

                                if (true === file.isPCD) {
                                    allowedfiles.push(file);
                                }
                            }

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

                    allowedfiles = checkFiles(uploadFiles);

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
                            blob = new Blob([file]);
                            scanTimes = self.state.scanTimes + 1;

                            self.state.scanModelingWebSocket.import(fileName, 'pcd', blob, blob.size).done(function(pointCloud) {
                                self.state.scanControlImageMethods.stop();

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
                    var self = this;

                    self.setState({
                        scanControlImageMethods: self.state.scanCtrlWebSocket.getImage(
                            function(image_blobs, mime_type) {
                                var blob = new Blob(image_blobs, {type: mime_type}),
                                    url = (window.URL || window.webkitURL),
                                    objectUrl = url.createObjectURL(blob),
                                    img;

                                if (false === self.state.showCamera) {
                                    self.setState({
                                        showCamera: true
                                    });
                                }

                                if (true === self.isMounted()) {
                                    img = self.refs.camera_image.getDOMNode();

                                    img.onload = function() {
                                        // release the object URL once the image has loaded
                                        url.revokeObjectURL(objectUrl);
                                        blob = null;
                                    };

                                    // trigger the image to load
                                    img.src = objectUrl;
                                }
                            }
                        )
                    }, function() {
                        self.setState({
                            printerIsReady: true
                        });

                        self._openBlocker(false);
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
                        display: true
                    };
                },

                _onRendering: function(views, chunk_length, mesh) {
                    var self = this,
                        scan_speed = self._getScanSpeed(),
                        progressRemainingTime = self.progressRemainingTime / scan_speed * (scan_speed - chunk_length),
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

                        meshes.push(self._newMesh({
                            name: 'scan-' + (new Date()).getTime(),
                            model: model,
                            index: self.state.scanTimes
                        }));

                        self.setState({
                            meshes: meshes,
                            progressPercentage: progressPercentage,
                            progressRemainingTime: progressRemainingTime,
                            progressElapsedTime: progressElapsedTime
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
                        exportSTL = function(outputName) {
                            self.state.scanModelingWebSocket.export(
                                outputName,
                                fileFormat,
                                {
                                    onFinished: function(blob) {
                                        self.setState({
                                            stlBlob: blob
                                        });

                                        scanedModel.loadStl(blob, onClose);

                                        self._openBlocker(false);
                                    }
                                }
                            );
                        };

                    self._openBlocker(true, ProgressConstants.NONSTOP);

                    this._mergeAll(exportSTL, false);
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
                        this._doManualMerge(meshes, callback, false);

                        self.setState({
                            selectedMeshes: []
                        });
                    });
                },

                _onSavePCD: function(mesh) {
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
                                hasMultiScan: false
                            });
                        };

                    self.state.scanModelingWebSocket.upload(
                        mesh.name,
                        point_cloud,
                        {
                            onFinished: onUploadFinished
                        }
                    );

                },

                _handleCheck: function(callback) {
                    callback = callback || function() {};

                    this.state.scanCtrlWebSocket.check().done(callback);
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
                            var onPass = function() {
                                self._openBlocker(false);
                                openProgressBar(onScan);
                            };

                            self._handleCheck(function(data) {
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
                        onScan = function() {
                            var opts = {
                                    onRendering: self._onRendering,
                                    onFinished: self._onScanFinished
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
                    var self = this;

                    AlertStore.onYes(function(id) {
                        self.setState(self.getInitialState());
                        scanedModel.clear();
                        self.state.scanControlImageMethods.stop(function() {
                           self.state.scanCtrlWebSocket.connection.close(false);
                        });
                    });
                    AlertActions.showPopupYesNo('scan-again', self.state.lang.scan.scan_again_confirm);
                },

                _onScanStop: function(e) {
                    this.setState({
                        openProgressBar: false,
                        hasMultiScan: false,
                        isScanStarted: false,
                        progressPercentage: 100 // total complete
                    });

                    this.state.scanMethods.stop(this._onScanFinished);
                },

                _doClearNoise: function(mesh) {
                    var self = this,
                        delete_noise_name = 'clear-noise-' + (new Date()).getTime(),
                        onStarting = function(data) {
                            self._openBlocker(true, ProgressConstants.NONSTOP);
                        },
                        onDumpFinished = function(data) {
                            mesh.name = delete_noise_name;
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
                        outputName = '';

                    this._doApplyTransform(function(response) {
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
                                        mesh.name = outputName;
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

                _openBlocker: function(is_open, type, message, hasStop, caption) {

                    if (true === is_open) {
                        ProgressActions.open(type, caption ? caption : '', message, hasStop);
                    }
                    else {
                        ProgressActions.close();
                    }

                    this.setState({
                        blocker: is_open
                    });
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

                _onMultiScan: function(isMultiScan) {
                    this.setState({
                        hasMultiScan: isMultiScan,
                        showCamera: isMultiScan
                    });

                    if (true === isMultiScan) {
                        this._refreshCamera();
                    }
                    else {
                        this.state.scanControlImageMethods.stop();
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

                    self._handleCheck(function(data) {
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
                            false === state.blocker &&
                            false === state.isScanStarted &&
                            false === state.showCamera ?
                        <ManipulationPanel
                            lang = {lang}
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
                        };

                    camera_image_class = cx({
                        'camera-image' : true,
                        'hide' : false === this.state.showCamera
                    });

                    return (
                        <section ref="operatingSection" className="operating-section">
                            {meshThumbnails}
                            <div id="model-displayer" className="model-displayer">
                                <img ref="camera_image" src="" className={camera_image_class} onClick={closeSubPopup}/>
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
                            elapsedTime={this.state.progressElapsedTime}
                            onStop={this._onScanStop}
                        /> :
                        ''
                    );
                },

                _renderPrinterSelectorWindow: function(lang) {
                    var self = this,
                        ctrlOpts = {
                            onError: function(data) {
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
                        },
                        ModelingOpts = {
                            onError: function(data) {
                                self._openBlocker(false);
                                AlertActions.showPopupError('scan-modeling-error', data.error);
                            }
                        },
                        onGettingPrinter = function(auth_printer) {
                            self.setState({
                                gettingStarted: true,
                                selectedPrinter: auth_printer,
                                scanCtrlWebSocket: scanControl(auth_printer.uuid, ctrlOpts),
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
                            dataAttrs: {
                                'ga-event': 'confirm'
                            },
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

                                self.setState({
                                    deleting_mesh: {
                                        object: mesh,
                                        index: i
                                    }
                                }, function() {
                                    AlertActions.showPopupYesNo('deleting-mesh', lang.scan.delete_mesh, lang.scan.caution);
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

                render: function() {
                    var state = this.state,
                        lang = state.lang,
                        progressBar = this._renderProgressBar(lang),
                        alert = this._renderAlert(lang),
                        cx = React.addons.classSet,
                        actionButtons = this._renderActionButtons(lang),
                        scanStage = this._renderStageSection(lang),
                        selectPrinter = this._renderPrinterSelectorWindow(lang);

                    return (
                        <div className="studio-container scan-studio">
                            <FileUploader
                                ref="fileUploader"
                                className={{ hide: true }}
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