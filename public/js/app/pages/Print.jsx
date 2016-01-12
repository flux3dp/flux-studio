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
    'jsx!widgets/Tour-Guide',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'helpers/object-assign',
    'helpers/sprintf',
    'app/actions/initialize-machine',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'helpers/shortcuts',
    'app/default-print-settings'
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
    TourGuide,
    AlertActions,
    AlertStore,
    ObjectAssign,
    sprintf,
    InitializeMachine,
    ProgressActions,
    ProgressConstants,
    shortcuts,
    DefaultPrintSettings
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
            _rotation = {
                x: 0,
                y: 0,
                z: 0
            },
            lang = args.state.lang,
            selectedPrinter,
            $importBtn,
            allowDeleteObject = true,
            tutorialMode = false,
            showChangeFilament = false,
            nwjsMenu = menuFactory.items,
            tourGuide = [
                {
                    selector: '.arrowBox',
                    text: lang.tutorial.startWithFilament,
                    r: 0,
                    position: 'top'
                },
                {
                    selector: '.arrowBox',
                    text: lang.tutorial.startWithModel,
                    r: 0,
                    position: 'bottom'
                },
                {
                    selector: '.arrowBox',
                    text: lang.tutorial.clickToImport,
                    r: 105,
                    position: 'top'
                },
                {
                    selector: '.quality-select',
                    text: lang.tutorial.selectQuality,
                    offset_x: -25,
                    r: 90,
                    position: 'right'
                },
                {
                    selector: 'button.btn-go',
                    text: lang.tutorial.clickGo,
                    offset_x: 6,
                    r: 80,
                    position: 'left'
                },
                {
                    selector: '.flux-monitor .operation',
                    text: lang.tutorial.startPrint,
                    offset_y: 25,
                    r: 80,
                    position: 'top'
                },
                {
                    selector: '.flux-monitor .operation',
                    text: lang.tutorial.startPrint,
                    offset_y: 25,
                    r: 80,
                    position: 'top'
                }
            ];
            view = React.createClass({

                getInitialState: function() {
                    var _setting = Config().read('advanced-settings');

                    if(!_setting) {
                        advancedSettings = {};
                        advancedSettings.raft_layers = 4;
                        advancedSettings.support_material = 0;
                        advancedSettings.custom = DefaultPrintSettings.custom;
                    }
                    else {
                        advancedSettings = _setting;
                    }

                    if(!Config().read('tutorial-finished')){
                        tutorialMode = true;
                    }

                    return ({
                        showAdvancedSettings        : false,
                        modelSelected               : null,
                        openPrinterSelectorWindow   : false,
                        openObjectDialogue          : false,
                        openWaitWindow              : false,
                        openImportWindow            : true,
                        isTransforming              : false,
                        hasOutOfBoundsObject        : false,
                        hasObject                   : false,
                        tutorialOn                  : false,
                        leftPanelReady              : true,
                        currentTutorialStep         : 0,
                        layerHeight                 : 0.1,
                        raftOn                      : advancedSettings.raft_layers !== 0,
                        supportOn                   : advancedSettings.support_material === 1,
                        mode                        : 'scale',
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
                    var self = this;
                    director.init(this);

                    this._handleApplyAdvancedSetting();

                    // events

                    $importBtn = this.refs.importBtn.getDOMNode();

                    nwjsMenu.import.enabled = true;
                    nwjsMenu.import.onClick = function() { $importBtn.click(); };
                    nwjsMenu.saveGCode.onClick = this._handleDownloadGCode;
                    nwjsMenu.tutorial.onClick = function() {
                        self._handleTakeTutorial('tour');
                    };

                    this._registerKeyEvents();
                    if(Config().read("configured-printer") && tutorialMode){
                        //First time using, with usb-configured printer..
                        AlertActions.showPopupYesNo('set_default', sprintf(lang.tutorial.set_first_default,Config().read("configured-printer")),lang.tutorial.set_first_default_caption);
                        AlertStore.onYes(this._handleSetFirstDefault);
                        //Use setTimeout to avoid multiple modal display conflict
                        this._handleDefaultCancel = function(ans){setTimeout(function(){this._registerTutorial()}.bind(this), 10)}.bind(this);
                        AlertStore.onCancel(this._handleDefaultCancel);
                    }else{
                        //Disable for no-printer-setting at the time
                        // this._registerTutorial();
                    }
                },

                componentWillUnmount: function() {
                    director.clear();
                },

                _registerKeyEvents: function() {
                    // delete event
                    shortcuts.on(['del'], function(e) {
                        if(allowDeleteObject) {
                            director.removeSelected();
                        }
                    });

                    // copy event - it will listen by top menu as well in nwjs..
                    if ('undefined' === typeof window.requireNode) {
                        // copy event
                        shortcuts.on(['cmd', 'd'], function(e) {
                            e.preventDefault();
                            director.duplicateSelected();
                        });
                    }
                },

                _registerTutorial: function() {
                    if(tutorialMode) {
                        AlertActions.showPopupYesNo('tour', lang.tutorial.startTour);
                        AlertStore.onYes(this._handleTakeTutorial);
                        AlertStore.onCancel(this._handleCancelTutorial);
                    }
                },

                _handleSetFirstDefault: function(answer){
                    Config().write('default-printer-name', Config().read('configured-printer'));
                    ProgressActions.open(ProgressConstants.NONSTOP);

                    AlertStore.removeYesListener(this._handleSetFirstDefault);
                    AlertStore.removeCancelListener(this._handleDefaultCancel);

                    DeviceMaster.getDeviceByNameAsync(
                        Config().read('configured-printer'),
                        {
                            timeout: 20000,
                            onSuccess:
                                function(printer){
                                    ProgressActions.close();
                                    InitializeMachine.defaultPrinter.set({
                                              name: printer.name,
                                              serial: printer.serial,
                                              uuid: printer.uuid
                                    });
                                    setTimeout(function(){AlertActions.showInfo(sprintf(lang.set_default.success, printer.name))}, 100);
                                    //Start tutorial
                                    setTimeout(function(){this._registerTutorial()}.bind(this), 100);
                                }.bind(this),
                            onTimeout:
                                function(){
                                    ProgressActions.close();
                                    setTimeout(function(){AlertActions.showWarning(sprintf(lang.set_default.error, printer.name))}, 100);
                                }
                        });
                },

                _handleTakeTutorial: function(answer) {
                    if(answer === 'tour') {
                        this.setState({ tutorialOn: true });
                        tutorialMode = true;
                        console.log("start take tutorial")
                    }
                },

                _handleCancelTutorial: function(answer) {
                    if(answer === 'tour') {
                        this.setState({ tutorialOn: false });
                        tutorialMode = false;
                        Config().write('tutorial-finished', true);
                    }
                },

                _handleSpeedChange: function(speed) {
                    director.setParameter('printSpeed', speed);
                },

                _handleRaftClick: function() {
                    this.setState({ leftPanelReady: false });
                    var isOn = !this.state.raftOn;
                    director.setParameter('raft', isOn ? '1' : '0').then(function() {
                        this.setState({ leftPanelReady: true });
                    }.bind(this));
                    advancedSettings.raft_layers = isOn ? advancedSettings.raft : 0;
                    advancedSettings.custom = advancedSettings.custom.replace(
                        `raft_layers = ${isOn ? 0 : advancedSettings.raft}`,
                        `raft_layers = ${isOn ? advancedSettings.raft : 0}`);

                    this.setState({ raftOn: isOn });
                    Config().write('advanced-settings', JSON.stringify(advancedSettings));
                },

                _handleSupportClick: function() {
                    this.setState({ leftPanelReady: false });
                    var isOn = !this.state.supportOn;
                    director.setParameter('support', isOn ? '1' : '0').then(function() {
                        this.setState({
                            leftPanelReady: true,
                            supportOn: isOn
                        });
                    }.bind(this));
                    advancedSettings.support_material = isOn ? 1 : 0;
                    advancedSettings.custom = advancedSettings.custom.replace(
                        `support_material = ${isOn ? 0 : 1}`,
                        `support_material = ${isOn ? 1 : 0}`);
                    // this.setState({ supportOn: isOn });
                    Config().write('advanced-settings', JSON.stringify(advancedSettings));
                },

                _handleToggleAdvancedSettingPanel: function() {
                    this.setState({ showAdvancedSettings: !this.state.showAdvancedSettings });
                },

                _handleGoClick: function() {
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
                    this.setState({ showAdvancedSettings: false });
                },

                _handleApplyAdvancedSetting: function(setting) {
                    setting = setting || advancedSettings;
                    Config().write('advanced-settings', JSON.stringify(setting));
                    Object.assign(advancedSettings, setting);
                    this.setState({
                        supportOn: setting.support_material === 1,
                        layerHeight: setting.layer_height
                    });
                    return director.setAdvanceParameter(setting);
                },

                _handleTogglePrintPause: function(printPaused) {
                    console.log(printPaused ? 'print paused' : 'continue printing');
                },

                _handleImport: function(e) {
                    var files = e.target.files;
                    director.appendModels(files, 0, () => {});
                },

                _handleDownloadGCode: function() {
                    if(director.getModelCount() !== 0) {
                        director.downloadGCode().then(() => {
                            this.setState({ openWaitWindow: false });
                        });
                    }
                },

                _handleDownloadFCode: function() {
                    if(director.getModelCount() !== 0) {
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

                _handleDeviceSelected: function(printer) {
                    selectedPrinter = printer;
                    this.setState({
                        openPrinterSelectorWindow: false
                    });
                    director.getFCode().then(function(fcode, previewUrl) {
                        if(!(fcode instanceof Blob)) {
                            AlertActions.showPopupError('', lang.print.out_of_range_message, lang.print.out_of_range);
                            return;
                        }
                        GlobalActions.showMonitor(selectedPrinter, fcode, previewUrl);
                        //Tour popout after show monitor delay
                        setTimeout(function() {
                            if(tutorialMode) {
                                this.setState({
                                    tutorialOn: true,
                                    currentTutorialStep: 6
                                });
                                //Insert into root html
                                $('.tour-overlay').append($('.tour'));
                                $('.tour').click(function(){
                                    $('.print-studio').append($('.tour'));
                                    this._handleTutorialComplete();
                                }.bind(this));
                            };
                        }.bind(this), 1000);

                    }.bind(this));
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

                _handleAdvancedValueChange: function(key, value) {
                    if(key === 'layer_height') {
                        this.setState({ layerHeight: value });
                    }
                    else if (key === 'raft_layers') {
                        this.setState({ raftOn: value !== '0' });
                    }
                },

                _handleQualitySelected: function(layerHeight) {
                    director.setParameter('layer_height', layerHeight);
                    advancedSettings.layer_height = layerHeight;
                    this.setState({ layerHeight: layerHeight });
                },

                _handleTutorialStep: function() {
                    if(!tutorialMode) { return; }
                    this.setState({ currentTutorialStep: this.state.currentTutorialStep + 1 }, function() {
                        if(this.state.currentTutorialStep === 1) {
                            var selectPrinterName = Config().read('configured-printer');
                            if(!selectPrinterName) selectPrinterName = InitializeMachine.defaultPrinter.get().name;
                            if(!selectPrinterName) selectPrinterName = DeviceMaster.getFirstDevice();
                            if(selectPrinterName){
                                DeviceMaster.getDeviceByNameAsync(
                                selectPrinterName,
                                {
                                    timeout: 20000,
                                    onSuccess:
                                        function(printer){
                                            //Found ya default printer
                                            ProgressActions.close();
                                            setTimeout(function(){AlertActions.showChangeFilament(printer, 'TUTORIAL'); }, 100);
                                        }.bind(this),
                                    onTimeout:
                                        function(){
                                            //Unable to find configured printer...
                                            ProgressActions.close();
                                            setTimeout(function(){AlertActions.showWarning(sprintf(lang.set_default.error, printer.name))}, 100);
                                        }
                                });
                            }else{
                                //TODO: No printer

                            }
                        }
                        else if(this.state.currentTutorialStep === 3) {
                            var fileEntry = {};
                            fileEntry.name = 'guide-example.stl';
                            fileEntry.toURL = function() {
                                return '/guide-example.stl';
                            };
                            var oReq = new XMLHttpRequest();
                            oReq.open('GET', '/guide-example.stl', true);
                            oReq.responseType = 'blob';

                            oReq.onload = function(oEvent) {
                                var blob = oReq.response;
                                director.appendModel(fileEntry, blob);
                            };

                            oReq.send();
                        }
                        else if (this.state.currentTutorialStep === 5) {
                            this.setState({ tutorialOn: false });
                            $('.btn-go').click();
                        }
                    });
                },

                _handleTutorialComplete: function() {
                    tutorialMode = false;
                    Config().write('tutorial-finished', true);
                    $('.tour').hide();
                    this.setState({ tutorialOn: false });
                },

                _handleCloseAllView: function() {
                    GlobalActions.closeAllView();
                },

                _handleObjectDialogueFocus: function(isFocused) {
                    allowDeleteObject = !isFocused;
                },

                _renderAdvancedPanel: function() {
                    return (
                        <AdvancedPanel
                            lang            = {lang}
                            setting         = {advancedSettings}
                            onValueChange   = {this._handleAdvancedValueChange}
                            onClose         = {this._handleCloseAdvancedSetting}
                            onApply         = {this._handleApplyAdvancedSetting} />
                    );
                },

                _renderPrinterSelectorWindow: function() {
                    var content = (
                        <PrinterSelector
                            uniqleId="print"
                            lang={lang}
                            onClose={this._handlePrinterSelectorWindowClose}
                            onGettingPrinter={this._handleDeviceSelected} />
                    );
                    return (
                        <Modal {...this.props}
                            content={content}
                            onClose={this._handlePrinterSelectorWindowClose} />
                    );
                },

                _renderImportWindow: function() {
                    var importWindowClass = ClassNames('importWindow', {'hide': !this.state.openImportWindow});
                    return (
                        <div className={importWindowClass}>
                            <div className="arrowBox" onClick={this._handleCloseAllView}>
                                <div title={lang.print.importTitle} className="file-importer">
                                    <div className="import-btn">{lang.print.import}</div>
                                    <input type="file" accept=".stl" onChange={this._handleImport} multiple />
                                </div>
                            </div>
                        </div>
                    );
                },

                _renderLeftPanel: function() {
                    return (
                        <LeftPanel
                            lang                        = {lang}
                            enable                      = {this.state.leftPanelReady}
                            hasObject                   = {this.state.hasObject}
                            hasOutOfBoundsObject        = {this.state.hasOutOfBoundsObject}
                            previewLayerCount           = {this.state.previewLayerCount}
                            raftOn                      = {this.state.raftOn}
                            supportOn                   = {this.state.supportOn}
                            layerHeight                 = {this.state.layerHeight}
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
                            mode            = {this.state.mode}
                            isTransforming  = {this.state.isTransforming}
                            scaleLocked     = {_scale.locked}
                            onRotate        = {this._handleRotationChange}
                            onResize        = {this._handleResize}
                            onScaleLock     = {this._handleToggleScaleLock}
                            onFocus         = {this._handleObjectDialogueFocus}
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
                        importWindow            = this._renderImportWindow(),
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

                            <TourGuide
                                lang={lang}
                                enable={this.state.tutorialOn}
                                guides={tourGuide}
                                step={this.state.currentTutorialStep}
                                onNextClick={this._handleTutorialStep}
                                onComplete={this._handleTutorialComplete} />

                        </div>
                    );
                }
            });

        return view;
    };
});
