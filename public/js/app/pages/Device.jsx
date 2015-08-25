define([
    'jquery',
    'react',
    'jsx!widgets/Modal',
    'jsx!views/Print-Selector',
    'helpers/api/3d-scan-control',
    'jsx!views/Message'
], function($, React, Modal, PrinterSelector, scanControl, MessageBox) {
    'use strict';

    return function(args) {
        args = args || {};

        var lang = args.state.lang,
            timer,
            view = React.createClass({
                getInitialState: function() {
                    return ({
                        selectedPrinter: {},
                        openPrinterSelectorWindow: false,
                        openErrorWindow: false,
                        cameraOn: false,
                        listFile: false
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
                _handleCameraOn: function(e) {
                    this.setState({ cameraOn: true });
                    var self = this,
                        opt = {
                            onError: function(data) {
                                console.log('error', data);
                            },
                            onReady: function() {
                                // self.setState({
                                //     printerIsReady: true
                                // });
                                //self._openBlocker(false);
                            }
                        },
                        timer = setInterval(function() {
                            var state = self.state;

                            if (state.selectedPrinter) {
                                self.setProps({
                                    scan_ctrl_websocket: scanControl(state.selectedPrinter.serial, opt)
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
                },
                _handleCancelBrowseFile: function(e) {
                    this.setState({ listFile: false });
                },
                _handlePrinterSelectionOn: function(e) {
                    this.setState({ openPrinterSelectorWindow: true });
                },
                _handleError: function(e) {
                    this.setState({ openErrorWindow: true });
                },
                _handleRetry: function(e) {
                    console.log('retry...');
                },
                _handleCloseMessageBox: function(e) {
                    this.setState({ openErrorWindow: false });
                },
                _renderPrinterSelectorWindow: function() {
                    var content = (
                        <PrinterSelector
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
                            message={"some error message"}
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
                    var printerSelectorWindow   = this.state.openPrinterSelectorWindow ? this._renderPrinterSelectorWindow() : '',
                        errorWindow = this.state.openErrorWindow ? this._renderErrorWindow() : '',
                        cameraSection = this.state.cameraOn ? this._renderCameraSection() : '',
                        fileListSection = this.state.listFile ? this._renderFileList() : '';

                    return (
                        <div className="studio-container device-studio">
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
                                <div className="span5">idle / heating / correcting / scanning ...</div>
                            </div>
                            <div className="row-fluid">
                                <div className="span6">
                                    <a className="btn btn-default" onClick={this._handleCameraOn}>{lang.device.cameraOn}</a>
                                    <a className="btn btn-default" onClick={this._handleBrowseFile}>{lang.device.browseFiles}</a>
                                    <a className="btn btn-default" onClick={this._handlePrinterSelectionOn}>{lang.device.selectPrinter}</a>
                                    <a className="btn btn-default" onClick={this._handleError}>error window</a>
                                </div>
                            </div>

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
