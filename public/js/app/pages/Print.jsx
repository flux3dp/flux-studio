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
    'helpers/nwjs/menu-factory',
    'helpers/device-master',
    'app/stores/global-store',
    'app/actions/global-actions',
    'app/constants/device-constants',
    'app/app-settings',
    'helpers/object-assign'
], function(
    $,
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
    PrinterSelector,
    menuFactory,
    DeviceMaster,
    GlobalStore,
    GlobalActions,
    DeviceConstants,
    AppSettings
) {

    return function(args) {
        args = args || {};

        var advancedSettings = {},
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
            _mode = 'size',
            lang = args.state.lang,
            selectedPrinter,
            printerController,
            $importBtn,
            nwjsMenu = menuFactory.items,
            view = React.createClass({

                getInitialState: function() {
                    var s1 = Config().read('advanced-settings');
                    if(!s) {
                        advancedSettings = {};
                        advancedSettings.custom = AppSettings.custom;
                    }
                    else {
                        advancedSettings = s1;
                    }

                    return ({
                        showPreviewModeList         : false,
                        showAdvancedSettings        : false,
                        modelSelected               : null,
                        openPrinterSelectorWindow   : false,
                        openObjectDialogue          : false,
                        openWaitWindow              : false,
                        openImportWindow            : true,
                        isTransforming              : false,
                        hasOutOfBoundsObject        : false,
                        hasObject                   : false,
                        raftOn                      : advancedSettings.raft === 1,
                        supportOn                   : advancedSettings.support_material === 1,
                        previewLayerCount           : 0,
                        progressMessage             : '',
                        fcode                       : {},
                        objectDialogueStyle         : {},
                        camera                      : {},
                        rotation                    : {},
                        scale                       : {},
                        printerControllerStatus     : ''
                    });
                },

                componentDidMount: function() {
                    director.init(this);
                    $(document).keydown(function(e) {
                        if(e.metaKey && e.keyCode === 8 || e.keyCode === 46) {
                            director.removeSelected();
                        }
                    });

                    $importBtn = this.refs.importBtn.getDOMNode();

                    nwjsMenu.import.enabled = true;
                    nwjsMenu.import.onClick = function() { $importBtn.click(); };
                    nwjsMenu.saveGCode.onClick = this._handleDownloadGCode;
                },

                _handleSpeedChange: function(speed) {
                    director.setParameter('printSpeed', speed);
                },

                _handleRaftClick: function() {
                    var isOn = !this.state.raftOn;
                    director.setParameter('raft', isOn ? '1' : '0');
                    advancedSettings.raft = isOn ? 1 : 0;
                    this.setState({ raftOn: isOn });
                    this._handleApplyAdvancedSetting();
                },

                _handleSupportClick: function() {
                    var isOn = !this.state.supportOn;
                    director.setParameter('support', isOn ? '1' : '0');
                    advancedSettings.support_material = isOn ? 1 : 0;
                    this.setState({ supportOn: isOn });
                    this._handleApplyAdvancedSetting();
                },

                _handleToggleAdvancedSettingPanel: function() {
                    this.setState({ showAdvancedSettings: !this.state.showAdvancedSettings });
                },

                _handleGoClick: function() {
                    this.setState({
                        openPrinterSelectorWindow: true
                    });
                    director.clearSelection();
                    this._handleApplyAdvancedSetting();
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
                    this.setState({ showAdvancedSettings: false });
                },

                _handleApplyAdvancedSetting: function(setting) {
                    console.log('applying ad setting');
                    setting = setting || advancedSettings;
                    Config().write('advanced-settings', JSON.stringify(setting));
                    advancedSettings = setting;
                    return director.setAdvanceParameter(setting);
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
                        this.setState({ openWaitWindow: true });
                        director.downloadGCode().then(() => {
                            this.setState({ openWaitWindow: false });
                        });
                    }
                },

                _handleDownloadFCode: function() {
                    if(director.getModelCount() !== 0) {
                        this.setState({ openWaitWindow: true });
                        director.downloadFCode().then(() => {
                            this.setState({ openWaitWindow: false });
                        });
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

                    director.getFCode().then(function(fcode, previewUrl) {
                        GlobalActions.showMonitor(selectedPrinter, fcode, previewUrl);
                        this.setState({
                            openPrinterSelectorWindow: false
                        });
                    }.bind(this));

                    // DeviceMaster.selectDevice(selectedPrinter).then(function(status) {
                    //     if(status === DeviceConstants.CONNECTED) {
                    //         this.setState({ printerControllerStatus: status });
                    //     }
                    //     else if (status === DeviceConstants.TIMEOUT) {
                    //         AlertActions.showPopupError(_id, _lang.message.connectionTimeout);
                    //     }
                    // }.bind(this));
                },

                _handlePreviewLayerChange: function(targetLayer) {
                    director.changePreviewLayer(targetLayer);
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
                    this.setState({ mode: mode });
                    if(mode === 'rotate') {
                        director.setRotateMode();
                    }
                    else {
                        director.setScaleMode();
                    }
                },

                _handleQualitySelected: function(level) {
                    var quality = {
                        high: 0.1,
                        med: 0.2,
                        low: 0.3
                    };
                    director.setParameter('layer_height', quality[level]);
                    advancedSettings.layer_height = quality[level];
                },

                _renderAdvancedPanel: function() {
                    var content = (
                        <AdvancedPanel
                            lang        = {lang}
                            setting     = {advancedSettings}
                            onClose     = {this._handleCloseAdvancedSetting}
                            onApply     = {this._handleApplyAdvancedSetting} />
                    );

                    return (
                        <Modal content={content} onClose={this._handleCloseAdvancedSetting}/>
                    );
                },

                _renderPrinterSelectorWindow: function() {
                    var content = (
                        <PrinterSelector
                            uniqleId="print"
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
                                <div title={lang.print.importTitle} className="file-importer">
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
                            hasObject                   = {this.state.hasObject}
                            previewLayerCount           = {this.state.previewLayerCount}
                            raftOn                      = {this.state.raftOn}
                            supportOn                   = {this.state.supportOn}
                            onQualitySelected           = {this._handleQualitySelected}
                            onRaftClick                 = {this._handleRaftClick}
                            onSupportClick              = {this._handleSupportClick}
                            onPreviewClick              = {this._handlePreview}
                            onPreviewLayerChange        = {this._handlePreviewLayerChange}
                            onShowAdvancedSettingPanel  = {this._handleToggleAdvancedSettingPanel} />
                    );
                },

                _renderRightPanel: function() {
                    return (
                        <RightPanel
                            lang                    = {lang}
                            camera                  = {this.state.camera}
                            hasObject               = {this.state.hasObject}
                            hasOutOfBoundsObject    = {this.state.hasOutOfBoundsObject}
                            onGoClick               = {this._handleGoClick}
                            onDownloadGCode         = {this._handleDownloadGCode}
                            onCameraPositionChange  = {this._handleCameraPositionChange}
                            onDownloadFCode         = {this._handleDownloadFCode} />
                    );
                },

                _renderObjectDialogue: function() {
                    return (
                        <ObjectDialogue
                            lang            = {lang}
                            model           = {this.state.modelSelected}
                            style           = {this.state.objectDialogueStyle}
                            mode            = {_mode}
                            isTransforming  = {this.state.isTransforming}
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

                _renderNwjsMenu: function() {
                    nwjsMenu.saveGCode.enabled = this.state.hasObject;
                },

                render: function() {
                    var advancedPanel           = this.state.showAdvancedSettings ? this._renderAdvancedPanel() : '',
                        importWindow            = this.state.openImportWindow ? this._renderImportWindow() : '',
                        leftPanel               = this._renderLeftPanel(),
                        rightPanel              = this._renderRightPanel(),
                        objectDialogue          = this.state.openObjectDialogue ? this._renderObjectDialogue() : '',
                        printerSelectorWindow   = this.state.openPrinterSelectorWindow ? this._renderPrinterSelectorWindow() : '',
                        waitWindow              = this.state.openWaitWindow ? this._renderWaitWindow() : '',
                        progressWindow          = this.state.progressMessage ? this._renderProgressWindow() : '';

                    this._renderNwjsMenu();

                    return (
                        <div className="studio-container print-studio">

                            {importWindow}

                            {leftPanel}

                            {rightPanel}

                            {objectDialogue}

                            {printerSelectorWindow}

                            {advancedPanel}

                            {waitWindow}

                            {progressWindow}

                            <div id="model-displayer" className="model-displayer">
                                <div className="import-indicator"></div>
                            </div>
                            <input className="hide" ref="importBtn" type="file" accept=".stl" onChange={this._handleImport} />
                        </div>
                    );
                }
            });

        return view;
    };
});
