define([
    'jquery',
    'react',
    'plugins/classnames/index',
    'helpers/api/control',
    'helpers/api/3d-scan-control',
    'helpers/device-master',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/constants/device-constants'
], function($, React, ClassNames, control, scanControl, DeviceMaster, AlertActions, AlertStore, DeviceConstants) {
    'use strict';

    var _id = 'MONITOR',
        controller,
        scanController,
        pathArray,
        start,
        scrollSize = 10,
        currentLevelFiles = [],
        filesInfo = [],
        history = [],
        cameraSource,
        remote,
        reporter,
        status,
        operationStatus,
        lastAction,
        lastError = '',
        previewUrl = '',
        lang,
        refreshTime = 5000;

    var mode = {
        PREVIEW: 'PREVIEW',
        BROWSE_FILE: 'BROWSE_FILE',
        CAMERA: 'CAMERA'
    };

    var opts = {
        onError: function(data) {

        },
        onReady: function() {

        }
    };

    operationStatus = [
        DeviceConstants.RUNNING,
        DeviceConstants.PAUSING,
        DeviceConstants.PAUSED,
        DeviceConstants.RESUMING,
        DeviceConstants.ABORTED,
    ];

    return React.createClass({

        propTypes: {
            lang                : React.PropTypes.object,
            selectedDevice      : React.PropTypes.object,
            fCode               : React.PropTypes.object,
            previewUrl          : React.PropTypes.string
        },

        getInitialState: function() {
            return {
                desiredTemperature  : 280,
                currentTemperature  : 0,
                printingProgress    : 0,
                printStatus         : false,
                printError          : false,
                waiting             : false,
                mode                : mode.PREVIEW,
                directoryContent    : {},
                cameraImageUrl      : '',
                selectedFileName    : '',
                currentStatus       : DeviceConstants.READY
            };
        },

        componentWillMount: function() {
            var self = this;
                opts = {
                    onError: function(data) {
                        console.log('error', data);
                    },
                    onReady: function() {
                        self.setState({ waiting: false });
                    }
                };

            pathArray   = [];
            controller  = this.props.controller;
            lang        = this.props.lang.monitor;
            previewUrl  = this.props.previewUrl;

            this._startReport();
        },

        componentDidMount: function() {
            AlertStore.onRetry(this._handleRetry);
            AlertStore.onCancel(this._handleCancel);
            this._addHistory();
        },

        componentWillUnmount: function() {
            DeviceMaster.stopCamera();
            clearInterval(reporter);
            history = [];
        },

        _closeConnection: function(c) {
            if(typeof c !== 'undefined') { c.connection.close(false); }
        },

        _hasFCode: function() {
            return this.props.fCode instanceof Blob;
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
            // if(id === _id) {
            //     this.props.onClose();
            // }
        },

        _handleBrowseFile: function() {
            DeviceMaster.stopCamera();
            this._retrieveList('');
            filesInfo = [];
            pathArray = [];
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
                DeviceMaster.stop().then(function() {
                    this._startReport();
                }.bind(this));
                return;
            }
            pathArray.pop();
            this._retrieveList(pathArray.join('/'));
        },

        _handleBack: function() {
            var self = this;
            if(history.length > 1) {
                history.pop();
            }
            lastAction = history[history.length - 1];
            var actions = {

                'PREVIEW' : function() {
                    // get file preview image uri
                    // previewUrl = URL.createObjectURL(self.props.fCode);
                },

                'BROWSE_FILE': function() {

                    pathArray = lastAction.path;

                    // pathArray.pop();
                    console.log('browsing folder', pathArray.join('/'));
                    self._retrieveList(pathArray.join('/'));
                },

                'CAMERA': function() {

                }
            };

            if(actions[lastAction.mode]) {
                console.log('processing mode: ' + lastAction.mode + ' path: ' + lastAction.path.join('/'));
                actions[lastAction.mode]();
                this.setState({ mode: lastAction.mode });
            }
        },

        _handleScroll: function(e) {
            if(this.state.mode === mode.BROWSE_FILE) {
                var onNeedData = e.target.scrollHeight === e.target.offsetHeight + e.target.scrollTop;
                if(onNeedData) {
                    start = start + scrollSize;
                    this._retrieveList(pathArray.join('/'));
                }
            }
        },

        _handleSelectFile: function(fileName) {
            this.setState({
                selectedFileName: fileName,
                mode: mode.PREVIEW
            }, function() {
                this._addHistory();
            });
        },

        _handleTurnOnCamera: function(e) {
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
            if(this.state.currentStatus === DeviceConstants.READY) {
                var blob = this.props.fCode;
                this._stopReport();
                DeviceMaster.go(blob).then(function() {
                    this._startReport();
                }.bind(this));
                this.setState({ currentStatus: DeviceConstants.PRINTING });
            }
            else {
                DeviceMaster.resume();
            }
        },

        _handlePause: function() {
            DeviceMaster.pause();
        },

        _handleStop: function() {
            DeviceMaster.stop();
        },

        _addHistory: function() {
            history.push({
                mode: this.state.mode,
                previewUrl: previewUrl,
                path: pathArray.slice()
            });
            console.log(this.state.mode, pathArray.join('/'));
            console.log(history);
        },

        _startReport: function() {
            var self = this;

            DeviceMaster.getReport().then(function(report) {
                self._processReport(report);
            });

            reporter = setInterval(function() {
                DeviceMaster.getReport().then(function(report) {
                    self._processReport(report);
                });
            }, refreshTime);
        },

        _processReport: function(report) {
            status = report.st_label;

            if(report.error && this._isError(status)) {
                if(lastError !== report.error) {
                    lastError = report.error;

                    if(lastError === DeviceConstants.AUTH_ERROR) {
                        clearInterval(reporter);
                        DeviceMaster.setPassword('flux');
                    }
                    AlertActions.showError(lastError);
                }
            }

            if(status === DeviceConstants.ABORTED || status === DeviceConstants.COMPLETED) {
                DeviceMaster.quit();
                status = DeviceConstants.READY;
            }
            else if(status === DeviceConstants.IDLE) {
                status = DeviceConstants.READY;
            }
            else if(status === DeviceConstants.PAUSED) {
                if(report.error[0] === DeviceConstants.HEADER_OFFLINE) {
                    AlertActions.showPopupRetry(_id, lang.headerOffline);
                }
                else if (report.error[0] === DeviceConstants.HEADER_ERROR) {
                    if(report.error[1] === DeviceConstants.TILT) {
                        AlertActions.showPopupRetry(_id, lang.headerTilt);
                    }
                    else if (report.error[1] === DeviceConstants.FAN_FAILURE) {
                        AlertActions.showPopupRetry(_id, lang.fanFailure);
                    }
                    else if (report.error[1] === DeviceConstants.SHAKE) {
                        AlertActions.showPopupRetry(_id, lang.shake);
                    }
                }
                else if (report.error[0] === DeviceConstants.WRONG_HEADER) {
                    AlertActions.showPopupRetry(_id, lang.unknownHead);
                }
                else if (report.error[0] === DeviceConstants.FILAMENT_RUNOUT) {
                    AlertActions.showPopupRetry(_id, lang.filamentRunout);
                }
            }
            else {
                status = report.st_label;
            }

            this.setState({
                temperature: report.rt,
                targetTemperature: report.tt,
                currentStatus: status
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
                currentLevelFiles = result.files;
                self._retrieveFileInfo(path).then(function(info) {
                    filesInfo = filesInfo.concat(info);
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
            var self = this,
                opt = {};
            if(startIndex <= endIndex) {
                DeviceMaster.fileInfo(path, currentLevelFiles[startIndex], opt).then(function(r) {
                    returnArray.push(r);
                    return self._iterateFileInfo(path, startIndex + 1, endIndex, returnArray, callback);
                });
            }
            else {
                callback(returnArray);
            }

            opt.onError = function(error) {
                console.log('error happened', error);
            };
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
                    <div className="folder" onClick={this._handleSelectFolder.bind(this, item)}>
                        <div className="name">{item}</div>
                    </div>
                );
            }.bind(this));

            files = filesInfo.map(function(item) {
                var imgSrc = URL.createObjectURL(item[1]) || 'http://placehold.it/60x60',
                    fileNameClass = ClassNames('name', {'selected': self.state.selectedFileName === item[0]});

                return (
                    <div title={item[0]} className="file" onClick={self._handleSelectFile.bind(null, item[0])}>
                        <div className="image-wrapper">
                            <img src={imgSrc} />
                        </div>
                        <div className={fileNameClass}>{item[0]}</div>
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
                commands,
                action;

            // console.log('current status is', this.state.currentStatus);

            go = (
                <div className="controls center" onClick={self._handleGo}>
                    <div className="icon"><i className="fa fa-play fa-2x"></i></div>
                    <div className="description">{lang.go}</div>
                </div>
            );

            pause = (
                <div className="controls center" onClick={self._handlePause}>
                    <div className="icon"><i className="fa fa-pause fa-2x"></i></div>
                    <div className="description">{lang.pause}</div>
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

            operation = (
                <div className="operation">
                    <div className="controls left" onClick={this._handleStop}>
                        <div className="icon"><i className="fa fa-stop fa-2x"></i></div>
                        <div className="description">{lang.stop}</div>
                    </div>
                    {action}
                    <div className="controls right">
                        <div className="icon"><i className="fa fa-circle fa-2x"></i></div>
                        <div className="description">{lang.record}</div>
                    </div>
                </div>
            );

            wait = (<div className="wait">{lang.connecting}</div>);

            return operation;// this.props.controllerStatus === DeviceConstants.CONNECTED ? operation : wait;
        },

        render: function() {

            var name        = DeviceMaster.getSelectedDevice().name,
                content     = this._renderContent(),
                waitIcon    = this.state.waiting ? this._renderSpinner() : '',
                operation   = this._renderOperation(),
                subClass    = ClassNames('sub', {'hide': false }),
                temperature = this.state.temperature ? (this.state.temperature + ' / ' + this.state.targetTemperature) : '';

            return (
                <div className="flux-monitor">
                    <div className="main">
                        <div className="header">
                            <div className="title">
                                <span>{name}</span>
                                <div className="close" onClick={this._handleClose}>
                                    <div className="x"></div>
                                </div>
                                <div className="back" onClick={this._handleBack}>
                                    <i className="fa fa-angle-left"></i>
                                </div>
                            </div>
                        </div>
                        <div className="body">
                            <div className="content" onScroll={this._handleScroll}>
                                {/*<div className="close"></div>*/}
                                {content}
                                {waitIcon}
                            </div>
                        </div>
                        {operation}
                    </div>
                    <div className={subClass}>
                        <div className="wrapper">
                            <div className="row">
                                <div className="head-info">
                                    3D PRINTER
                                </div>
                                <div className="status right">
                                    {this.state.currentStatus}
                                </div>
                            </div>
                            <div className="row">
                                <div className="temperature">{temperature} &#8451;</div>
                                <div className="time-left right">1 hour 30 min</div>
                            </div>
                        </div>
                        <div className="actions center">
                            <a className="btn filament">{lang.change_filament}</a>
                            <a className="btn file" onClick={this._handleBrowseFile}>{lang.browse_file}</a>
                            <a className="btn monitor" onClick={this._handleTurnOnCamera}>{lang.monitor}</a>
                        </div>
                    </div>
                </div>
            );
        }

    });
});
