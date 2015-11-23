define([
    'jquery',
    'react',
    'helpers/display',
    'app/actions/print',
    'jsx!widgets/Radio-Group',
    'plugins/classnames/index',
    'jsx!views/print/Advanced',
    'jsx!views/print/Left-Panel',
    'jsx!views/print/Right-Panel',
    'jsx!views/print/Monitor',
    'jsx!views/print/Object-Dialogue',
    'helpers/file-system',
    'helpers/api/control',
    'jsx!widgets/Modal',
    'helpers/api/config',
    'jsx!views/Print-Selector',
    'plugins/knob/jquery.knob'
], function($,
    React,
    display,
    director,
    RadioGroupView,
    ClassNames,
    AdvancedPanel,
    LeftPanel,
    RightPanel,
    Monitor,
    ObjectDialogue,
    FileSystem,
    PrinterController,
    Modal,
    Config,
    PrinterSelector) {

    return function(args) {
        args = args || {};

        var advancedSetting = {
                infill: 0,
                layerHeight: 0,
                travelingSpeed: 0,
                extrudingSpeed: 0,
                temperature: 0,
                support: '',
                advancedSettings: ' '
            },
            _scale = {
                locked  : true,
                x       : 1,
                y       : 1,
                z       : 1
            },

            _size = {
                locked  : true,
                x       : 0,
                y       : 0,
                z       : 0
            },
            _rotation = {
                x: 0,
                y: 0,
                z: 0
            },
            _mode = 'scale',
            lang = args.state.lang,
            selectedPrinter,
            printerController,
            view = React.createClass({

                getInitialState: function() {
                    return ({
                        checked                     : false,
                        previewMode                 : false,
                        showPreviewModeList         : false,
                        showAdvancedSetting         : false,
                        showMonitor                 : false,
                        modelSelected               : null,
                        openPrinterSelectorWindow   : false,
                        openObjectDialogue          : false,
                        openWaitWindow              : false,
                        openImportWindow            : true,
                        sliderMax                   : 1,
                        sliderValue                 : 0,
                        progressMessage             : '',
                        fcode                       : {},
                        objectDialogueStyle         : {},
                        camera                      : {},
                        rotation                    : {},
                        scale                       : {},
                        previewUrl                  : ''
                    });
                },

                componentDidMount: function() {
                    director.init(this);
                    Config().read('advanced-options', {
                        onFinished: function(response) {
                            var options = JSON.parse(response || '{}');
                            if(!$.isEmptyObject(options)) {
                                advancedSetting = options;
                            }
                        }
                    });

                    $(document).keydown(function(e) {
                        if(e.metaKey && e.keyCode === 8 || e.keyCode === 46) {
                            director.removeSelected();
                        }
                    });
                },

                _handleSpeedChange: function(speed) {
                    director.setParameter('printSpeed', speed);
                },

                _handleRaftClick: function(state) {
                    director.setParameter('raft', state ? '1' : '0');
                },

                _handleSupportClick: function(state) {
                    director.setParameter('support', state ? '1' : '0');
                },

                _handleToggleAdvancedSettingPanel: function() {
                    this.setState({ showAdvancedSetting: !this.state.showAdvancedSetting });
                },

                _handlePrintClick: function() {
                    this.setState({
                        openPrinterSelectorWindow: true
                    });
                    director.clearSelection();
                },

                _handleRotationChange: function(src) {
                    var axis = src.target.id;
                    _rotation[axis] = src.type === 'blur' && !$.isNumeric(src.target.value) ? 0 : src.target.value;
                    director.setRotation(_rotation.x, _rotation.y, _rotation.z, true);
                },

                _handleResetRotation: function() {
                    _rotation.x = 0;
                    _rotation.y = 0;
                    _rotation.z = 0;
                    this.setState({ rotation: _rotation });
                    director.setRotation(0, 0, 0, true);
                },

                _handleScaleChange: function(src) {
                    var axis = src.target.id;
                    _scale[axis] = src.type === 'blur' && !$.isNumeric(src.target.value) ? 1 : src.target.value;
                    director.setScale(scale.x, scale.y, scale.z, scale.locked, true);
                },

                _handleToggleScaleLock: function(isLocked) {
                    _scale.locked = isLocked;
                },

                _handleResize: function(size, isLocked) {
                    director.setSize(size.x, size.y, size.z, isLocked);
                },

                _handleResetScale: function() {
                    director.setScale(1, 1, 1, true);
                },

                _handleCloseAdvancedSetting: function() {
                    this.setState({ showAdvancedSetting: false });
                },

                _handleApplyAdvancedSetting: function(setting) {
                    advancedSetting = setting;
                    director.setAdvanceParameter(setting);
                    this.setState({ showAdvancedSetting: false });
                },

                _handleShowMonitor: function(e) {

                },

                _handleTogglePrintPause: function(printPaused) {
                    console.log(printPaused ? 'print paused' : 'continue printing');
                },

                _handlePrintCancel: function(e) {
                },

                _handlePrintRestart: function(e) {
                },

                _handleImport: function(e) {
                    var files = e.target.files;
                    for (var i = 0; i < files.length; i++) {
                        (function(file) {
                            FileSystem.writeFile(
                                file,
                                {
                                    onComplete: function(e, fileEntry) {
                                        director.appendModel(fileEntry, file);
                                    }
                                }
                            );
                        })(files.item(i));
                    }
                    e.target.value = null;
                },

                _handleDownloadGCode: function() {
                    if(director.getModelCount() !== 0) {
                        var fileName = prompt(lang.print.download_prompt);
                        if(fileName === null) {
                            return;
                        }
                        else {
                            // fileName += '.gcode';
                            this.setState({ openWaitWindow: true });
                            director.downloadGCode(fileName).then(() => {
                                this.setState({ openWaitWindow: false });
                            });
                        }
                    }
                },

                _handleDownloadFCode: function() {
                    if(director.getModelCount() !== 0) {
                        var fileName = prompt(lang.print.download_prompt);
                        if(fileName === null) {
                            return;
                        }
                        else {
                            // fileName += '.gcode';
                            this.setState({ openWaitWindow: true });
                            director.downloadFCode(fileName).then(() => {
                                this.setState({ openWaitWindow: false });
                            });
                        }
                    }
                },

                _handlePreview: function(isOn) {
                    director.togglePreview(isOn);
                },

                _handlePrinterSelectorWindowClose: function() {
                    this.setState({ openPrinterSelectorWindow: false });
                },

                _handlePrinterSelected: function(printer) {
                    selectedPrinter = printer;

                    director.getFCode().then(function(fcode) {
                        this.setState({
                            openPrinterSelectorWindow: false,
                            showMonitor: true,
                            fcode: fcode
                        });
                    }.bind(this));

                    printerController = PrinterController(selectedPrinter.uuid);
                },

                _handlePreviewLayerChange: function(e) {
                    director.changePreviewLayer(e.target.value);
                    this.setState({ sliderValue: e.target.value });
                },

                _handleCameraPositionChange: function(position, rotation) {
                    director.setCameraPosition(position, rotation);
                },

                _handleMonitorClose: function() {
                    this.setState({
                        showMonitor: false
                    });
                },

                _handleModeChange: function(mode) {
                    console.log(mode);
                    this.setState({ mode: mode });
                    if(mode === 'rotate') {
                        director.setRotateMode();
                    }
                    else {
                        director.setScaleMode();
                    }
                },

                _handleQualitySelected: function(quality) {

                },

                _renderAdvancedPanel: function() {
                    return (
                        <AdvancedPanel
                            lang        = {lang}
                            setting     = {advancedSetting}
                            onClose     = {this._handleCloseAdvancedSetting}
                            onApply     = {this._handleApplyAdvancedSetting} />
                    );
                },

                _renderPrinterSelectorWindow: function() {
                    var content = (
                        <PrinterSelector
                            lang={lang}
                            onClose={this._handlePrinterSelectorWindowClose}
                            onGettingPrinter={this._handlePrinterSelected} />
                    );
                    return (
                        <Modal {...this.props}
                            content={content}
                            onClose={this._handlePrinterSelectorWindowClose} />
                    );
                },

                _renderImportWindow: function() {
                    return (
                        <div className="importWindow">
                            <div className="arrowBox">
                                <div className="file-importer">
                                    <div className="import-btn">{lang.print.import}</div>
                                    <input type="file" accept=".stl" onChange={this._handleImport} />
                                </div>
                            </div>
                        </div>
                    );
                },

                _renderLeftPanel: function() {
                    return (
                        <LeftPanel
                            lang                        = {lang}
                            onQualitySelected           = {this._handleQualitySelected}
                            onRaftClick                 = {this._handleRaftClick}
                            onSupportClick              = {this._handleSupportClick}
                            onShowAdvancedSettingPanel  = {this._handleToggleAdvancedSettingPanel} />
                    );
                },

                _renderRightPanel: function() {
                    return (
                        <RightPanel
                            lang                    = {lang}
                            camera                  = {this.state.camera}
                            onPreviewClick          = {this._handlePreview}
                            onPrintClick            = {this._handlePrintClick}
                            onDownloadGCode         = {this._handleDownloadGCode}
                            onCameraPositionChange  = {this._handleCameraPositionChange}
                            onDownloadFCode         = {this._handleDownloadFCode} />
                    );
                },

                _renderMonitorPanel: function() {
                    var content = (
                        <Monitor
                            lang            = {lang}
                            previewUrl      = {this.state.previewUrl}
                            selectedPrinter = {selectedPrinter}
                            fCode           = {this.state.fcode}
                            controller      = {printerController}
                            onClose         = {this._handleMonitorClose} />
                    );
                    return (
                        <Modal {...this.props}
                            content={content}
                            onClose={this._handleMonitorClose} />
                    );
                },

                _renderObjectDialogue: function() {
                    return (
                        <ObjectDialogue
                            lang            = {lang}
                            model           = {this.state.modelSelected}
                            style           = {this.state.objectDialogueStyle}
                            mode            = {_mode}
                            scaleLocked     = {_scale.locked}
                            onRotate        = {this._handleRotationChange}
                            onResize        = {this._handleResize}
                            onScaleLock     = {this._handleToggleScaleLock}
                            onModeChange    = {this._handleModeChange} />
                    );
                },

                _renderWaitWindow: function() {
                    var spinner = <div className="spinner-flip spinner-reverse"/>;
                    return (
                        <Modal content={spinner} />
                    );
                },

                _renderPreviewWindow: function() {
                    return (
                        <div className="previewPanel">
                            <input className="range" type="range" value={this.state.sliderValue} min="0" max={this.state.sliderMax} onChange={this._handlePreviewLayerChange} />
                            <div>
                                {this.state.sliderValue}
                            </div>
                        </div>
                    );
                },

                _renderProgressWindow: function() {
                    var content = (
                        <div className="progressWindow">
                            <div className="message">
                                {this.state.progressMessage}
                            </div>
                            <div className="spinner-flip spinner-reverse"/>
                        </div>
                    );
                    return (
                        <Modal content={content} />
                    );
                },

                render: function() {
                    var advancedPanel           = this.state.showAdvancedSetting ? this._renderAdvancedPanel() : '',
                        importWindow            = this.state.openImportWindow ? this._renderImportWindow() : '',
                        leftPanel               = this._renderLeftPanel(),
                        rightPanel              = this._renderRightPanel(),
                        monitorPanel            = this.state.showMonitor ? this._renderMonitorPanel() : '',
                        objectDialogue          = this.state.openObjectDialogue ? this._renderObjectDialogue() : '',
                        printerSelectorWindow   = this.state.openPrinterSelectorWindow ? this._renderPrinterSelectorWindow() : '',
                        waitWindow              = this.state.openWaitWindow ? this._renderWaitWindow() : '',
                        previewWindow           = this.state.previewMode ? this._renderPreviewWindow() : '',
                        progressWindow          = this.state.progressMessage ? this._renderProgressWindow() : ''

                    return (
                        <div className="studio-container print-studio">

                            {importWindow}

                            {leftPanel}

                            {rightPanel}

                            {monitorPanel}

                            {objectDialogue}

                            {printerSelectorWindow}

                            {advancedPanel}

                            {waitWindow}

                            {previewWindow}

                            {progressWindow}

                            <div id="model-displayer" className="model-displayer">
                                <div className="import-indicator"></div>
                            </div>
                        </div>
                    );
                }
            });

        return view;
    };
});
