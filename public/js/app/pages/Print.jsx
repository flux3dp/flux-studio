define([
    'jquery',
    'react',
    'app/actions/print',
    'plugins/classnames/index',
    'jsx!views/print/Advanced',
    'jsx!views/print/Left-Panel',
    'jsx!views/print/Right-Panel',
    'jsx!views/print/Monitor',
    'jsx!views/print/Object-Dialogue',
    'jsx!widgets/Modal',
    'helpers/api/config',
    'jsx!views/Printer-Selector',
    'helpers/nwjs/menu-factory',
    'helpers/device-master',
    'app/stores/global-store',
    'app/actions/global-actions',
    'app/constants/global-constants',
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
    'helpers/packer',
    'app/default-print-settings',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants',
    'helpers/local-storage'
], function(
    $,
    React,
    director,
    ClassNames,
    AdvancedPanel,
    LeftPanel,
    RightPanel,
    Monitor,
    ObjectDialogue,
    Modal,
    Config,
    PrinterSelector,
    menuFactory,
    DeviceMaster,
    GlobalStore,
    GlobalActions,
    GlobalConstants,
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
    packer,
    DefaultPrintSettings,
    InputLightboxActions,
    InputLightboxConstants,
    LocalStorage
) {

    return function(args) {
        'use strict';

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
            listeningToCancel = false,
            defaultRaftLayer = 4,
            allowDeleteObject = true,
            tutorialMode = false,
            nwjsMenu = menuFactory.items,
            defaultSlicingEngine = 'slic3r',
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
                    selector: '',
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
            ],
            view = React.createClass({

                getInitialState: function() {
                    var _setting            = Config().read('advanced-settings'),
                        tutorialFinished    = Config().read('tutorial-finished'),
                        configuredPrinter   = Config().read('configured-printer'),
                        _raftLayers;

                    this._checkDefaultPrintSettingsVersion();

                    if(!_setting) {
                        advancedSettings = {};
                        advancedSettings.raft_layers = defaultRaftLayer;
                        advancedSettings.support_material = 0;
                        advancedSettings.custom = DefaultPrintSettings.custom;
                    }
                    else {
                        advancedSettings = _setting;
                    }

                    if(!advancedSettings.raft_layers || advancedSettings.raft_layers === '0') {
                        advancedSettings.raft_layers = defaultRaftLayer;
                    }

                    if(tutorialFinished !== 'true' && configuredPrinter !== '') {
                        tutorialMode = true;
                    }


                    _raftLayers = parseInt(this._getValueFromAdvancedCustomSettings('raft_layers'));

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
                        previewMode                 : false,
                        previewModeOnly             : false,
                        disablePreview              : false,
                        slicingPercentage           : 0,
                        currentTutorialStep         : 0,
                        layerHeight                 : 0.1,
                        raftLayers                  : _raftLayers,
                        raftOn                      : advancedSettings.custom.raft_layers !== 0,
                        supportOn                   : advancedSettings.support_material === 1,
                        mode                        : 'scale',
                        previewLayerCount           : 0,
                        progressMessage             : '',
                        fcode                       : {},
                        objectDialogueStyle         : {},
                        camera                      : {},
                        rotation                    : {},
                        scale                       : _scale,
                        printerControllerStatus     : ''
                    });
                },

                componentDidMount: function() {
                    director.init(this);

                    this._handleApplyAdvancedSetting();

                    // events

                    $importBtn = this.refs.importBtn.getDOMNode();

                    this._prepareMenu();
                    nwjsMenu.import.enabled = true;
                    nwjsMenu.import.onClick = () => { $importBtn.click(); };
                    nwjsMenu.undo.onClick = () => { director.undo(); };
                    nwjsMenu.duplicate.onClick = () => { director.duplicateSelected(); };
                    nwjsMenu.saveTask.onClick = this._handleDownloadFCode;
                    nwjsMenu.saveScene.onClick = this._handleDownloadScene;
                    nwjsMenu.clear.onClick = this._handleClearScene;
                    nwjsMenu.tutorial.onClick = () => {
                        this.setState({ currentTutorialStep: 0 }, () => {
                            this._handleYes('tour');
                        });
                    };
                    nwjsMenu.clearLocalstorage.enabled = true;
                    nwjsMenu.clearLocalstorage.onClick = () => {
                        if(confirm(lang.topmenu.file.confirmReset)) {
                            LocalStorage.clearAllExceptIP();
                        }
                    };
                    menuFactory.methods.refresh();

                    this._registerKeyEvents();
                    this._registerTracking();

                    if(tutorialMode) {
                        //First time using, with usb-configured printer..
                        AlertActions.showPopupYesNo('set_default', sprintf(lang.tutorial.set_first_default,Config().read('configured-printer')),lang.tutorial.set_first_default_caption);
                    }

                    AlertStore.onYes(this._handleYes);
                    AlertStore.onNo(this._handleNo);
                    AlertStore.onCancel(this._handleDefaultCancel);
                    listeningToCancel = true;
                    GlobalStore.onCancelPreview(this._handleCancelPreview);
                    GlobalStore.onMonitorClosed(this._handleMonitorClosed);
                },

                componentWillUnmount: function() {
                    director.clear();
                    director.willUnmount();

                    nwjsMenu.tutorial.enabled = false;
                    menuFactory.methods.refresh();

                    AlertStore.removeYesListener(this._handleYes);
                    AlertStore.removeCancelListener(this._handleDefaultCancel);
                    GlobalStore.removeCancelPreviewListener(this._handleCancelPreview);
                    GlobalStore.removeMonitorClosedListener(this._handleMonitorClosed);
                },

                _registerKeyEvents: function() {
                    // delete event
                    shortcuts.on(['del'], (e) => {
                        if(allowDeleteObject && !this._isMonitorOn()) {
                            director.removeSelected();
                        }
                    });

                    shortcuts.on(['cmd', 'z'], (e) => {
                        director.undo();
                    });

                    shortcuts.on(['cmd', 'shift', 'x'], (e) => {
                        this._handleClearScene();
                    });

                    shortcuts.on(['cmd', 'shift', 'a'], (e) => {
                        LocalStorage.clearAllExceptIP();
                    });

                    // copy event - it will listen by top menu as well in nwjs..
                    if ('undefined' === typeof window.requireNode) {
                        // copy event
                        shortcuts.on(['cmd', 'd'], (e) => {
                            e.preventDefault();
                            director.duplicateSelected();
                        });
                    }
                },

                _registerTutorial: function() {
                    if(tutorialMode) {
                        AlertActions.showPopupYesNo('tour', lang.tutorial.startTour);
                    }
                },

                _registerTracking: function() {
                    let allowTracking = Config().read('allow-tracking');
                    if(allowTracking == '') {
                        AlertActions.showPopupYesNo('allow_tracking', lang.settings.allow_tracking);
                    }
                },

                _prepareMenu: function() {
                    nwjsMenu.import.enabled = true;
                    nwjsMenu.import.onClick = () => { $importBtn.click(); };
                    nwjsMenu.undo.onClick = () => { director.undo(); };
                    nwjsMenu.duplicate.onClick = () => { director.duplicateSelected(); };
                    nwjsMenu.saveTask.onClick = this._handleDownloadFCode;
                    nwjsMenu.saveScene.onClick = this._handleDownloadScene;
                    nwjsMenu.clear.onClick = this._handleClearScene;
                    nwjsMenu.tutorial.enabled = true;
                    nwjsMenu.tutorial.onClick = () => {
                        this._handleYes('tour');
                    };
                    nwjsMenu.undo.enabled = false;
                    nwjsMenu.saveTask.enabled = false;
                    nwjsMenu.saveScene.enabled = false;
                    nwjsMenu.clear.enabled = false;
                    menuFactory.methods.refresh();
                },

                _handleYes: function(answer, args) {
                    console.log(answer, args);
                    if(answer === 'tour') {
                        if(this.state.hasObject) {
                            director.clearScene();
                        }
                        this.setState({ tutorialOn: true });
                        tutorialMode = true;
                    }
                    else if(answer === 'set_default') {
                        Config().write('default-printer-name', Config().read('configured-printer'));
                        ProgressActions.open(ProgressConstants.NONSTOP);

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
                                        setTimeout(function() {
                                            AlertActions.showInfo(sprintf(lang.set_default.success, printer.name));
                                        }, 100);
                                        //Start tutorial
                                        setTimeout(function() {
                                            this._registerTutorial();
                                        }.bind(this), 100);
                                    }.bind(this),
                                onTimeout:
                                    function() {
                                        ProgressActions.close();
                                        setTimeout(function() {
                                            AlertActions.showWarning(sprintf(lang.set_default.error, printer.name));
                                        }, 100);
                                    }
                            }
                        );
                    }
                    else if(answer === 'print-setting-version') {
                        advancedSettings.custom = DefaultPrintSettings.custom;
                        Config().write('advanced-settings', JSON.stringify(advancedSettings));
                        Config().write('print-setting-version', GlobalConstants.DEFAULT_PRINT_SETTING_VERSION);
                    }
                    else if(answer === GlobalConstants.EXIT_PREVIEW) {
                        director.cancelPreview();
                    }
                    else if(answer === GlobalConstants.IMPORT_FCODE) {
                        director.doFCodeImport(args);
                    }
                    else if(answer === GlobalConstants.IMPORT_SCENE) {
                        director.loadScene();
                    }
                    else if(answer === 'allow-tracking') {
                        Config().write('allow-tracking', 'true');
                    }
                },

                _handleNo(answer, args) {
                    console.log(answer);
                },

                _handleCancelTutorial: function(answer) {
                    if(answer === 'tour') {
                        this.setState({ tutorialOn: false });
                        tutorialMode = false;
                        Config().write('tutorial-finished', true);
                    }
                },

                _handleRaftClick: function() {
                    this.setState({ leftPanelReady: false });
                    var isOn = !this.state.raftOn,
                        _raftLayers = isOn ? advancedSettings.raft_layers : 0;

                    if(!isOn) {
                        advancedSettings.raft_layers = this.state.raftLayers || advancedSettings.raft_layers;
                    }

                    var currentRaftLayers = isOn ? advancedSettings.raft_layers : 0;
                    var oldValue = this._getLineFromAdvancedCustomSetting('raft_layers');
                    var newValue = `raft_layers = ${currentRaftLayers}`;

                    advancedSettings.custom = advancedSettings.custom.replace(oldValue, newValue);
                    this._saveSetting();

                    director.setParameter('raft_layers', _raftLayers).then(function() {
                        this.setState({
                            leftPanelReady: true,
                            raftLayers: currentRaftLayers,
                            raftOn: isOn
                        });
                    }.bind(this));
                },

                _handleSupportClick: function() {
                    this.setState({ leftPanelReady: false });
                    var isOn = !this.state.supportOn;
                    director.setParameter('support_material', isOn ? '1' : '0').then(function() {
                        this.setState({
                            leftPanelReady: true,
                            supportOn: isOn
                        });
                    }.bind(this));
                    advancedSettings.support_material = isOn ? 1 : 0;
                    advancedSettings.custom = advancedSettings.custom.replace(
                        `support_material = ${isOn ? 0 : 1}`,
                        `support_material = ${isOn ? 1 : 0}`);
                    this._saveSetting();
                },

                _handleToggleAdvancedSettingPanel: function() {
                    this.setState({ showAdvancedSettings: !this.state.showAdvancedSettings }, function() {
                        allowDeleteObject = !this.state.showAdvancedSettings;
                    });
                },

                _handleGoClick: function() {
                    AlertStore.removeCancelListener(this._handleDefaultCancel);
                    listeningToCancel = false;
                    director.takeSnapShot().then(() =>{
                        this.setState({
                            openPrinterSelectorWindow: true
                        });
                        director.clearSelection();
                    });
                },

                _handleRotationChange: function(rotation) {
                    director.addHistory();
                    director.setRotation(rotation.enteredX, rotation.enteredY, rotation.enteredZ, true);
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

                _handleToggleScaleLock: function(size, isLocked) {
                    _scale.locked = isLocked;
                    this.setState({ scale: _scale });
                    director.toggleScaleLock(isLocked);
                },

                _handleResize: function(size, isLocked) {
                    director.addHistory();
                    director.setSize(size, isLocked);
                },

                _handleResetScale: function() {
                    director.setScale(1, 1, 1, true);
                },

                _handleCloseAdvancedSetting: function() {
                    this.setState({ showAdvancedSettings: false });
                    allowDeleteObject = true;
                },

                _handleApplyAdvancedSetting: function(setting) {
                    Object.assign(advancedSettings, setting);
                    // remove old properties
                    delete advancedSettings.raft;
                    delete advancedSettings.raft_on;
                    this._saveSetting();
                    var _raftLayers = parseInt(this._getValueFromAdvancedCustomSettings('raft_layers'));
                    if(_raftLayers !== 0) {
                        advancedSettings.raft_layers = _raftLayers;
                    }
                    this.setState({
                        supportOn: advancedSettings.support_material === 1,
                        layerHeight: advancedSettings.layer_height,
                        raftLayers: _raftLayers,
                        raftOn: _raftLayers !== 0
                    });
                    if(!setting) {
                        director.setAdvanceParameter(advancedSettings).then(() => {
                            advancedSettings.engine = advancedSettings.engine || defaultSlicingEngine;
                            if(advancedSettings.engine !== 'slic3r') {
                                this._handleSlicingEngineChange(advancedSettings.engine);
                            }
                        });
                    }
                    else {
                        this._handleSlicingEngineChange(advancedSettings.engine).then(() => {
                            director.setAdvanceParameter(advancedSettings);
                        });
                    }
                },

                _handleImport: function(e) {
                    var t = e.target;
                    director.appendModels(t.files, 0, function() {
                        t.value = null;
                    }.bind(this));
                },

                _handleDownloadGCode: function() {
                    if(director.getModelCount() !== 0) {
                        director.downloadGCode().then(function() {
                            this.setState({ openWaitWindow: false });
                        });
                    }
                },

                _handleDownloadFCode: function() {
                    director.downloadFCode();
                },

                _handleDownloadScene: function() {
                    allowDeleteObject = true;
                    director.downloadScene();
                },

                _handlePreview: function(isOn) {
                    if(this.state.previewMode !== isOn) {
                        this.setState({ previewMode: isOn }, function() {
                            director.togglePreview();
                        });
                    }
                },

                _handlePrinterSelectorWindowClose: function() {
                    this.setState({ openPrinterSelectorWindow: false });
                },

                _handlePrinterSelectorUnmount: function() {
                    AlertStore.onCancel(this._handleDefaultCancel);
                    listeningToCancel = true;
                },

                _handleDeviceSelected: function(printer) {
                    selectedPrinter = printer;
                    this.setState({
                        openPrinterSelectorWindow: false
                    }, () => {
                        let t = setInterval(() => {
                            if(director.getSlicingStatus().isComplete) {
                                clearInterval(t);
                                director.getFCode().then((fcode, previewUrl) => {
                                    if(!(fcode instanceof Blob)) {
                                        AlertActions.showPopupError('', lang.print.out_of_range_message, lang.print.out_of_range);
                                        return;
                                    }
                                    AlertStore.removeCancelListener(this._handleDefaultCancel);
                                    GlobalActions.showMonitor(selectedPrinter, fcode, previewUrl, GlobalConstants.PRINT);
                                    //Tour popout after show monitor delay
                                    setTimeout(() => {
                                        if(tutorialMode) {
                                            this.setState({
                                                tutorialOn: true,
                                                currentTutorialStep: 6
                                            });
                                            //Insert into root html
                                            $('.tour-overlay').append($('.tour'));
                                            $('.tour').click(() => {
                                                $('.print-studio').append($('.tour'));
                                                this._handleTutorialComplete();
                                            });
                                        };
                                    }, 1000);
                                });
                            }
                        }, 500);
                    });
                },

                _handlePreviewLayerChange: function(targetLayer) {
                    director.changePreviewLayer(targetLayer);
                },

                _handleCameraPositionChange: function(position, rotation) {
                    director.setCameraPosition(position, rotation);
                },

                _handleMonitorClosed: function() {
                    if(!listeningToCancel) {
                        AlertStore.removeCancelListener(this._handleDefaultCancel);
                        listeningToCancel = true;
                    }
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

                _handleQualitySelected: function(layerHeight) {
                    director.setParameter('layer_height', layerHeight);
                    advancedSettings.layer_height = layerHeight;
                    this.setState({ layerHeight: layerHeight });
                    // update custom property
                    var _settings = advancedSettings.custom.split('\n');
                    for(var i = 0; i < _settings.length; i++) {
                        if(_settings[i].substring(0, 12) === 'layer_height') {
                            _settings[i] = 'layer_height = ' + layerHeight;
                        }
                    }
                    advancedSettings.custom = _settings.join('\n');
                    this._saveSetting();
                },

                _handleTutorialStep: function() {
                    if(!tutorialMode) { return; }
                    this.setState({ currentTutorialStep: this.state.currentTutorialStep + 1 }, function() {
                        if(this.state.currentTutorialStep === 1) {
                            var selectPrinterName =
                                    Config().read('configured-printer') ||
                                    InitializeMachine.defaultPrinter.get().name ||
                                    DeviceMaster.getFirstDevice();

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
                                            setTimeout(function() {
                                                AlertActions.showWarning(sprintf(lang.set_default.error, printer.name)
                                            )}, 100);
                                        }
                                });
                            }
                            else{
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
                                var url = URL.createObjectURL(blob);
                                blob.name = 'guide-example.stl';
                                director.appendModel(url, blob);
                            };

                            oReq.send();
                            AlertStore.removeCancelListener(this._handleDefaultCancel);
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

                _handleDefaultCancel: function(ans) {
                    //Use setTimeout to avoid multiple modal display conflict
                    if(ans === 'set_default') {
                        AlertStore.removeYesListener(this._handleYes);
                    }
                    else if(ans === 'tour') {
                        this.setState({ tutorialOn: false });
                        tutorialMode = false;
                        Config().write('tutorial-finished', true);
                    }
                    else if(ans === 'change-filament-device-busy') {
                        this.setState({ tutorialOn: false });
                        tutorialMode = false;
                    }
                    else if (ans === 'print-setting-version') {
                        Config().write('print-setting-version', GlobalConstants.DEFAULT_PRINT_SETTING_VERSION);
                    }
                    else if(ans === 'allow_tracking') {
                        Config().write('allow-tracking', 'false');
                        window.location.reload();
                    }

                    setTimeout(function() {
                        this._registerTutorial();
                    }.bind(this), 10);
                },

                _handleCancelPreview: function() {
                    director.cancelPreview();
                },

                _handleClearScene: function() {
                    director.clearScene();
                },

                _handleSlicingEngineChange: function(engineName) {
                    engineName = engineName || defaultSlicingEngine;
                    var d = $.Deferred(),
                        path = 'default';

                    const setDefaultEngine = (result) => {
                        advancedSettings.engine = 'slic3r';
                        this._saveSetting();
                        AlertActions.showPopupWarning(
                            'engine-change',
                            lang.settings.engine_change_fail[result.error] + ', ' + result.info,
                            `${lang.settings.engine_change_fail.caption} ${engineName}`
                        );
                    };

                    director.changeEngine(engineName, path).then((error) => {
                        if(error) {
                            setDefaultEngine(error);
                        }
                        d.resolve();
                    });

                    return d.promise();
                },

                _saveSetting: function() {
                    Config().write('advanced-settings', JSON.stringify(advancedSettings));
                },

                _getLineFromAdvancedCustomSetting: function(key) {
                    var start = advancedSettings.custom.indexOf(key);
                    var end = advancedSettings.custom.indexOf('\n', start);
                    return advancedSettings.custom.substring(start, end);
                },

                _getValueFromAdvancedCustomSettings: function(key) {
                    return this._getLineFromAdvancedCustomSetting(key).split('=')[1].replace(/ /g, '');
                },

                _checkDefaultPrintSettingsVersion: function() {
                    var version = Config().read('print-setting-version');
                    if(version && version !== GlobalConstants.DEFAULT_PRINT_SETTING_VERSION) {
                        AlertActions.showPopupYesNo('print-setting-version', lang.monitor.updatePrintPresetSetting);
                    }
                },

                _isMonitorOn: function() {
                    // yuk! needs to be changed when redux is fully implemented
                    return $('.flux-monitor').length > 0;
                },

                _renderAdvancedPanel: function() {
                    return (
                        <AdvancedPanel
                            lang            = {lang}
                            setting         = {advancedSettings}
                            raftLayers      = {this.state.raftLayers}
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
                            onUnmount={this._handlePrinterSelectorUnmount}
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
                                    <input ref="import" type="file" accept=".stl,.fc,.gcode,.obj" onChange={this._handleImport} multiple />
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
                            previewMode                 = {this.state.previewMode}
                            previewModeOnly             = {this.state.previewModeOnly}
                            previewLayerCount           = {this.state.previewLayerCount}
                            disablePreview              = {this.state.disablePreview}
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
                            updateCamera            = {this.state.updateCamera}
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

                _renderPercentageBar: function() {
                    if(this.state.slicingPercentage === 1) {
                        return '';
                    }
                    var computed_style = {
                        width: (this.state.slicingPercentage*100 + '%')
                    };
                    return (
                        <div className="slicingProgressBar">
                            <div className="slicingProgressBarInner" style={computed_style}>
                            </div>
                        </div>
                    );
                },

                _renderNwjsMenu: function() {
                    if(nwjsMenu.undo.enabled !== this.state.hasObject) {
                        nwjsMenu.undo.enabled = this.state.hasObject;
                        nwjsMenu.saveTask.enabled = this.state.hasObject;
                        nwjsMenu.saveScene.enabled = this.state.hasObject;
                        nwjsMenu.clear.enabled = this.state.hasObject;
                        menuFactory.methods.refresh();
                    }
                },

                _renderTourGuide: function() {
                    return (
                        <TourGuide
                            lang={lang}
                            enable={this.state.tutorialOn}
                            guides={tourGuide}
                            step={this.state.currentTutorialStep}
                            onNextClick={this._handleTutorialStep}
                            onComplete={this._handleTutorialComplete} />
                    );
                },

                render: function() {
                    var advancedPanel           = this.state.showAdvancedSettings ? this._renderAdvancedPanel() : '',
                        importWindow            = this._renderImportWindow(),
                        leftPanel               = this._renderLeftPanel(),
                        rightPanel              = this._renderRightPanel(),
                        objectDialogue          = this.state.openObjectDialogue ? this._renderObjectDialogue() : '',
                        printerSelectorWindow   = this.state.openPrinterSelectorWindow ? this._renderPrinterSelectorWindow() : '',
                        waitWindow              = this.state.openWaitWindow ? this._renderWaitWindow() : '',
                        progressWindow          = this.state.progressMessage ? this._renderProgressWindow() : '',
                        percentageBar           = (!this.state.openImportWindow) ? this._renderPercentageBar() : '',
                        tourGuideSection        = this.state.tutorialOn ? this._renderTourGuide() : '';

                    this._renderNwjsMenu();

                    return (
                        <div className="studio-container print-studio">

                            {importWindow}

                            {leftPanel}

                            {percentageBar}

                            {rightPanel}



                            {objectDialogue}

                            {printerSelectorWindow}

                            {advancedPanel}

                            {waitWindow}

                            {progressWindow}


                            <div id="model-displayer" className="model-displayer">
                                <div className="import-indicator"></div>
                            </div>
                            <input className="hide" ref="importBtn" type="file" accept=".stl,.fc,.gcode,.obj" onChange={this._handleImport} multiple/>

                            {tourGuideSection}

                        </div>
                    );
                }
            });

        return view;
    };
});
