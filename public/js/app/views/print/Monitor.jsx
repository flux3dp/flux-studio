define([
    'jquery',
    'react',
    'plugins/classnames/index',
    'helpers/device-master',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/constants/device-constants',
    'app/actions/global-actions',
    'app/constants/global-constants',
    'helpers/sprintf',
    'helpers/shortcuts',
    'Redux',
    'app/reducer/index',
    'jsx!app/views/print/Monitor-Header',
    'jsx!app/views/print/Monitor-Display',
    'jsx!app/views/print/Monitor-Control',
    'jsx!app/views/print/Monitor-Info',
    'app/action-creators/monitor',
    'app/action-creators/device'
], function(
    $,
    React,
    ClassNames,
    DeviceMaster,
    AlertActions,
    AlertStore,
    DeviceConstants,
    GlobalActions,
    GlobalConstants,
    sprintf,
    shortcuts,
    Redux,
    MainReducer,
    MonitorHeader,
    MonitorDisplay,
    MonitorControl,
    MonitorInfo,
    MonitorActionCreator,
    DeviceActionCreator
) {
    'use strict';

    let _id = 'MONITOR',
        start,
        scrollSize = 1,
        _history = [],
        status,
        usbExist = false,
        showingPopup = false,
        messageViewed = false,
        operationStatus,
        previewUrl = '',
        lang,
        lastAction,
        fileToBeUpload = {},
        openedFrom,

        // error display
        errorMessage = '',

        currentDirectoryContent,
        socketStatus = {},

        timmer,

        statusId = 0,

        refreshTime = 3000;

    let mode = {
        PRINT       : 'PRINT',
        PREVIEW     : 'PREVIEW',
        FILE        : 'FILE',
        CAMERA      : 'CAMERA'
    };

    let type = {
        FILE: 'FILE',
        FOLDER: 'FOLDER'
    };

    let source = {
        DEVICE_LIST : 'DEVICE_LIST',
        GO          : 'GO'
    };

    let store,
        leftButtonOn = true,
        middleButtonOn = true,
        rightButtonOn = true;

    operationStatus = [
        DeviceConstants.RUNNING,
        DeviceConstants.PAUSED,
        DeviceConstants.RESUMING,
        DeviceConstants.ABORTED,
    ];

    return React.createClass({

        propTypes: {
            lang                : React.PropTypes.object,
            selectedDevice      : React.PropTypes.object,
            fCode               : React.PropTypes.object,
            slicingStatus       : React.PropTypes.object,
            previewUrl          : React.PropTypes.string,
            opener              : React.PropTypes.string,
            onClose             : React.PropTypes.func
        },

        componentWillMount: function() {
            lang        = this.props.lang;
            previewUrl  = this.props.previewUrl;
            statusId    = DeviceConstants.status.IDLE;

            socketStatus.ready = true;
            socketStatus.cancel = false;

            let _mode = mode.PREVIEW;
            openedFrom = this.props.opener || GlobalConstants.DEVICE_LIST;
            if(openedFrom === GlobalConstants.DEVICE_LIST) {
                let { st_id } = this.props.selectedDevice;
                if(st_id === DeviceConstants.status.IDLE) {
                    _mode = mode.FILE;
                }
                else {
                    _mode = mode.PRINT;
                }
            }

            store = Redux.createStore(MainReducer);
            store.dispatch(MonitorActionCreator.changeMode(_mode));

            this._preFetchInfo();
        },

        componentDidMount: function() {
            AlertStore.onRetry(this._handleRetry);
            AlertStore.onCancel(this._handleCancel);
            AlertStore.onYes(this._handleYes);

            // listening to key
            this.unsubscribeDeleteKey = shortcuts.on(['DEL'], (e) => {
                e.preventDefault();
                if(store.getState().Monitor.selectedItem) {
                    AlertActions.showPopupYesNo('DELETE_FILE', lang.monitor.confirmFileDelete);
                }
            });

            this._startReport();
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            return false;
        },

        componentWillUnmount: function() {
            AlertStore.removeRetryListener(this._handleRetry);
            AlertStore.removeCancelListener(this._handleCancel);
            AlertStore.removeYesListener(this._handleYes);

            let { Monitor } = store.getState();
            if(Monitor.mode === GlobalConstants.CAMERA) {
                this._stopCamera();
            }
            _history = [];
            messageViewed = false;

            DeviceMaster.stopStreamCamera();
            GlobalActions.monitorClosed();

            clearInterval(this.reporter);
            this.unsubscribeDeleteKey();
        },

        childContextTypes: {
            store: React.PropTypes.object,
            slicingResult: React.PropTypes.object,
            lang: React.PropTypes.object
        },

        getChildContext: function() {
            return {
                store: store,
                slicingResult: this.props.slicingStatus,
                lang: this.props.lang
            };
        },

        _preFetchInfo: function() {
            let { Monitor } = store.getState();

            const go = (result) => {
                if(!result.done) {
                    result.value.then(() => {
                        go(s.next());
                    });
                }
            };

            const starter = function*() {
                yield this._checkUSBFolderExistance();
                yield this._getInitialStatus();
                if(openedFrom === GlobalConstants.DEVICE_LIST) {
                    if (Monitor.mode === mode.FILE) {
                        yield this._dispatchFolderContent('');
                    }
                    else {
                        yield this._getPreviewInfo();
                    }
                }
            }.bind(this);

            let s = starter();
            go(s.next());
        },

        _getPreviewInfo: function() {
            let d = $.Deferred();
            DeviceMaster.getPreviewInfo().then((info) => {
                store.dispatch(DeviceActionCreator.updateJobInfo(info));
                d.resolve();
            });
            return d.promise();
        },

        _getInitialStatus: function() {
            let d = $.Deferred();
            DeviceMaster.getReport().then((result) => {
                store.dispatch(DeviceActionCreator.updateDeviceStatus(result));
                d.resolve();
            });
            return d.promise();
        },

        _hasFCode: function() {
            return this.props.fCode instanceof Blob;
        },

        _stopCamera: function() {
            DeviceMaster.stopStreamCamera();
        },

        _refreshDirectory: function() {
            this._retrieveFolderContent(store.getState().Monitor.currentPath);
        },

        _existFileInDirectory: function(path, fileName) {
            let d = $.Deferred();
            fileName = fileName.replace('.gcode', '.fc');
            DeviceMaster.fileInfo(path, fileName).then(() => {
                d.resolve(true);
            }).fail(() => {
                d.resolve(false);
            });
            return d.promise();
        },

        _doFileUpload: function(file) {
            let reader = new FileReader();

            store.dispatch(MonitorActionCreator.setUploadProgress(0));
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                let fileInfo = file.name.split('.'),
                    ext = fileInfo[fileInfo.length - 1],
                    type,
                    isValid = false;

                if(ext === 'fc') {
                    type = {type: 'application/fcode'};
                    isValid = true;
                }
                else if (ext === 'gcode') {
                    type = {type: 'text/gcode'};
                    isValid = true;
                }

                if(isValid) {
                    let { Monitor } = store.getState();
                    let blob = new Blob([reader.result], type);

                    DeviceMaster.uploadToDirectory(blob, Monitor.currentPath, file.name).then(() => {
                        store.dispatch(MonitorActionCreator.setUploadProgress(''));
                        this._refreshDirectory();
                    }).progress((progress) => {
                        let p = parseInt(progress.step / progress.total * 100);
                        store.dispatch(MonitorActionCreator.setUploadProgress(p));
                    }).fail((error) => {
                        // TODO: show upload error
                    });
                }
                else {
                    AlertActions.showPopupInfo('', lang.monitor.extensionNotSupported);
                }
            };
        },

        _clearSelectedItem: function() {
            store.dispatch(MonitorActionCreator.selectItem({ name: '', type: '' }));
        },

        _handleClose: function() {
            this.props.onClose();
        },

        _handleRetry: function(id) {
            if(id === _id) {
                let { Device } = store.getState();
                if(Device.status.st_id === DeviceConstants.status.ABORTED) {
                    DeviceMaster.quit().then(() => {
                        this._handleGo();
                    });
                }
                else if(this._isPaused()) {
                    DeviceMaster.resume();
                    messageViewed = false;
                    showingPopup = false;

                    let resumeStatus = { st_label: 'RESUMING', st_id: 6 };
                    store.dispatch(DeviceActionCreator.updateDeviceStatus(resumeStatus));
                }
            }
        },

        _handleCancel: function() {
            messageViewed = true;
            showingPopup = false;
        },

        _handleYes: function(id) {
            if(id === DeviceConstants.KICK) {
                DeviceMaster.kick();
            }
            else if(id === 'UPLOAD_FILE') {
                let info    = fileToBeUpload.name.split('.'),
                    ext     = info[info.length - 1];

                if(ext === 'gcode') {
                    setTimeout(function() {
                        AlertActions.showPopupYesNo('CONFIRM_G_TO_F', lang.monitor.confirmGToF);
                    }, 1000);
                }
                else {
                    this._doFileUpload(fileToBeUpload);
                }
            }
            else if(id === 'CONFIRM_G_TO_F') {
                this._doFileUpload(fileToBeUpload);
            }
            else if(id === 'DELETE_FILE') {
                let { Monitor } = store.getState();
                this._handleDeleteFile(Monitor.currentPath, Monitor.selectedItem.name);
            }
        },

        _handleBrowseFolder: function() {
            this._addHistory();
            this._dispatchFolderContent('');
        },

        _dispatchFolderContent: function(path) {
            let d = $.Deferred();
            this._stopCamera();

            this._retrieveFolderContent(path).then((content) => {
                store.dispatch(MonitorActionCreator.changePath(path, content));
                return d.resolve();
            });
            return d.promise();
        },

        _handleFolderclick: function(folderName) {
            store.dispatch(MonitorActionCreator.selectItem({
                name: folderName,
                type: type.FOLDER
            }));
        },

        _handleFolderDoubleClick: function(folderName) {
            this._addHistory();
            this._dispatchFolderContent(store.getState().Monitor.currentPath + '/' + folderName);
        },

        _handleDeleteFile: function(pathToFile, fileName) {
            DeviceMaster.deleteFile(pathToFile, fileName).then(() => { this._refreshDirectory(); });
        },

        _handleBack: function() {
            if(_history.length === 0) { return; }
            lastAction = _history.pop();

            let { Monitor } = store.getState();

            if(Monitor.mode === mode.CAMERA) {
                this._stopCamera();
            }

            this._clearSelectedItem();

            let actions = {

                'PREVIEW' : () => {},
                'FILE': () => { this._dispatchFolderContent(lastAction.path); },
                'CAMERA': () => {}
            };

            if(actions[lastAction.mode]) {
                actions[lastAction.mode]();
                store.dispatch(MonitorActionCreator.changeMode(lastAction.mode));
            }
        },

        _handleFileClick: function(fileName, action, e) {
            e.stopPropagation();
            if(action === DeviceConstants.SELECT) {
                store.dispatch(MonitorActionCreator.selectItem({
                    name: fileName,
                    type: type.FILE
                }));
            }
            else {
                this._addHistory();
                let { Monitor } = store.getState();
                start = 0;
                currentDirectoryContent.files.length = 0; // clear folder content

                DeviceMaster.fileInfo(Monitor.currentPath, fileName).then((info) => {
                    if(info[1] instanceof Blob) {
                        previewUrl = info[1].size === 0 ? '/img/ph_l.png' : URL.createObjectURL(info[1]);
                    }
                    else {
                        previewUrl = '/img/ph_l.png';
                    }
                    if(info[2]) {
                        this._generatePreview([info[2]]);
                    }
                    store.dispatch(MonitorActionCreator.previewFile(info));
                    this.forceUpdate();
                });
            }
        },

        _handleUpload: function(e) {
            if(e.target.files.length > 0) {
                fileToBeUpload = e.target.files[0];
                this._existFileInDirectory(store.getState().Monitor.currentPath, fileToBeUpload.name.replace(/ /g, '_')).then((exist) => {
                    if(exist) {
                        AlertActions.showPopupYesNo('UPLOAD_FILE', lang.monitor.fileExistContinue);
                    }
                    else {
                        let info = fileToBeUpload.name.split('.'),
                            ext  = info[info.length - 1];

                        if(ext === 'gcode') {
                            AlertActions.showPopupYesNo('CONFIRM_G_TO_F', lang.monitor.confirmGToF);
                        }
                        else {
                            this._doFileUpload(fileToBeUpload);
                        }
                    }
                });
                e.target.value = null;
            }
        },

        _handleDownload: function() {
            const downloadProgressDisplay = (p) => {
                store.dispatch(MonitorActionCreator.setDownloadProgress(p));
            };
            let { Monitor } = store.getState();

            DeviceMaster.downloadFile(Monitor.currentPath, Monitor.selectedItem.name).then((file) => {
                store.dispatch(MonitorActionCreator.setDownloadProgress({size:'', left:''}));
                saveAs(file[1], Monitor.selectedItem.name);
            }).progress((p) => {
                downloadProgressDisplay(p);
            }).fail((error) => {
                // TODO: show download error
            });
        },

        _handleToggleCamera: function() {
            let { Monitor } = store.getState();
            if(Monitor.mode === mode.CAMERA) {
                this._handleBack();
            }
            else {
                this._addHistory();
                store.dispatch(MonitorActionCreator.changeMode(GlobalConstants.CAMERA));
            }
        },

        _handleGo: function() {
            messageViewed = false;
            let { Monitor, Device } = store.getState();
            let startingStatus = { st_label: 'INIT', st_id: 1 };

            store.dispatch(MonitorActionCreator.changeMode(GlobalConstants.PRINT));
            store.dispatch(DeviceActionCreator.updateDeviceStatus(startingStatus));

            if(Device.status.st_label === DeviceConstants.IDLE) {
                let { fCode } = this.props;
                store.dispatch(MonitorActionCreator.changeMode(GlobalConstants.PRINT));

                if(fCode) {
                    DeviceMaster.go(fCode).then(() => {
                        store.dispatch(MonitorActionCreator.setUploadProgress(''));
                    }).progress((progress) => {
                        let p = parseInt(progress.step / progress.total * 100);
                        store.dispatch(MonitorActionCreator.setUploadProgress(p));
                    });
                }
                else {
                    let executeGo = () => {
                        DeviceMaster.goFromFile(Monitor.currentPath, Monitor.selectedItem.name);
                    };

                    if(this._isAbortedOrCompleted()) {
                        DeviceMaster.quit().then(() => {
                            executeGo();
                        });
                    }
                    else {
                        executeGo();
                    }
                }
            }
            else if(this._isAbortedOrCompleted() && Monitor.mode === GlobalConstants.FILE_PREVIEW) {
                // TODO: this to be changed when alert action is restructured
                if(confirm(lang.monitor.forceStop)) {
                    DeviceMaster.quit().then(() => {
                        DeviceMaster.goFromFile(Monitor.currentPath, Monitor.selectedItem.name);
                    });
                }
            }
            else {
                DeviceMaster.resume();
            }
        },

        _handlePause: function() {
            DeviceMaster.pause();
        },

        _handleStop: function() {
            if(statusId < 0) {
                AlertActions.showPopupYesNo('KICK', lang.monitor.forceStop);
            }
            else {
                let { Monitor, Device } = store.getState();
                if(this._isAbortedOrCompleted()) {
                    DeviceMaster.quit();
                    store.dispatch(MonitorActionCreator.showWait());
                }
                else {
                    let p = Device.status.st_id < 0 ? DeviceMaster.kick() : DeviceMaster.stop();
                    p.always(() => {
                        let mode = Monitor.selectedFileInfo.length > 0 ? GlobalConstants.FILE_PREVIEW : GlobalConstants.PREVIEW;
                        if(Device.status.st_id < 0) {
                            mode = GlobalConstants.FILE;
                            this._dispatchFolderContent('');
                        }
                        store.dispatch(MonitorActionCreator.changeMode(mode));
                    });
                }
            }
        },

        _addHistory: function() {
            let { Monitor } = store.getState();
            _history.push({ mode: Monitor.mode, previewUrl: previewUrl, path: Monitor.currentPath });
        },

        _startReport: function() {
            this.reporter = setInterval(() => {
                DeviceMaster.getReport().fail((error) => {
                    this._processReport(error);
                }).then((result) => {
                    store.dispatch(DeviceActionCreator.updateDeviceStatus(result));
                    this._processReport(result);
                });
            }, refreshTime);
        },

        _generatePreview: function(info) {
            if(info === '') { return; }
            info = info || [];

            if(!this._hasFCode()) {
                let blobIndex = info.findIndex(o => o instanceof Blob);
                if(blobIndex > 0) {
                    previewUrl = window.URL.createObjectURL(info[blobIndex]);
                }
            }

            this.forceUpdate();
        },

        _processReport: function(report) {
            if(!report.error) {
                if(this._isAbortedOrCompleted() && openedFrom !== GlobalConstants.DEVICE_LIST) {
                    DeviceMaster.quit();
                }
                if(showingPopup) {
                    showingPopup = false;
                    AlertActions.closePopup();
                }
            }
            else {
                let { error } = report;
                let state = [
                    DeviceConstants.status.PAUSED_FROM_STARTING,
                    DeviceConstants.status.PAUSED_FROM_RUNNING,
                    DeviceConstants.status.ABORTED
                ];

                // always process as error, hard fix for backend
                error = (error instanceof Array ? error : [error]);

                if(showingPopup) {
                    if(error.length === 0) {
                        showingPopup = false;
                        AlertActions.closePopup();
                    }
                }

                // only display error during these state
                if(state.indexOf(report.st_id) >= 0) {
                    // jug down errors as main and sub error for later use
                    if(error.length > 0) {
                        if(error[2]) {
                            errorMessage = this._processErrorCode(error[2]);
                            // for wrong type of head
                            if(error[1] === 'TYPE_ERROR') {
                                errorMessage = lang.monitor[error.slice(0,2).join('_')];
                            }

                            if(errorMessage === '') {
                                if(error.length >= 2) {
                                    errorMessage = lang.monitor[error.slice(0,2).join('_')];
                                }
                                else {
                                    errorMessage = error;
                                }
                            }
                        }
                        else {
                            errorMessage = lang.monitor[error.slice(0,2).join('_')];
                            if(errorMessage === '' || typeof errorMessage === 'undefined') {
                                errorMessage = error.join(' ');
                            }
                        }
                    }
                    else {
                        errorMessage = '';
                    }

                    errorMessage = errorMessage || '';

                    if(
                        !messageViewed &&
                        !showingPopup &&
                        errorMessage.length > 0
                    ) {
                        AlertActions.showPopupRetry(_id, errorMessage);
                        showingPopup = true;
                    }
                }

                if(this._isAbortedOrCompleted()) {
                    DeviceMaster.quit();
                }
            }
        },

        _isError: function(s) {
            return operationStatus.indexOf(s) < 0;
        },

        _isAbortedOrCompleted: function() {
            let { Device } = store.getState();
            return (
                Device.status.st_id === DeviceConstants.status.ABORTED ||
                Device.status.st_id === DeviceConstants.status.COMPLETED
            );
        },

        _isPaused: function() {
            let { Device } = store.getState();
            let s = [
                DeviceConstants.status.PAUSED,
                DeviceConstants.status.PAUSED_FROM_STARTING,
                DeviceConstants.status.PAUSING_FROM_STARTING,
                DeviceConstants.status.PAUSED_FROM_RUNNING,
                DeviceConstants.status.PAUSING_FROM_RUNNING
            ];
            return s.indexOf(Device.status.st_id) > 0;
        },

        _retrieveFolderContent: function(path) {
            let d = $.Deferred();

            DeviceMaster.ls(path).then((result) => {
                if(result.error) {
                    if(result.error !== DeviceConstants.NOT_EXIST) {
                        AlertActions.showPopupError(result.error);
                        result.directories = [];
                    }
                }
                currentDirectoryContent = result;
                start = 0;
                if(!usbExist && path === '') {
                    let i = currentDirectoryContent.directories.indexOf('USB');
                    if(i >= 0) {
                        currentDirectoryContent.directories.splice(i, 1);
                    }
                }
                currentDirectoryContent.files = currentDirectoryContent.files.map((file) => {
                    let a = [];
                    a.push(file);
                    return a;
                });
                this._renderFolderFilesWithPreview();
                d.resolve(currentDirectoryContent);
            });

            return d.promise();
        },

        _renderFolderFilesWithPreview: function() {
            if(
                start > currentDirectoryContent.files.length ||
                currentDirectoryContent.files.length === 0
            ) {
                return;
            }

            const handleCallback = (filesArray) => {
                if(start > currentDirectoryContent.files.length) { return; }
                let files = currentDirectoryContent.files;

                Array.prototype.splice.apply(files, [start, filesArray.length].concat(filesArray));
                let content = store.getState().Monitor.currentFolderContent;
                content.files = files;
                store.dispatch(MonitorActionCreator.updateFoldercontent(content));
                start = start + scrollSize;
                if(end < currentDirectoryContent.files.length) {
                    this._renderFolderFilesWithPreview();
                }
            };

            let end = start + scrollSize;
            if(end > currentDirectoryContent.files.length) {
                end = currentDirectoryContent.files.length;
            }
            this._retrieveFileInfo(start, end, handleCallback);
        },

        _retrieveFileInfo: function(index, end, callback, filesArray) {
            filesArray = filesArray || [];
            if(index < end) {
                if(currentDirectoryContent.files.length === 0) { return; }
                DeviceMaster.fileInfo(
                    currentDirectoryContent.path,
                    currentDirectoryContent.files[index][0]
                ).then((r) => {
                    r.error ? filesArray.push(currentDirectoryContent.files[index]) : filesArray.push(r);
                    if(socketStatus.cancel) {
                        callback(filesArray);
                    }
                    else {
                        this._retrieveFileInfo(index + 1, end, callback, filesArray);
                    }
                }).fail((error) => {
                    // TODO: display file info error
                });
            }
            else {
                callback(filesArray);
            }
        },

        _checkUSBFolderExistance: function() {
            let d = $.Deferred();
            DeviceMaster.ls('USB').then(() => {
                store.dispatch(DeviceActionCreator.updateUsbFolderExistance(true));
                d.resolve();
            }).fail(() => {
                store.dispatch(DeviceActionCreator.updateUsbFolderExistance(false));
                d.resolve();
            });

            return d.promise();
        },

        _processErrorCode: function(errorCode) {
            // map error code to binary, and use index to identify error
            if(Number(errorCode) === parseInt(errorCode, 10)) {
                let m = parseInt(errorCode).toString(2).split('').reverse();
                let message = m.map((flag, index) => {
                    return flag === '1' ? lang.head_module.error[index] : '';
                });
                return message.filter(entry => entry !== '').join('\n');
            }
            else {
                return '';
            }
        },

        _findObjectContainsProperty: function(infoArray, propertyName) {
            return infoArray.filter((o) => Object.keys(o).some(o => o === propertyName));
        },

        render: function() {
            let subClass = ClassNames('sub', { 'hide': false });

            return (
                <div className="flux-monitor">
                    <div className="main">
                        <MonitorHeader
                            name={DeviceMaster.getSelectedDevice().name}
                            source = {openedFrom}
                            history = {_history}
                            onBackClick = {this._handleBack}
                            onFolderClick = {this._handleBrowseFolder}
                            onCloseClick = {this._handleClose} />
                        <MonitorDisplay
                            selectedDevice = {this.props.selectedDevice}
                            previewUrl = {previewUrl}
                            onFolderClick = {this._handleFolderclick}
                            onFolderDoubleClick = {this._handleFolderDoubleClick}
                            onFileClick = {this._handleFileClick}
                            onFileDoubleClick = {this._handleFileClick} />
                        <MonitorControl
                            source = {openedFrom}
                            previewUrl = {previewUrl}
                            onGo = {this._handleGo}
                            onPause = {this._handlePause}
                            onStop = {this._handleStop}
                            onUpload = {this._handleUpload}
                            onDownload = {this._handleDownload}
                            onToggleCamera = {this._handleToggleCamera} />
                    </div>
                    <div className={subClass}>
                        <MonitorInfo />
                    </div>
                </div>
            );
        }
    });
});
