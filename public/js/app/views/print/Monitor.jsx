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
    'helpers/sprintf'
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
    GlobalActions,
    sprintf
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
        openSource,
        errorActions,

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
        PRINT       : 'PRINT',
        PREVIEW     : 'PREVIEW',
        BROWSE_FILE : 'BROWSE_FILE',
        CAMERA      : 'CAMERA'
    };

    var type = {
        FILE: 'FILE',
        FOLDER: 'FOLDER'
    };

    var source = {
        DEVICE_LIST : 'DEVICE_LIST',
        GO          : 'GO'
    }

    var operation,
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
        rightButton,

        leftButtonOn = true,
        middleButtonOn = true,
        rightButtonOn = true;

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
            leftButtonOn = false;
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
            if(openSource == source.GO){
                DeviceMaster.quit();
            }
        },

        'ABORTED': function() {
            displayStatus = lang.device.aborted;
            currentStatus = '';
            if(openSource == source.GO){
                DeviceMaster.quit();
            }
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
            this._stopReport();
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
            previewUrl          : React.PropTypes.string,
            onClose             : React.PropTypes.func
        },

        getInitialState: function() {
            var _mode = mode.PREVIEW;
            openSource = !this.props.fCode ? source.DEVICE_LIST : source.GO;
            if(openSource === source.DEVICE_LIST &&
                this.props.selectedDevice.st_id === DeviceConstants.status.IDLE){
                    _mode = mode.BROWSE_FILE; 
            }

            return {
                waiting             : false,
                mode                : _mode,
                directoryContent    : {},
                cameraImageUrl      : '',
                selectedItem        : '',
                progress            : '',
                currentStatus       : DeviceConstants.READY,
                displayStatus       : ''
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

            statusId = DeviceConstants.status.IDLE;
            if(this.state.mode !== mode.BROWSE_FILE) {
                this._getPrintingInfo();
            }
        },

        componentDidMount: function() {
            AlertStore.onRetry(this._handleRetry);
            AlertStore.onCancel(this._handleCancel);
            AlertStore.onYes(this._handleYes);
            this._addHistory();

            if(this.state.mode === mode.BROWSE_FILE) {
                currentStatus = DeviceConstants.READY;
                this._refreshDirectory();
            }
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            return JSON.stringify(this.state) !== JSON.stringify(nextState);
        },

        componentWillUnmount: function() {

            AlertStore.removeRetryListener(this._handleRetry);
            AlertStore.removeCancelListener(this._handleCancel);
            AlertStore.removeYesListener(this._handleYes);

            if(this.state.mode === mode.CAMERA) {
                DeviceMaster.stopCamera();
            }
            this._stopReport();
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
            else {
                sec = parseInt(timeInSeconds);
                if(withSeconds) {
                    time = `00:${sec}`;
                }
                else {
                    time = `${sec}${lang.monitor.second}`;
                }
            }

            return time;
        },

        _refreshDirectory: function() {
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
                    DeviceMaster.uploadFile(blob, file, pathArray.join('/')).then(function(result) {
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
                if(statusId === DeviceConstants.status.ABORTED) {
                    DeviceMaster.quit().then(function() {
                        this.setState({ currentStatus: DeviceConstants.READY }, function() {
                            this._handleGo();
                        });
                    }.bind(this));
                }
                else if(this.state.currentStatus === DeviceConstants.PAUSED) {
                    DeviceMaster.resume();
                    setTimeout(function(){
                        messageViewed = false;
                        showingPopup = false;
                    }, 1200);
                }
            }
        },

        _handleCancel: function(id) {
            messageViewed = true;
            showingPopup = false;
        },

        _handleYes: function(id) {
            if(id === DeviceConstants.KICK) {
                DeviceMaster.kick().then(function() {
                    this._startReport();
                }.bind(this));
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
                this.setState({ mode: lastAction.mode }, function() {
                    if(this.state.mode === mode.CAMERA) {
                        DeviceMaster.stopCamera().then(function() {
                            DeviceMaster.kick();
                        });
                    };
                });
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

        _handleSelectFile: function(fileName, action, e) {
            e.stopPropagation();
            if(action === DeviceConstants.SELECT) {
                this.setState({
                    selectedItem: fileName,
                    selectedItemType: type.FILE
                });
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

        _handleHighlightFolder: function(folderName, e) {
            e.stopPropagation();
            this.setState({
                selectedItem: this.state.selectedItem === folderName ? '' : folderName,
                selectedItemType: this.state.selectedItem === folderName ? '' : type.FOLDER
            });
        },

        _handleCancelSelectItem: function(e) {
            this.setState({
                selectedItem: '',
                selectedItemType: ''
            });
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
            DeviceMaster.fileInfo(pathArray.join('/'), this.state.selectedItem).then(function(info) {
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
                DeviceMaster.stopCamera().then(function() {
                    DeviceMaster.kick();
                });
                this._handleBack();
                return;
            }
            DeviceMaster.readyCamera().then(function() {
                DeviceMaster.startCamera(this._processImage);
            }.bind(this));

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

                this.setState({
                    currentStatus: DeviceConstants.STARTING,
                    mode: mode.PRINT
                });

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
                    DeviceMaster.goFromFile(pathArray, this.state.selectedItem).then(function(result) {
                        self._getPrintingInfo();
                    });
                }

            }
            else {
                DeviceMaster.resume().then(function() {
                    this._startReport();
                }.bind(this));
            }
        },

        _handlePause: function() {
            DeviceMaster.pause();
        },

        _handleStop: function() {
            if(statusId < 0) {
                this._stopReport();
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
            clearTimeout(timmer);
            DeviceMaster.reconnect();
            if($('.flux-monitor')[0]){
                //Show disconnect if FLUX Monitor exists..
                AlertActions.showPopupError('disconnect', sprintf(lang.device.disconnectedError.message, DeviceMaster.getSelectedDevice().name), lang.device.disconnectedError.caption);
            }
            this._handleClose();
        },

        _processReport: function(report) {
            errorMessage    = '';
            mainError       = '';
            subError        = '';
            status          = report.st_label;
            statusId        = report.st_id;
            leftButtonOn    = true;
            middleButtonOn  = true;
            rightButtonOn   = true;

            clearTimeout(timmer);
            timmer = setTimeout(this._processTimeout, timeout);
            // rootMode = statusId === DeviceConstants.status.IDLE ? DeviceConstants.IDLE : DeviceConstants.RUNNING;

            // jug down errors as main and sub error for later use
            if(report.error) {
                if(typeof(report.error) === 'string') {
                    mainError = report.error;
                }
                else {
                    mainError = report.error[0] || '';
                    subError = report.error[1] || '';
                }
            }

            if(errorActions[mainError]) {
                errorActions[mainError](statusId);
            }

            var attr = [mainError];
            if(subError.length > 0) {
                attr.push(subError);
            }
            errorMessage = lang.monitor[attr.join('_')];

            //if(errorMessage == null) errorMessage = attr.join('_');

            if(lastError !== mainError) {
                messageViewed = false;
                lastError = mainError;
                //The display logic should be control by showing poupup
                console.log("Error detected", attr);
            }

            if(!messageViewed && !showingPopup && mainError !== DeviceConstants.USER_OPERATION && mainError.length > 0) {
                AlertActions.showPopupRetry(_id, errorMessage);
                showingPopup = true;
            }

            // actions responded to status
            status = statusId === DeviceConstants.status.SCAN ? DeviceConstants.SCANNING : status;
            status = statusId === DeviceConstants.status.ABORTED ? DeviceConstants.ABORTED : status;
            if(statusActions[status]) {
                statusActions[status]();
            }


            if(statusId === DeviceConstants.status.PAUSED_FROM_RUNNING) {
                displayStatus = lang.device.paused;
                currentStatus = DeviceConstants.PAUSED;
            }

            if(report.prog && !!totalTimeInSeconds) {
                percentageDone = parseInt(report.prog * 100);
                timeLeft = this._formatTime(totalTimeInSeconds * (1 - report.prog));
                progress = `${percentageDone}%, ${timeLeft} ${lang.monitor.left}`;
            }
            else {
                progress = '';
            }

            if(status === DeviceConstants.RUNNING) {
                temperature = report.rt ? `${lang.monitor.temperature} ${report.rt} °C` : '';
            }
            else {
                temperature = report.rt ? `${lang.monitor.temperature} ${report.rt} °C / ${report.tt} °C` : '';
            }

            headInfo = report.module ? lang.monitor.device[report.module] : '';

            if(!report.error) {
                AlertActions.closePopup();
                showingPopup = false;
            }

            if(status === DeviceConstants.COMPLETED) {
                temperature = '';
                progress = '';
            }

            if(!report.error) {
                AlertActions.closePopup();
            }

            var report_info = {
                temperature: temperature,
                currentStatus: currentStatus,
                displayStatus: displayStatus,
                progress: progress
            }

            //If report returns idle state, which means nothing to preview..
            if(openSource === source.DEVICE_LIST &&
                report.st_id === DeviceConstants.status.IDLE &&
                this.state.mode === mode.PREVIEW){
                report_info['mode'] = mode.BROWSE_FILE;
                this._refreshDirectory();
            }

            this.setState(report_info);
        },

        _isError: function(s) {
            return operationStatus.indexOf(s) < 0;
        },

        _stopReport: function() {
            clearInterval(reporter);
            clearTimeout(timmer);
            reporter = null;
            timmer = null;
        },

        _processImage: function(imageBlobs, mimeType) {
            var blob = new Blob(imageBlobs, {type: mimeType});
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

        _imageError: function(src) {
            src.target.src = '/img/ph_s.png';
        },

        _renderDirectoryContent: function(content) {
            if(!content.directories) {
                return '';
            }

            var self = this,
                files,
                folders,
                imgSrc,
                fileNameClass,
                folderNameClass;

            folders = content.directories.map(function(item) {
                folderNameClass = ClassNames('name', {'selected': self.state.selectedItem === item});
                return (
                    <div
                        className="folder"
                        onClick={self._handleHighlightFolder.bind(null, item)}
                        onDoubleClick={this._handleSelectFolder.bind(this, item)}>
                        <div className={folderNameClass}>{item}</div>
                    </div>
                );
            }.bind(this));

            files = filesInfo.map(function(item) {
                imgSrc = URL.createObjectURL(item[1]) || 'http://placehold.it/60x60';
                fileNameClass = ClassNames('name', {'selected': self.state.selectedItem === item[0]});

                return (
                    <div
                        title={item[0]}
                        className="file"
                        onClick={self._handleSelectFile.bind(null, item[0], DeviceConstants.SELECT)}
                        onDoubleClick={self._handleSelectFile.bind(null, item[0], DeviceConstants.PREVIEW)}>
                        <div className="image-wrapper">
                            <img src={imgSrc} onError={self._imageError.bind(this)}/>
                        </div>
                        <div className={fileNameClass}>
                            {item[0].length > fileNameLength ? item[0].substring(0, fileNameLength) + '...' : item[0]}
                        </div>
                    </div>
                );
            });

            return (
                <div className="wrapper" onClick={this._handleCancelSelectItem}>
                    {folders}
                    {files}
                </div>
            );
        },

        _renderCameraContent: function() {
            var backgroundStyle = {
                transition: 'all 0.5s',
                '-webkit-transition': 'all 0.5s',
                backgroundColor: '#E0E0E0',
                backgroundImage: 'url(' +this.state.cameraImageUrl + ')',
                backgroundSize: 'cover',
                backgroundPosition: '50% 50%',
                width: '100%',
                height: '100%'
            }
            return(
                <div className="wrapper" style={backgroundStyle}>
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
            switch(this.state.mode) {
                case mode.PREVIEW:
                case mode.PRINT:
                    var divStyle = {
                            backgroundColor: '#E0E0E0',
                            backgroundImage: !previewUrl ? 'url(/img/ph_l.png)' : 'url(' + previewUrl + ')',
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

            cameraClass = ClassNames('btn-camera btn-control', { 'on': this.state.mode === mode.CAMERA });
            cameraDescriptionClass = ClassNames('description', { 'on': this.state.mode === mode.CAMERA });

            go = function(className){
                console.log(className);
                className = "controls center " + className;
                return (
                <div className={className} onClick={this._handleGo}>
                    <div className="btn-go btn-control"></div>
                    <div className="description">{lang.monitor.go}</div>
                </div>
                );
            }.bind(this)

            pause = function(className){
                className = "controls center " + className;
                return (
                <div className={className} onClick={this._handlePause}>
                    <div className="btn-pause btn-control"></div>
                    <div className="description">{lang.monitor.pause}</div>
                </div>
                );
            }.bind(this)

            stop = function(className){
                className = "controls left " + className;
                return (
                <div className={className} onClick={this._handleStop}>
                    <div className="btn-stop btn-control"></div>
                    <div className="description">{lang.monitor.stop}</div>
                </div>
                );
            }.bind(this)

            upload = function(className){
                className = "controls left " + className;
                return (
                    <div className={className} onClick={this._handleUpload}>
                        <div className="btn-upload btn-control"></div>
                        <input className="upload-control" type="file" accept=".fc, .gcode" onChange={this._handleUpload} />
                        <div className="description">{lang.monitor.upload}</div>
                    </div>
                );
            }.bind(this)

            download =  function(className){
                className = "controls center " + className;
                return (
                    <div className={className} onClick={this._handleDownload}>
                        <div className="btn-download btn-control"></div>
                        <div className="description">{lang.monitor.download}</div>
                    </div>
                );
            }.bind(this)

            camera = function(className){
                className = "controls right " + className;
                return (
                    <div className={className} onClick={this._handleToggleCamera}>
                        <div className={cameraClass}></div>
                        <div className={cameraDescriptionClass}>{lang.monitor.camera}</div>
                    </div>
                );
            }.bind(this)

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

            if(!this.props.fCode && !this.state.selectedItem) {
                if(this.state.currentStatus === DeviceConstants.READY) {
                    middleButtonOn = false;
                }
            }

            leftButton = this.state.mode === mode.BROWSE_FILE ? upload : stop;
            middleButton = this.state.mode === mode.BROWSE_FILE ? download : action;
            rightButton = camera;

            if(currentStatus !== DeviceConstants.READY) {
                rightButtonOn = false;
            }

            // CAMERA mode
            if(this.state.mode === mode.CAMERA) {
                leftButtonOn = false;
                middleButtonOn = false;
            }

            // BROWSE_FILE mode
            if(this.state.mode === mode.BROWSE_FILE) {
                if(this.state.selectedItemType !== type.FILE && this.state.mode === mode.BROWSE_FILE) {
                    middleButtonOn = false;
                }
            }

            // PRINT mode
            if(this.state.mode === mode.PRINT) {
                if(
                    statusId === DeviceConstants.status.IDLE ||
                    statusId === DeviceConstants.status.COMPLETED ||
                    statusId === DeviceConstants.status.ABORTED
                ) {
                    leftButtonOn = false;
                }

                if(this.state.currentStatus === DeviceConstants.STARTING) {
                    middleButtonOn = false;
                    rightButtonOn = false;
                }

                if(statusId === DeviceConstants.status.PAUSING_FROM_RUNNING) {
                    middleButtonOn = false;
                }

                if(statusId === DeviceConstants.status.MAINTAIN ||
                    statusId === DeviceConstants.status.SCAN ) {
                    middleButtonOn = false;
                }
            }
            else if (this.state.mode === mode.PREVIEW) {
                if(
                    statusId === DeviceConstants.status.IDLE ||
                    statusId === DeviceConstants.status.COMPLETED ||
                    statusId === DeviceConstants.status.ABORTED
                ) {
                    leftButtonOn = false;
                }

                if(statusId === DeviceConstants.status.MAINTAIN ||
                   statusId === DeviceConstants.status.SCAN) {
                    middleButtonOn = false;
                }
            }

            console.log("ID", statusId, middleButtonOn, this.state.mode)

            //leftButton      = leftButtonOn ? leftButton : '';
            //middleButton    = middleButtonOn ? middleButton : '';
            //rightButton    = rightButtonOn ? rightButton : '';

            console.log(leftButtonOn, middleButtonOn, rightButtonOn)

            if(leftButton!='') leftButton = leftButton(leftButtonOn ? '' : 'disabled');
            if(middleButton!='') middleButton = middleButton(middleButtonOn ? '' : 'disabled');
            if(rightButton!='') rightButton = rightButton(rightButtonOn ? '' : 'disabled');

            operation = (
                <div className="operation">
                    {leftButton}
                    {middleButton}
                    {rightButton}
                </div>
            );

            wait = (<div className="wait">{lang.monitor.connecting}</div>);

            return operation;
        },

        _renderPrintingInfo: function() {
            var _duration   = totalTimeInSeconds === 0 ? '' : this._formatTime(totalTimeInSeconds, true),
                _progress   = percentageDone === 0 ? '' : percentageDone + '%',
                infoClass   = ClassNames('status-info', 
                                        { 'running': statusId !== DeviceConstants.status.IDLE && 
                                                     statusId !== DeviceConstants.status.MAINTAIN && 
                                                     statusId !== DeviceConstants.status.SCAN });

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
            console.log(pathArray);
            if(openSource === source.DEVICE_LIST && statusId == 0 && pathArray.length == 0 && this.state.mode == mode.BROWSE_FILE){
                return (<div className="back"></div>);
            }
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
                op              = this._renderOperation(),
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
                        {op}
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
