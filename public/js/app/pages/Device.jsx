define([
    'jquery',
    'react',
    'jsx!widgets/Modal',
    'jsx!views/Print-Selector',
    'helpers/api/3d-scan-control',
    'jsx!views/Message',
    'helpers/api/control',
], function($, React, Modal, PrinterSelector, scanControl, MessageBox, deviceControl) {
    'use strict';

    return function(args) {
        args = args || {};

        var lang = args.state.lang,
            timer,
            statusChecker,
            deviceController,
            view = React.createClass({
                getInitialState: function() {
                    return ({
                        selectedPrinter: {},
                        openPrinterSelectorWindow: false,
                        openErrorWindow: false,
                        cameraOn: false,
                        listFile: false,
                        status: lang.device.pleaseWait
                    });
                },
                componentDidMount: function() {
                    if(!this.state.selectedPrinter.name) {
                        this.setState({ openPrinterSelectorWindow: true });
                    }
                },
                componentWillUnmount: function() {
                    if ('undefined' !== typeof this.props.scan_ctrl_websocket &&
                        'undefined' !== typeof this.props.scan_modeling_websocket
                    ) {
                        this.props.scan_ctrl_websocket.connection.close(false);
                        this.props.scan_modeling_websocket.connection.close(false);
                    }
                    clearInterval(statusChecker);
                },
                _refreshCamera: function() {
                    var self = this;

                    self.setProps.call(self, {
                        scan_modeling_image_method: self.props.scan_ctrl_websocket.getImage(
                            function(image_blobs, mime_type) {
                                if(!self.refs.camera_image) return;
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
                _getStatus: function() {
                    if(deviceController)
                    {
                        var p = deviceController.getStatus();
                        p.then((result) => {
                            result = result || {};
                            this.setState({ status: this._translateStatus(result.location) });
                        });
                    }
                },
                _translateStatus: function(status) {
                    switch(status) {
                        case 'PlayTask':
                            return lang.device.busy;
                        case 'CommandTask':
                            return lang.device.ready;
                        case 'NO_TASK':
                            return lang.device.noTask;
                        case 'UNKNOW_COMMAND':
                            return lang.device.unknownCommand;
                        default:
                            return lang.device.pleaseWait;
                    }
                },
                _executeCommand: function(command) {
                    if(deviceController) {
                        var p;
                        switch (command) {
                            case 'START':
                                p = deviceController.start(); break;
                            case 'ABORT':
                                p = deviceController.abort(); break;
                            case 'RESET':
                                p = deviceController.reset(); break;
                            case 'QUIT':
                                p = deviceController.quit(); break;
                            default: break;
                        }

                        if(p) {
                            p.then((result) => {
                                if(result.status === 'error') {
                                    this.setState({
                                        errorMessage: this._translateStatus(result.error),
                                        openErrorWindow: true
                                    });
                                }
                            });
                        }
                    }
                },
                _handleCameraOn: function(e) {
                    this.setState({ cameraOn: true });
                    var self = this,
                        opt = {
                            onError: function(data) {
                                console.log('error', data);
                            },
                            onReady: function() {
                                // TODO: to be implement
                            }
                        },
                        timer = setInterval(function() {
                            var state = self.state;

                            if (state.selectedPrinter) {
                                self.setProps({
                                    scan_ctrl_websocket: scanControl(state.selectedPrinter.uuid, opt)
                                });
                                self._refreshCamera();
                                clearInterval(timer);
                            }
                        }, 1000);
                },
                _handleCameraOff: function(e) {
                    this.setState({ cameraOn: false });
                    clearInterval(timer);
                },
                _handleBrowseFile: function(e) {
                    this.setState({ listFile: true });
                },
                _handlePrinterSelectorWindowClose: function() {
                    this.setState({ openPrinterSelectorWindow: false });
                },
                _handlePrinterSelected: function(selectedPrinter) {
                    this.setState({
                        selectedPrinter: selectedPrinter,
                        openPrinterSelectorWindow: false
                    });
                    deviceController = deviceControl(this.state.selectedPrinter.uuid);
                },
                _handleCancelBrowseFile: function(e) {
                    this.setState({ listFile: false });
                },
                _handlePrinterSelectionOn: function(e) {
                    this.setState({ openPrinterSelectorWindow: true });
                },
                _handleRetry: function(e) {
                    console.log('retry...');
                },
                _handleCloseMessageBox: function(e) {
                    this.setState({ openErrorWindow: false });
                },
                _handleStart: function(e) {
                    this._executeCommand('START');
                },
                _handleAbort: function(e) {
                    this._executeCommand('ABORT');
                },
                _handleClearConnection: function(e) {
                    this._executeCommand('RESET');
                },
                _handleQuit: function(e) {
                    this._executeCommand('QUIT');
                },
                _renderInfoSection: function() {
                    return (
                        <div>
                            <div className="row-fluid">
                                <div className="span1">Device Name</div>
                                <div className="span5">{this.state.selectedPrinter.name}</div>
                            </div>
                            <div className="row-fluid">
                                <div className="span1">Mode</div>
                                <div className="span5">laser / print / scan</div>
                            </div>
                            <div className="row-fluid">
                                <div className="span1">Status</div>
                                <div className="span5">{this.state.status}</div>
                            </div>
                            <div className="row-fluid">
                                <div className="span6">
                                    <a className="btn btn-default" onClick={this._handleCameraOn}>{lang.device.cameraOn}</a>
                                    <a className="btn btn-default" onClick={this._handleBrowseFile}>{lang.device.browseFiles}</a>
                                    <a className="btn btn-default" onClick={this._handlePrinterSelectionOn}>{lang.device.selectPrinter}</a>
                                    <br/>
                                    <a className="btn btn-primary" onClick={this._handleStart}>{lang.device.start}</a>
                                    <a className="btn btn-warning" onClick={this._handleAbort}>{lang.device.abort}</a>
                                    <a className="btn btn-danger" onClick={this._handleClearConnection}>{lang.device.reset}</a>
                                    <a className="btn btn-warning" onClick={this._handleQuit}>{lang.device.quit}</a>
                                </div>
                            </div>
                        </div>
                    );
                },
                _renderPrinterSelectorWindow: function() {
                    var content = (
                        <PrinterSelector
                            uniqleId="device"
                            lang={lang}
                            onClose={this._handlePrinterSelectorWindowClose}
                            onGettingPrinter={this._handlePrinterSelected} />
                    );
                    return (
                        <Modal {...this.props} content={content} />
                    );
                },
                _renderCameraSection: function() {
                    return (
                        <div>
                            <div>
                                <img ref="camera_image" src={this.state.imageSrc} />
                            </div>
                            <div>
                                <a className="btn btn-default" onClick={this._handleCameraOff}>{lang.device.cameraOff}</a>
                                <a className="btn btn-default">{lang.device.pause}</a>
                                <a className="btn btn-default">{lang.device.cancelTask}</a>
                            </div>
                        </div>
                    );
                },
                _renderErrorWindow: function() {
                    var content = (
                        <MessageBox
                            lang={lang}
                            message={this.state.errorMessage}
                            onRetry={this._handleRetry}
                            onClose={this._handleCloseMessageBox} />
                    );
                    return (
                        <Modal {...this.props} content={content} />
                    )
                },
                _renderFileList: function() {
                    return(
                        <div className="usb">
                            <div className="usb-sidebar">
                                <div className="usb-sidebar-header">My Drive</div>
                                <div className="usb-sidebar-body">
                                    <div className="folder">
                                        <div className="folder-icon"><img src="/img/icon-folder.png" height="30px" /></div>
                                        <div className="folder-name">Folder Name</div>
                                        <div className="expand-icon"><img src="/img/icon-arrow-d.png" height="35px" /></div>
                                    </div>
                                    <div className="folder">
                                        <div className="folder-icon"><img src="/img/icon-folder.png" height="30px" /></div>
                                        <div className="folder-name">Folder Name</div>
                                        <div className="expand-icon">
                                            <img src="/img/icon-arrow-d.png" height="35px" data-target="exp" onClick={this._handleSlideToggle} /></div>
                                    </div>
                                    <div className="hide" id="exp">
                                        <div className="file level2">
                                            <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                            <div className="file-name">file1.gcode</div>
                                        </div>
                                        <div className="file level2">
                                            <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                            <div className="file-name">file2.gcode</div>
                                        </div>
                                        <div className="file level2">
                                            <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                            <div className="file-name">file3.gcode</div>
                                        </div>
                                    </div>
                                    <div className="file">
                                        <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                        <div className="file-name">file1.gcode</div>
                                    </div>
                                    <div className="file">
                                        <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                        <div className="file-name">file2.gcode</div>
                                    </div>
                                    <div className="file">
                                        <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                        <div className="file-name">file3.gcode</div>
                                    </div>
                                </div>
                                <div>
                                    <a className="btn btn-print" onClick={this._handleCancelBrowseFile}>{lang.settings.cancel}</a>
                                    <a className="btn btn-print">Print</a>
                                </div>
                            </div>
                        </div>
                    )
                },
                render: function() {
                    var infoSection             = this._renderInfoSection(),
                        printerSelectorWindow   = this.state.openPrinterSelectorWindow ? this._renderPrinterSelectorWindow() : '',
                        errorWindow             = this.state.openErrorWindow ? this._renderErrorWindow() : '',
                        cameraSection           = this.state.cameraOn ? this._renderCameraSection() : '',
                        fileListSection         = this.state.listFile ? this._renderFileList() : '';

                    return (
                        <div className="studio-container device-studio">

                            {infoSection}

                            {cameraSection}

                            {fileListSection}

                            {printerSelectorWindow}

                            {errorWindow}
                        </div>
                    )
                }
            });

        return view;
    };
});
