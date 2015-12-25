define([
    'jquery',
    'react',
    'plugins/classnames/index',
    'helpers/api/control',
    'helpers/api/3d-scan-control',
    'helpers/device-master',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/constants/device-constants',
    'helpers/file-system',
    'app/actions/global-actions',
], function(
    $,
    React,
    ClassNames,
    control,
    scanControl,
    DeviceMaster,
    AlertActions,
    AlertStore,
    DeviceConstants,
    FileSystem,
    GlobalActions
) {
    'use strict';

    var _id = 'MONITOR',
        pathArray,
        start,
        scrollSize = 10,
        currentLevelFiles = [],
        filesInfo = [],
        history = [],
        reporter,
        status,
        usbExist = false,
        showingPopup = false,
        messageViewed = false,
        fileNameLength = 12,
        operationStatus,
        displayStatus,
        currentStatus,
        previewUrl = '',
        lang,
        lastAction,
        fileToBeUpload = {},
        statusActions,
        errorActions,
        uploadProgress = 0,

        // error display
        mainError = '',
        subError = '',
        lastError = '',
        errorMessage = '',
        headInfo = '',
        taskInfo = '',

        timeout = 20000,
        timmer,

        // for monitor temperature, time...
        percentageDone = 0,
        progress = 0,
        totalTimeInSeconds = 0,
        timeLeft =  0,
        progress = '',
        temperature = '',
        statusId = 0,

        refreshTime = 3000;

    var mode = {
        PREVIEW: 'PREVIEW',
        BROWSE_FILE: 'BROWSE_FILE',
        CAMERA: 'CAMERA'
    };

    var opts = {};
    var temp = [];

    operationStatus = [
        DeviceConstants.RUNNING,
        DeviceConstants.PAUSED,
        DeviceConstants.RESUMING,
        DeviceConstants.ABORTED,
    ];

    statusActions = {
        'IDLE': function() {
            displayStatus = lang.device.ready;
            currentStatus = DeviceConstants.READY;
        },

        'INIT': function() {
            displayStatus = lang.device.starting;
            currentStatus = '';
        },

        'STARTING': function() {
            displayStatus = lang.device.starting;
            currentStatus = '';
        },

        'RUNNING': function() {
            displayStatus = lang.device.running;
            currentStatus = DeviceConstants.RUNNING;
            lastError = '';
        },

        'PAUSED': function() {
            displayStatus = lang.device.paused;
            currentStatus = DeviceConstants.PAUSED;
        },

        'PAUSING': function() {
            displayStatus = lang.device.pausing;
            currentStatus = DeviceConstants.PAUSED;
        },

        'WAITING_HEAD': function() {
            displayStatus = lang.device.heating;
            currentStatus = '';
        },

        'CORRECTING': function() {
            displayStatus = lang.device.calibrating;
            currentStatus = '';
        },

        'COMPLETING': function() {
            displayStatus = lang.device.completing;
            currentStatus = '';
        },

        'COMPLETED': function() {
            displayStatus = lang.device.completed;
            currentStatus = '';
            DeviceMaster.quit();
        },

        'ABORTED': function() {
            displayStatus = lang.device.aborted;
            currentStatus = '';
            DeviceMaster.quit();
        },

        'RESUMING': function() {
            displayStatus = lang.device.starting;
            currentStatus = DeviceConstants.RUNNING;
        },

        'OCCUPIED': function() {
            displayStatus = lang.device.occupied;
            currentStatus = DeviceConstants.PAUSED;
        },

        'SCANNING': function() {
            displayStatus = lang.device.scanning;
            currentStatus = '';
        }
    };

    errorActions = {
        'UNKNOWN_STATUS': function() {
            DeviceMaster.quit();
        },

        'AUTH_ERROR': function() {
            clearInterval(reporter);
        },

        'USER_OPERATION': function(_statusId) {
            if(_statusId === DeviceConstants.status.ABORTED) {
                DeviceMaster.quit();
            }
        }
    };

    return React.createClass({

        propTypes: {
            lang                : React.PropTypes.object,
            selectedDevice      : React.PropTypes.object,
            fCode               : React.PropTypes.object,
            onClose             : React.PropTypes.func
        },

        getInitialState: function() {
            return {
                waiting             : false,
                mode                : mode.PREVIEW,
                directoryContent    : {},
                cameraImageUrl      : '',
                selectedFileName    : '',
                progress            : '',
                currentStatus       : DeviceConstants.READY
            };
        },

        componentWillMount: function() {
            var self = this;
                opts = {
                    onError: function(data) {
                        AlertActions.showError(data);
                    },
                    onReady: function() {
                        self.setState({ waiting: false });
                    }
                };

            pathArray   = [];
            lang        = this.props.lang;
            previewUrl  = this.props.previewUrl;

            this._getPrintingInfo();
        },

        componentDidMount: function() {
            AlertStore.onRetry(this._handleRetry);
            AlertStore.onCancel(this._handleCancel);
            AlertStore.onYes(this._handleYes);
            this._addHistory();
        },

        componentWillUnmount: function() {
            DeviceMaster.stopCamera();
            clearInterval(reporter);
            history = [];
            messageViewed = false;
        },

        _getPrintingInfo: function() {
            DeviceMaster.getPreviewInfo().then(function(info) {
                info = info || [];
                info[0] = info[0] || {};

                if(!this._hasFCode()) {
                    if(info[2] instanceof Blob) {
                        previewUrl = window.URL.createObjectURL(info[2]);
                    }
                }

                if(info[0].TIME_COST) {
                    totalTimeInSeconds = info[0].TIME_COST;
                }

                taskInfo = lang.monitor.task[info[0].HEAD_TYPE];

                this._startReport();
            }.bind(this));
        },

        _hasFCode: function() {
            return this.props.fCode instanceof Blob;
        },

        _formatTime(timeInSeconds, withSeconds) {
            var hour = 0,
                min = 0,
                sec = 0,
                time = '';

            if(timeInSeconds > 3600) {
                hour = parseInt(timeInSeconds / 3600);
                min = parseInt((timeInSeconds % 3600) / 60);
                sec = parseInt((timeInSeconds % 3600 % 60));

                if(withSeconds) {
                    time = `${hour}:${min}:${sec}`;
                }
                else {
                    time = `${hour}${lang.monitor.hour} ${min}${lang.monitor.minute}`;
                }
            }
            else if(timeInSeconds > 60) {
                min = parseInt(timeInSeconds / 60);
                sec = parseInt(timeInSeconds % 60);

                if(withSeconds) {
                    time = `${min}:${sec}`;
                }
                else {
                    time = `${min}${lang.monitor.minute} ${sec}${lang.monitor.second}`;
                }
            }

            return time;
        },

        _refreshDirectory: function() {
            console.log(pathArray.join('/'));
            this._retrieveList(pathArray.join('/'));
        },

        _existFileInDirectory: function(path, fileName) {
            var d = $.Deferred();
            DeviceMaster.fileInfo(path, fileName).then(function(result) {
                d.resolve(result.error !== DeviceConstants.NOT_EXIST);
            });
            return d.promise();
        },

        _doFileUpload: function(file) {
            var self = this,
                reader = new FileReader();

            reader.readAsArrayBuffer(file);
            reader.onload = function() {
                var fileInfo = file.name.split('.'),
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
                    var blob = new Blob([reader.result], type);
                    DeviceMaster.uploadFile(file, blob, pathArray.join('/')).then(function(result) {
                        console.log('upload result', result);
                        self._refreshDirectory();
                    });
                }
                else {
                    AlertActions.showPopupInfo('', lang.monitor.extensionNotSupported);
                }
            };
        },

        _handleClose: function() {
            this.props.onClose();
        },

        _handleRetry: function(id) {
            if(id === _id) {
                if(this.state.currentStatus === DeviceConstants.PAUSED) {
                    DeviceMaster.resume();
                }
            }
        },

        _handleCancel: function(id) {
            messageViewed = true;
            showingPopup = false;
        },

        _handleYes: function(id) {
            if(id === DeviceConstants.KICK) {
                DeviceMaster.kick();
            }
            else if(id === 'uploadFile') {
                var info    = fileToBeUpload.name.split('.'),
                    ext     = info[info.length - 1];

                if(ext === 'gcode') {
                    AlertActions.showPopupYesNo('confirmGToF', lang.monitor.confirmGToF);
                }
                else {
                    this._doFileUpload(fileToBeUpload);
                }
            }
            else if(id === 'confirmGToF') {
                this._doFileUpload(fileToBeUpload);
            }
        },

        _handleBrowseFile: function() {
            DeviceMaster.stopCamera();
            filesInfo = [];
            pathArray = [];

            DeviceMaster.ls('USB').then(function(result) {
                usbExist = result.status === 'ok';
                this._retrieveList('');
            }.bind(this));

            this.setState({
                mode: mode.BROWSE_FILE,
                waiting: true
            }, function() {
                this._addHistory();
            });
            this._stopReport();
        },

        _handleSelectFolder: function(pathName) {
            var dir = this.state.directoryContent.directories;
            // if it's a directory
            if(dir.some(function(d) {
                return d === pathName;
            })) {
                pathArray.push(pathName);
                start = 0;
                this._retrieveList(pathArray.join('/'));
                this.setState({ waiting: true });
                this._addHistory();
            }
        },

        _handleBrowseUpLevel: function() {
            if(pathArray.length === 0) {
                this.setState({ mode: mode.PREVIEW });
                this._startReport();
                return;
            }
            pathArray.pop();
            this._retrieveList(pathArray.join('/'));
        },

        _handleBack: function() {
            var self = this;
            if(history.length > 1) {
                history.pop();
                pathArray.pop();
                temp.pop();
            }
            lastAction = history[history.length - 1];

            var actions = {

                'PREVIEW' : function() {
                    self._startReport();
                },

                'BROWSE_FILE': function() {
                    self._retrieveList(lastAction.path.join('/'));
                    self._stopReport();
                },

                'CAMERA': function() {
                    self._stopReport();
                }
            };

            if(actions[lastAction.mode]) {
                actions[lastAction.mode]();
                this.setState({ mode: lastAction.mode });
            }
        },

        _handleScroll: function(e) {
            if(this.state.mode === mode.BROWSE_FILE) {
                var onNeedData = e.target.scrollHeight === e.target.offsetHeight + e.target.scrollTop;
                if(onNeedData) {
                    start = start + scrollSize;
                    this._retrieveList(history[history.length-1].path.join('/'));
                }
            }
        },

        _handleSelectFile: function(fileName, action) {
            if(action === DeviceConstants.SELECT) {
                this.setState({ selectedFileName: fileName});
            }
            else {
                start = 0;
                DeviceMaster.fileInfo(pathArray.join('/'), fileName).then(function(info) {
                    if(info[1] instanceof Blob) {
                        previewUrl = URL.createObjectURL(info[1]);
                        this.setState({
                            mode: mode.PREVIEW
                        }, function() {
                            this._addHistory();
                            this._startReport();
                        });
                    }
                    else {
                        AlertActions.showPopupInfo('', lang.monitor.cannotPreview);
                    }

                }.bind(this));
            }
        },

        _handleUpload: function(e) {
            if(e.target.files.length > 0) {
                fileToBeUpload = e.target.files[0];
                this._existFileInDirectory(pathArray, fileToBeUpload.name).then(function(exist) {
                    if(exist) {
                        AlertActions.showPopupYesNo('uploadFile', lang.monitor.fileExistContinue);
                    }
                    else {
                        var info = fileToBeUpload.name.split('.'),
                            ext  = info[info.length - 1];

                        if(ext === 'gcode') {
                            AlertActions.showPopupYesNo('confirmGToF', lang.monitor.confirmGToF);
                        }
                        else {
                            this._doFileUpload(fileToBeUpload);
                        }
                    }
                }.bind(this));
                e.target.value = null;
            }
        },

        _handleDownload: function() {
            start = 0;
            DeviceMaster.fileInfo(pathArray.join('/'), this.state.selectedFileName).then(function(info) {
                if(info[1] instanceof Blob) {
                    saveAs(info[1], info[0]);
                }
                else {
                    AlertActions.showPopupInfo('', lang.monitor.fileNotDownloadable);
                }
            }.bind(this));
        },

        _handleToggleCamera: function() {
            if(this.state.mode === mode.CAMERA) {
                this._handleBack();
                return;
            }
            DeviceMaster.startCamera(this._processImage);
            this._stopReport();
            this.setState({
                waiting: true,
                mode: mode.CAMERA
            }, function() {
                this._addHistory();
            });
        },

        _handleGo: function() {
            var self = this;
            this._stopReport();
            if(this.state.currentStatus === DeviceConstants.READY) {
                var blob = this.props.fCode;
                this.setState({ displayStatus: lang.device.starting });
                if(blob) {
                    DeviceMaster.go(blob, function(_progress) {
                        if(_progress !== 100) {
                            self.setState({ displayStatus: `${lang.device.uploading} ${_progress}%`});
                        }
                        else {
                            self.setState({ displayStatus: `${lang.device.processing}`});
                        }
                    }).then(function() {
                        self._getPrintingInfo();
                    });
                }
                else {
                    DeviceMaster.goFromFile(pathArray, this.state.selectedFileName).then(function(result) {
                        self._getPrintingInfo();
                    });
                }
                // initializing = true;

            }
            else {
                DeviceMaster.resume().then(function() {
                    self._startReport();
                });
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
                DeviceMaster.stop();
            }
        },

        _addHistory: function() {
            history.push({
                mode: this.state.mode,
                previewUrl: previewUrl,
                path: pathArray.slice()
            });
        },

        _startReport: function() {
            var self = this;
            timmer = setTimeout(this._processTimeout, timeout);

            DeviceMaster.getReport().then(function(report) {
                self._processReport(report);
            });

            reporter = setInterval(function() {
                DeviceMaster.getReport().then(function(report) {
                    self._processReport(report);
                });
            }, refreshTime);
        },

        _processTimeout: function() {
            AlertActions.showPopupError('', lang.device.disconnectedError);
            this._handleClose();
        },

        _processReport: function(report) {
            errorMessage    = '';
            mainError       = '';
            subError        = '';
            status          = report.st_label;
            statusId        = report.st_id;

            clearTimeout(timmer);
            timmer = setTimeout(this._processTimeout, timeout);
            // rootMode = statusId === DeviceConstants.status.IDLE ? DeviceConstants.IDLE : DeviceConstants.RUNNING;

            // jug down errors as main and sub error for later use
            if(report.error) {
                if(typeof(report.error) === 'string') {
                    mainError = report.error;
                }
                else {
                    mainError = report.error[0];
                    subError = report.error[1] || '';
                }
            }

            if(errorActions[mainError]) {
                errorActions[mainError](statusId);
            }

            if(lastError !== mainError) {
                messageViewed = false;
                lastError = mainError;
                var attr = [];
                attr.push(mainError);
                if(subError.length > 0) {
                    attr.push(subError);
                }

                console.log(attr.join('_'));
                errorMessage = lang.monitor[attr.join('_')];
            }

            if(!messageViewed && !showingPopup && mainError !== DeviceConstants.USER_OPERATION) {
                AlertActions.showPopupRetry(_id, errorMessage);
                showingPopup = true;
            }

            // actions responded to status
            if(statusActions[status]) {
                statusActions[status]();
            }

            if(report.prog && !!totalTimeInSeconds) {
                percentageDone = parseInt(report.prog * 100);
                timeLeft = this._formatTime(totalTimeInSeconds * (1 - report.prog));
                progress = `${percentageDone}%, ${timeLeft} ${lang.monitor.left}`;
            }
            else {
                progress = '';
            }

            temperature = report.rt ? `${lang.monitor.temperature} ${report.rt} °C` : '';
            headInfo = report.module ? lang.monitor.device[report.module] : '';

            if(!report.error) {
                AlertActions.closePopup();
                showingPopup = false;
            }

            if(status === DeviceConstants.COMPLETED) {
                temperature = '';
                progress = '';
            }

            this.setState({
                temperature: temperature,
                currentStatus: currentStatus,
                displayStatus: displayStatus,
                progress: progress
            });
        },

        _isError: function(s) {
            return operationStatus.indexOf(s) < 0;
        },

        _stopReport: function() {
            clearInterval(reporter);
        },

        _processImage: function(image_blobs, mime_type) {
            var blob = new Blob(image_blobs, {type: mime_type});
            var url = URL.createObjectURL(blob);
            this.setState({
                cameraImageUrl: url,
                waiting: false
            });
        },

        _retrieveList: function(path) {
            var self = this;

            if(start === 0) {
                filesInfo = [];
            }

            DeviceMaster.ls(path).then(function(result) {
                if(result.error) {
                    if(result.error !== DeviceConstants.NOT_EXIST) {
                        AlertActions.showPopupError(result.error);
                        result.directories = [];
                        self.setState({
                            directoryContent: result,
                            waiting: false
                        });
                    }
                }
                currentLevelFiles = result.files;
                self._retrieveFileInfo(path).then(function(info) {
                    filesInfo = filesInfo.concat(info);
                    if(path === '' && !usbExist) {
                        var i = result.directories.indexOf('USB');
                        result.directories.splice(i, 1);
                    }
                    self.setState({
                        directoryContent: result,
                        waiting: false
                    });
                });
            });
        },

        _retrieveFileInfo: function(path) {
            var d = $.Deferred();
            var returnArray = [];

            currentLevelFiles = currentLevelFiles || [];
            if(currentLevelFiles.length === 0) {
                d.resolve(returnArray);
                return d.promise();
            }
            var end = (start + scrollSize);
            end = end < currentLevelFiles.length ? end : currentLevelFiles.length - 1;

            this._iterateFileInfo(path, start, end, returnArray, function(result) {
                d.resolve(result);
            });
            return d.promise();
        },

        _iterateFileInfo: function(path, startIndex, endIndex, returnArray, callback) {
            var self = this;

            if(startIndex <= endIndex) {
                DeviceMaster.fileInfo(path, currentLevelFiles[startIndex], opts).then(function(r) {
                    if(!r.error) {
                        returnArray.push(r);
                    }
                    return self._iterateFileInfo(path, startIndex + 1, endIndex, returnArray, callback);
                });
            }
            else {
                callback(returnArray);
            }
        },

        _renderDirectoryContent: function(content) {
            if(!content.directories) {
                return '';
            }

            var self = this,
                files,
                folders;

            folders = content.directories.map(function(item) {
                return (
                    <div className="folder" onDoubleClick={this._handleSelectFolder.bind(this, item)}>
                        <div className="name">{item}</div>
                    </div>
                );
            }.bind(this));

            files = filesInfo.map(function(item) {
                var imgSrc = URL.createObjectURL(item[1]) || 'http://placehold.it/60x60',
                    fileNameClass = ClassNames('name', {'selected': self.state.selectedFileName === item[0]});

                return (
                    <div
                        title={item[0]}
                        className="file"
                        onClick={self._handleSelectFile.bind(null, item[0], DeviceConstants.SELECT)}
                        onDoubleClick={self._handleSelectFile.bind(null, item[0], DeviceConstants.PREVIEW)}>
                        <div className="image-wrapper">
                            <img src={imgSrc} />
                        </div>
                        <div className={fileNameClass}>
                            {item[0].length > fileNameLength ? item[0].substring(0, fileNameLength) + '...' : item[0]}
                        </div>
                    </div>
                );
            });

            return (
                <div className="wrapper">
                    {folders}
                    {files}
                </div>
            );
        },

        _renderCameraContent: function() {
            return(
                <div className="wrapper">
                    <img className="camera-image" src={this.state.cameraImageUrl} />
                </div>
            );
        },

        _renderSpinner: function() {
            return (
                <div className="spinner-wrapper">
                    <div className="spinner-flip"/>
                </div>
            );
        },

        _renderContent: function() {
            if(this.state.mode !== mode.CAMERA) {
                DeviceMaster.stopCamera();
            }

            switch(this.state.mode) {
                case mode.PREVIEW:
                    var divStyle = {
                            backgroundColor: '#E0E0E0',
                            backgroundImage: !previewUrl ? '' : 'url(' + previewUrl + ')',
                            backgroundSize: 'cover',
                            backgroundPosition: '50% 50%',
                            width: '100%',
                            height: '100%'
                        };
                    return (<div style={divStyle} />);
                    break;

                case mode.BROWSE_FILE:
                    return this._renderDirectoryContent(this.state.directoryContent);
                    break;

                case mode.CAMERA:
                    return this._renderCameraContent();
                    break;

                default:
                    return '';
                    break;
            }
        },

        _renderOperation: function() {
            var self = this,
                operation,
                wait,
                go,
                pause,
                stop,
                commands,
                action,
                cameraClass,
                cameraDescriptionClass,
                upload,
                download,
                camera,
                leftButton,
                middleButton,
                cameraButton;

            cameraClass = ClassNames('btn-camera btn-control', { 'on': this.state.mode === mode.CAMERA });
            cameraDescriptionClass = ClassNames('description', { 'on': this.state.mode === mode.CAMERA });

            go = (
                <div className="controls center" onClick={self._handleGo}>
                    <div className="btn-go btn-control"></div>
                    <div className="description">{lang.monitor.go}</div>
                </div>
            );

            pause = (
                <div className="controls center" onClick={self._handlePause}>
                    <div className="btn-pause btn-control"></div>
                    <div className="description">{lang.monitor.pause}</div>
                </div>
            );

            stop = (
                <div className="controls left" onClick={this._handleStop}>
                    <div className="btn-stop btn-control"></div>
                    <div className="description">{lang.monitor.stop}</div>
                </div>
            );

            upload = (
                <div className="controls left" onClick={this._handleUpload}>
                    <div className="btn-upload btn-control"></div>
                    <input className="upload-control" type="file" accept=".fc, .gcode" onChange={this._handleUpload} />
                    <div className="description">{lang.monitor.upload}</div>
                </div>
            );

            download = (
                <div className="controls center" onClick={this._handleDownload}>
                    <div className="btn-download btn-control"></div>
                    <div className="description">{lang.monitor.download}</div>
                </div>
            );

            camera = (
                <div className="controls right" onClick={this._handleToggleCamera}>
                    <div className={cameraClass}></div>
                    <div className={cameraDescriptionClass}>{lang.monitor.camera}</div>
                </div>
            );

            commands = {
                'READY': function() {
                    return go;
                },

                'RUNNING': function() {
                    return pause;
                },

                'STARTING': function() {
                    return pause;
                },

                'PAUSED': function() {
                    return go;
                },
            };

            action = !!commands[this.state.currentStatus] ? commands[this.state.currentStatus]() : '';

            if(!this.props.fCode && !this.state.selectedFileName) {
                if(this.state.currentStatus === DeviceConstants.READY) {
                    action = '';
                }
            }

            leftButton = this.state.mode === mode.BROWSE_FILE ? upload : stop;
            middleButton = this.state.mode === mode.BROWSE_FILE ? download : action;
            cameraButton = currentStatus !== DeviceConstants.READY ? '' : camera;

            operation = (
                <div className="operation">
                    {leftButton}
                    {middleButton}
                    {cameraButton}
                </div>
            );

            wait = (<div className="wait">{lang.monitor.connecting}</div>);

            return operation;
        },

        _renderPrintingInfo: function() {
            var _duration   = totalTimeInSeconds === 0 ? '' : this._formatTime(totalTimeInSeconds, true),
                _progress   = percentageDone === 0 ? '' : percentageDone + '%',
                infoClass   = ClassNames('status-info', { 'running': statusId !== DeviceConstants.status.IDLE });

            if(statusId === DeviceConstants.status.IDLE || statusId === DeviceConstants.status.COMPLETED) {
                taskInfo = '';
                _duration = '';
                _progress = '';
            }

            return (
                <div className={infoClass}>
                    <div className="verticle-align">
                        <div>{taskInfo}</div>
                        <div className="status-info-duration">{_duration}</div>
                    </div>
                    <div className="status-info-progress">{_progress}</div>
                </div>
            );
        },

        _renderNavigation: function() {
            if(history.length > 1) {
                return (
                   <div className="back" onClick={this._handleBack}>
                       <i className="fa fa-angle-left"></i>
                   </div>
               );
            }
            if(this.state.mode === mode.BROWSE_FILE) {
                return (
                   <div className="back" onClick={this._handleBack}>
                       <i className="fa fa-angle-left"></i>
                   </div>
               );
            }
            else {
                return (
                    <div className="back" onClick={this._handleBrowseFile}>
                        <img src="../../img/folder.svg" />
                    </div>
                );
            }
        },

        render: function() {

            var name            = DeviceMaster.getSelectedDevice().name,
                content         = this._renderContent(),
                waitIcon        = this.state.waiting ? this._renderSpinner() : '',
                operation       = this._renderOperation(),
                navigation      = this._renderNavigation(),
                subClass        = ClassNames('sub', { 'hide': false }),
                printingInfo    = this.state.mode === mode.BROWSE_FILE ? '' : this._renderPrintingInfo();

            return (
                <div className="flux-monitor">
                    <div className="main">
                        <div className="header">
                            <div className="title">
                                <span>{name}</span>
                                <div className="close" onClick={this._handleClose}>
                                    <div className="x"></div>
                                </div>
                                {navigation}
                            </div>
                        </div>
                        <div className="body">
                            <div className="device-content" onScroll={this._handleScroll}>
                                {/*<div className="close"></div>*/}
                                {content}
                                {waitIcon}
                                {printingInfo}
                            </div>

                        </div>
                        {operation}
                    </div>
                    <div className={subClass}>
                        <div className="wrapper">
                            <div className="row">
                                <div className="head-info">
                                    {headInfo}
                                </div>
                                <div className="status right">
                                    {this.state.displayStatus}
                                </div>
                            </div>
                            <div className="row">
                                <div className="temperature">{this.state.temperature}</div>
                                <div className="time-left right">{this.state.progress}</div>
                            </div>
                        </div>
                        {
                            /*
                            <div className="actions center">
                                <a className="btn filament">{lang.monitor.change_filament}</a>
                                <a className="btn file" onClick={this._handleBrowseFile}>{lang.monitor.browse_file}</a>
                                <a className="btn monitor" onClick={this._handleToggleCamera}>{lang.monitor.monitor}</a>
                            </div>
                            */
                        }
                    </div>
                </div>
            );
        }

    });
});
