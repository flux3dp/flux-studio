define([
    'jquery',
    'react',
    'plugins/classnames/index',
    'helpers/api/control',
    'helpers/api/3d-scan-control'
], function($, React, ClassNames, control, scanControl, director) {
    'use strict';

    var controller,
        scanController,
        pathArray,
        start,
        scrollSize = 10,
        currentLevelFiles = [],
        filesInfo = [],
        cameraSource,
        remote,
        report;

    var mode = {
        preview: 1,
        browse_file: 2,
        camera: 3
    };

    var opts = {
        onError: function(data) {

        },
        onReady: function() {

        }
    };

    var status = {
        ready   : 0,
        printing: 1,
        paused  : 2
    };

    return React.createClass({

        propTypes: {
            lang            : React.PropTypes.object,
            onClose         : React.PropTypes.func,
            selectedPrinter : React.PropTypes.object,
            previewUrl      : React.PropTypes.string,
            fcode           : React.PropTypes.object,
            controller      : React.PropTypes.object
        },

        getInitialState: function() {
            return {
                desiredTemperature  : 280,
                currentTemperature  : 0,
                printingProgress    : 0,
                printStatus         : false,
                printError          : false,
                waiting             : false,
                mode                : mode.preview,
                directoryContent    : {},
                cameraImageUrl      : '',
                selectedFileName    : '',
                currentStatus       : status.ready,
                printerStatus       : ''
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

            pathArray = [];
            controller = this.props.controller;
        },

        componentWillUnmount: function() {
            if(cameraSource) { cameraSource.stop(); }
            this._closeConnection(scanController);
        },

        _closeConnection: function(c) {
            if(typeof c !== 'undefined') { c.connection.close(false); }
        },

        _handleClose: function() {
            this.props.onClose();
        },

        _handleBrowseFile: function() {
            this._closeConnection(scanController);
            this._retrieveList('');
            filesInfo = [];
            this.setState({
                mode: mode.browse_file,
                waiting: true
            });
        },

        _handleSelectFile: function(pathName) {
            var dir = this.state.directoryContent.directories;
            // if it's a directory
            if(dir.some(function(d) {
                return d === pathName;
            })) {
                pathArray.push(pathName);
                start = 0;
                this._retrieveList(pathArray.join('/'));
                this.setState({ waiting: true });
            }
            else {

            }
        },

        _handleBrowseUpLevel: function() {
            if(pathArray.length === 0) {
                this.setState({ mode: mode.preview });
                return;
            }
            pathArray.pop();
            this._retrieveList(pathArray.join('/'));
        },

        _handleScroll: function(e) {
            if(this.state.mode === mode.brwose_file) {
                var onNeedData = e.target.scrollHeight === e.target.offsetHeight + e.target.scrollTop;
                if(onNeedData) {
                    start = start + scrollSize;
                    this._retrieveList(pathArray.join('/'));
                }
            }
        },

        _handleFileSelect: function(fileName) {
            this.setState({ selectedFileName: fileName });
        },

        _handleTurnOnCamera: function(e) {
            var self = this,
                opts = {
                onReady: function() {
                    self.setState({
                        mode: mode.camera
                    });
                    cameraSource = scanController.getImage(self._processImage);
                },
                onError: function() {

                }
            };

            scanController = scanControl(this.props.selectedPrinter.serial, opts);
            this.setState({ waiting: true });
        },

        _handleGo: function() {
            if(this.state.currentStatus === status.ready) {
                var blob = this.props.fCode;
                remote = controller.upload(blob.size, blob, {
                    onFinished: function(result) {
                        console.log(result);
                    }
                });
                this.setState({ currentStatus: status.printing }, function() {
                    this._startReport();
                });
            }
            else {
                this.setState({ currentStatus: status.printing }, function() {
                    remote.resume();
                });
            }
        },

        _handlePause: function() {
            this.setState({ currentStatus: status.paused }, function() {
                remote.pause();
            });
        },

        _handleStop: function() {
            controller.abort();
            controller.quit().then(function() {
                this._stopReport();
                this.setState({ currentStatus: status.ready });
            }.bind(this));
        },

        _startReport: function() {
            var self = this;
            report = setInterval(function() {
                controller.report({
                    onFinished: function(data) {
                        self._processReport(data);
                    }
                });
            }, 5000);
        },

        _processReport: function(data) {
            var _data = data.replace(/NaN/g, ''),
                printer = JSON.parse(_data);

            this.setState({
                temperature: printer.rt,
                printerStatus: printer.st_label
            });
        },

        _stopReport: function() {
            clearInterval(report);
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

            controller.ls(path).then(function(result) {
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
            if(startIndex < endIndex) {
                controller.fileInfo(path, currentLevelFiles[startIndex], opt).then(function(r) {
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
                    <div className="folder" onDoubleClick={this._handleSelectFile.bind(this, item)}>
                        <div className="name">{item}</div>
                    </div>
                );
            }.bind(this));

            files = filesInfo.map(function(item) {
                var imgSrc = URL.createObjectURL(item[1]) || 'http://placehold.it/60x60',
                    fileNameClass = ClassNames('name', {'selected': self.state.selectedFileName === item[0]});

                return (
                    <div className="file" onClick={self._handleFileSelect.bind(null, item[0])}>
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
            )
        },

        _renderSpinner: function() {
            return (
                <div className="spinner-wrapper">
                    <div className="spinner-flip"/>
                </div>
            );
        },

        _renderContent: function() {
            if(this.state.mode !== mode.camera) {
                if(cameraSource) {
                    cameraSource.stop();
                }
            }

            switch(this.state.mode) {
                case mode.preview:
                var divStyle = {
                        backgroundColor: '#E0E0E0',
                        backgroundImage: 'url(' + this.props.previewUrl + ')',
                        backgroundSize: 'cover',
                        backgroundPosition: '50% 50%',
                        width: '100%',
                        height: '100%'
                    };
                    return (<div style={divStyle} />);
                    break;

                case mode.browse_file:
                    return this._renderDirectoryContent(this.state.directoryContent);
                    break;

                case mode.camera:
                    return this._renderCameraContent();
                    break;

                default:
                    return '';
                    break;
            }
        },

        _renderCommand: function() {
            var self = this;
            var commands = {
                '0': function() {
                    return (
                        <div className="controls center" onClick={self._handleGo}>
                            <div className="icon"><i className="fa fa-play fa-2x"></i></div>
                            <div className="description">GO</div>
                        </div>
                    );
                },

                '1': function() {
                    return (
                        <div className="controls center" onClick={self._handlePause}>
                            <div className="icon"><i className="fa fa-pause fa-2x"></i></div>
                            <div className="description">PAUSE</div>
                        </div>
                    );
                },

                '2': function() {
                    return (
                        <div className="controls center" onClick={self._handleGo}>
                            <div className="icon"><i className="fa fa-play fa-2x"></i></div>
                            <div className="description">GO</div>
                        </div>
                    );
                },
            }

            if(typeof commands[this.state.currentStatus] !== 'function') {
                throw new Error('Invalid Status');
            }

            return commands[this.state.currentStatus]();
        },

        render: function() {
            var lang        = this.props.lang.monitor,
                content     = this._renderContent(),
                waitIcon    = this.state.waiting ? this._renderSpinner() : '',
                command     = this._renderCommand();

            return (
                <div className="flux-monitor">
                    <div className="main">
                        <div className="header">
                            <div className="title">
                                <span>Someone's Flux</span>
                                <div className="close" onClick={this._handleClose}>
                                    <div className="x"></div>
                                </div>
                                <div className="back" onClick={this._handleBrowseUpLevel}>
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
                        <div className="operation">
                            <div className="controls left" onClick={this._handleStop}>
                                <div className="icon"><i className="fa fa-stop fa-2x"></i></div>
                                <div className="description">STOP</div>
                            </div>
                            {command}
                            <div className="controls right">
                                <div className="icon"><i className="fa fa-circle fa-2x"></i></div>
                                <div className="description">RECORD</div>
                            </div>
                        </div>
                    </div>
                    <div className="sub">
                        <div className="wrapper">
                            <div className="row">
                                <div className="head-info">
                                    3D PRINTER
                                </div>
                                <div className="status right">
                                    {this.state.printerStatus}
                                </div>
                            </div>
                            <div className="row">
                                <div className="temperature">{this.state.temperature}</div>
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
