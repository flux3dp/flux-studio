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
    'helpers/local-storage',
    'helpers/api/cloud',
    'helpers/i18n',
    'helpers/check-device-status',
    'app/tutorial-steps',
    'helpers/slicer-settings'
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
    LocalStorage,
    CloudApi,
    i18n,
    CheckDeviceStatus,
    TutorialSteps,
    SlicerSettings
) {

    return function(args) {
        'use strict';

        args = args || {};

        var advancedSettings = new SlicerSettings('main'),
            fineAdvancedSettings = {},
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
            finishedSnapshot = false,
            listeningToCancel = false,
            defaultRaftLayer = 4,
            allowDeleteObject = true,
            tutorialMode = false,
            nwjsMenu = menuFactory.items,
            defaultSlicingEngine = 'cura',
            tourGuide = TutorialSteps,
            view = React.createClass({

                getInitialState: function() {
                    var _settings           = Config().read('advanced-settings'),
                        tutorialFinished    = Config().read('tutorial-finished'),
                        configuredPrinter   = Config().read('configured-printer');

                    this._checkDefaultPrintSettingsVersion();

                    if (!_settings) {
                        advancedSettings.load(DefaultPrintSettings);
                        var defaultMedium = DefaultPrintSettings[Config().read('default-model') || Config().read('preferred-model') || 'fd1']['med'];
                        advancedSettings.update(defaultMedium, 'slic3r');
                    }
                    else {
                        advancedSettings.load(_settings, true);
                        // Load new default cura2 config
                        if (!_settings.customCura2) {
                            advancedSettings.customCura2 = DefaultPrintSettings.customCura2;
                            advancedSettings.customCura2 = advancedSettings.toExpert(advancedSettings.customCura2, 'cura2');
                        }
                    }

                    if(tutorialFinished !== 'true' && configuredPrinter !== '') {
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
                        previewMode                 : false,
                        previewModeOnly             : false,
                        disablePreview              : false,
                        disableGoButtons            : false,
                        slicingPercentage           : 0,
                        currentTutorialStep         : 0,
                        layerHeight                 : 0.1,
                        raftOn                      : advancedSettings.raft === 1,
                        supportOn                   : advancedSettings.support_material === 1,
                        displayModelControl         : !Config().read('default-model'),
                        model                       : Config().read('default-model') || Config().read('preferred-model') || 'fd1',
                        quality                     : 'high',
                        mode                        : 'scale',
                        previewLayerCount           : 0,
                        progressMessage             : '',
                        fcode                       : {},
                        objectDialogueStyle         : {},
                        camera                      : {},
                        rotation                    : {},
                        scale                       : _scale,
                        printerControllerStatus     : '',
                        me                          : {}
                    });
                },

                componentWillMount: function() {
                    CloudApi.getMe().then(response => {
                        if(response.ok) {
                            return response.json();
                        }
                    }).then(content => {
                        let { nickname, email } = content || {};
                        let displayName = (nickname || email || '');
                        menuFactory.methods.updateAccountDisplay(displayName);
                        menuFactory.methods.refresh();
                    });;
                },

                componentDidMount: function() {
                    director.init(this);

                    // prevent user to operate before settings are set
                    this.showSpinner();
                    this._handleApplyAdvancedSetting().always(() => {
                        this.hideSpinner();
                    });

                    // events

                    $importBtn = this.refs.importBtn.getDOMNode();

                    this._prepareMenu();
                    nwjsMenu.import.enabled = true;
                    nwjsMenu.import.onClick = () => { $importBtn.click(); };
                    nwjsMenu.undo.onClick = () => { console.log('undo'); director.undo(); };
                    nwjsMenu.tutorial.onClick = () => { console.log('undo'); director.undo(); };
                    nwjsMenu.duplicate.onClick = () => { director.duplicateSelected(); };
                    nwjsMenu.saveTask.onClick = this._handleDownloadFCode;
                    nwjsMenu.saveScene.onClick = this._handleDownloadScene;
                    nwjsMenu.clear.onClick = this._handleClearScene;

                    // to catch the tutorial click from menuMap
                    // this mod is implemented after menu-map refactored, using cache to reduce refresh, boot performance
                    if(!window.customEvent) {
                        window.customEvent = {};
                    }
                    window.customEvent.onTutorialClick = () => {
                        this.setState({ currentTutorialStep: 0 }, () => {
                            this._handleYes('tour');
                        });
                    };

                    menuFactory.methods.refresh();

                    this._registerKeyEvents();
                    this._registerTracking();

                    if (tutorialMode) {
                        let name = '';
                        if (Config().read('configured-printer') !== '') {
                            name = Config().read('configured-printer').name;
                        }
                        //First time using, with usb-configured printer..
                        AlertActions.showPopupYesNo(
                            'set_default',
                            sprintf(
                                lang.tutorial.set_first_default,
                                name
                            ),
                            lang.tutorial.set_first_default_caption);
                    }

                    AlertStore.onYes(this._handleYes);
                    AlertStore.onNo(this._handleNo);
                    AlertStore.onCancel(this._handleDefaultCancel);
                    listeningToCancel = true;
                    GlobalStore.onCancelPreview(this._handleCancelPreview);
                    GlobalStore.onMonitorClosed(this._handleMonitorClosed);
                    GlobalStore.onSliceComplete(this._handleSliceReport);
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
                    GlobalStore.removeSliceCompleteListener(this._handleSliceReport);
                },

                _registerKeyEvents: function() {
                    // delete event
                    shortcuts.on(['del'], () => {
                        if(allowDeleteObject && !this._isMonitorOn()) {
                            director.removeSelected();
                        }
                    });

                    shortcuts.on(['cmd', 'z'], () => {
                        director.undo();
                    });

                    //========for testing only==================
                    //shortcuts.on(['cmd', 'b'], () => {
                    //  director.alignCenterPosition();
                    //});
                    //==========================================

                    shortcuts.on(['cmd', 'shift', 'x'], () => {
                        this._handleClearScene();
                    });

                    shortcuts.on(['ctrl', 'shift', 't'], () => {
                        window.customEvent.onTutorialClick();
                    });

                    shortcuts.on(['cmd', 'shift', 'a'], () => {
                        LocalStorage.clearAllExceptIP();
                    });

                    // windows
                    if(navigator.appVersion.indexOf('Win') !== -1) {
                        shortcuts.on(['ctrl', 'd'], (e) => {
                            e.preventDefault();
                            director.duplicateSelected();
                        });

                        shortcuts.on(['ctrl', 'z'], () => {
                            director.undo();
                        });
                    }

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
                    if(allowTracking === '') {
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

                showSpinner: function(caption) {
                    ProgressActions.open(ProgressConstants.NONSTOP, caption);
                },

                hideSpinner: function() {
                    ProgressActions.close();
                },

                _updateAdvancedSettings: function(opts) {
                    let settings = {};
                    Object.keys(opts).map((key) => {
                        let value = opts[key];
                        let filteredParam = advancedSettings.filter({key: key, value: value});
                        if (filteredParam) {
                            if(filteredParam.key instanceof Array) {
                                for(let i = 0; i < filteredParam.key.length; i ++) {
                                    settings[filteredParam.key[i]] = filteredParam.value[i];
                                }
                            }
                            else {
                                settings[filteredParam.key] = filteredParam.value;
                            }
                        };
                    });
                    director.setParameters(settings);
                    advancedSettings.update(opts, 'slic3r');

                    // update dom state
                    this.setState(opts);
                    this._saveSetting();
                },

                _getDevice: function() {
                    let selectedDevice = {},
                        defaultDevice = InitializeMachine.defaultPrinter.get(),
                        configuredDevice = {},
                        firstDevice = DeviceMaster.getFirstDevice();

                    const isNotEmptyObject = o => Object.keys(o).length > 0;

                    if (Config().read('configured-printer') !== '') {
                        configuredDevice = Config().read('configured-printer');
                    }

                    // determin selected Device
                    if (isNotEmptyObject(defaultDevice)) {
                        selectedDevice = defaultDevice;
                    }
                    else if (isNotEmptyObject(configuredDevice)) {
                        selectedDevice = configuredDevice;
                    }
                    else {
                        selectedDevice = firstDevice;
                    }

                    return selectedDevice;
                },

                _handleYes: function(answer, args) {
                    if(answer === 'tour') {
                        let activeLang = i18n.getActiveLang();

                        if(this.state.hasObject) {
                            director.clearScene();
                        }

                        const startTutorial = () => {
                            this.setState({ tutorialOn: true });
                            tutorialMode = true;
                        };

                        const tryMovementTest = () => {
                            let device = this._getDevice();
                            if (device) {
                                this.showSpinner(lang.tutorial.connectingMachine);
                                let addr = parseInt(device.addr || '-1');
                                DeviceMaster.getDeviceBySerial(device.serial, false, {
                                    timeout: 20000,
                                    onSuccess: (printer)  => {
                                        DeviceMaster.selectDevice(printer).then(() => {
                                            return CheckDeviceStatus(printer, false, true);
                                        })
                                        .then(() => {
                                            this.showSpinner(lang.tutorial.runningMovementTests);
                                            return DeviceMaster.runMovementTests();
                                        })
                                        .then(() => {
                                            this.hideSpinner();
                                            startTutorial();
                                        }).fail(() => {
                                            this.hideSpinner();
                                            AlertActions.showPopupYesNo('movement-try-again', lang.tutorial.movementTestFailed.message, lang.tutorial.movementTestFailed.caption, null, {
                                                yes: function() {
                                                    tryMovementTest();
                                                },
                                                no: function() {
                                                    // TODO
                                                    this.hideSpinner();
                                                }
                                            });
                                        });
                                    },
                                    onTimeout: () => {
                                        this.hideSpinner();
                                        setTimeout(function() {
                                            AlertActions.showWarning(lang.message.unable_to_find_machine + device.name);
                                        }, 100);
                                    }
                                });
                            }
                        };

                        setTimeout(() => {
                            const callback = () => { tryMovementTest(); }
                            const imageObject = {
                                images: [
                                    '/img/tutorial/' + activeLang + '/n01.png',
                                    '/img/tutorial/' + activeLang + '/n02.png',
                                    '/img/tutorial/' + activeLang + '/n03.png',
                                    '/img/tutorial/' + activeLang + '/n04.png',
                                    '/img/tutorial/' + activeLang + '/n05.png',
                                    '/img/tutorial/' + activeLang + '/n06.png'
                                ],
                                imgClass: 'img640x480'
                            };

                            AlertActions.showPopupCustom(
                                'tutorial-images',
                                'Test Message',
                                'custom_text',
                                null,
                                imageObject ,
                                callback
                            );

                        }, 0);
                    }
                    else if(answer === 'set_default') {
                        Config().write('default-model', Config().read('configured-model'));
                        this.setState({displayModelControl: false});
                        this.showSpinner();

                        let self = this,
                            device = {},
                            callback;

                        if (Config().read('configured-printer') !== '') {
                            device = Config().read('configured-printer');
                        }

                        callback = {
                            timeout: 20000,
                            onSuccess: function(printer) {
                                ProgressActions.close();
                                InitializeMachine.defaultPrinter.set({
                                          name: printer.name,
                                          serial: printer.serial,
                                          uuid: printer.uuid
                                });
                                setTimeout(function() {
                                    AlertActions.showInfo(sprintf(lang.set_default.success, device.name));
                                }, 100);
                                //Start tutorial
                                setTimeout(function() {
                                    this._registerTutorial();
                                }.bind(this), 100);
                            }.bind(this),
                            onTimeout: function() {
                                self.hideSpinner();
                                setTimeout(function() {
                                    AlertActions.showWarning(sprintf(lang.set_default.error, device.name));
                                }, 100);
                            }
                        };

                        let addr = parseInt(device.addr || '-1');
                        DeviceMaster.getDeviceBySerial(device.serial, false, callback);
                    }
                    else if(answer === 'print-setting-version') {
                        advancedSettings.load(DefaultPrintSettings);
                        Config().write('advanced-settings', advancedSettings.toString());
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
                    else if(answer === 'allow_tracking') {
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
                    var isOn = !this.state.raftOn;
                    director.setParameter('raft', isOn ? '1' : '0').then(function() {
                        this.setState({
                            leftPanelReady: true,
                            raftOn: isOn
                        });
                    }.bind(this));

                    advancedSettings.set('raft', isOn ? 1 : 0, true);
                    this._saveSetting();
                },

                _handleSupportClick: function() {
                    this.setState({ leftPanelReady: false });
                    var isOn = !this.state.supportOn;
                    let filteredItem = advancedSettings.filter({ key: 'support_material', value: isOn ? 1 : 0 });
                    director.setParameter(filteredItem.key, filteredItem.value).then(function() {
                        this.setState({
                            leftPanelReady: true,
                            supportOn: isOn
                        });
                    }.bind(this));

                    advancedSettings.set('support_material', isOn ? 1 : 0);
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
                    finishedSnapshot = false;
                    director.takeSnapShot().then(() =>{
                        finishedSnapshot = true;
                        director.clearSelection();
                    });
                    this.setState({
                        openPrinterSelectorWindow: true
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
                    let d = $.Deferred(), quality = 'custom';
                    advancedSettings.load(setting || {}, true);
                    // remove old properties
                    delete advancedSettings.raft_on;

                    this._saveSetting();

                    ['high', 'med', 'low'].forEach((q) => {
                        // Do comparsion with default settings
                        let params = DefaultPrintSettings[this.state.model][q];
                        for(var i in params) {
                            if(params[i] !== advancedSettings[i]) { return; }
                        }
                        // No difference then quality equals q
                        quality = q;
                    });

                    this.setState({
                        supportOn: advancedSettings.support_material === 1,
                        layerHeight: advancedSettings.layer_height,
                        raftOn:  advancedSettings.raft === 1,
                        quality: quality
                    });
                    if (!setting) {
                        let self = this;
                        let uploadSettings = () => {
                            director.setAdvanceParameter(advancedSettings.deepClone()).then(() => {
                                Object.assign(fineAdvancedSettings, advancedSettings);
                                advancedSettings.engine = advancedSettings.engine || defaultSlicingEngine;
                            }).fail(() => {
                                advancedSettings.load(fineAdvancedSettings);
                                director.setAdvanceParameter(advancedSettings);
                                self._saveSetting();
                            }).always(() => {
                                d.resolve();
                            });
                        };

                        if(advancedSettings.engine !== 'slic3r') {
                            this._handleSlicingEngineChange(advancedSettings.engine)
                            .then(uploadSettings)
                            .fail(() => {
                                d.reject();
                            });
                        } else {
                            uploadSettings();
                        }
                    }

                    else {
                        this._handleSlicingEngineChange(advancedSettings.engine).then(() => {
                            director.setAdvanceParameter(advancedSettings).then(() => {
                                Object.assign(fineAdvancedSettings, advancedSettings);
                            }).fail(() => {
                                advancedSettings.load(fineAdvancedSettings);
                                director.setAdvanceParameter(advancedSettings);
                                this._saveSetting();
                            }).always(() => {
                                d.resolve();
                            });
                        });
                    }

                    return d.promise();
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
                        let go = () => {
                            if(director.getSlicingStatus().isComplete && finishedSnapshot) {
                                clearInterval(t);
                                director.getFCode().then((fcode, previewUrl) => {
                                    if(!(fcode instanceof Blob)) {
                                        AlertActions.showPopupError('', lang.print.out_of_range_message, lang.print.out_of_range);
                                        return;
                                    }
                                    AlertStore.removeCancelListener(this._handleDefaultCancel);
                                    GlobalActions.showMonitor(selectedPrinter, fcode, previewUrl, GlobalConstants.PRINT);
                                    //Tour popout after show monitor delay
                                    const tour = () => {
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
                                    };
                                    setTimeout(tour, 1000);
                                });
                            }
                        };

                        let t = setInterval(go, 100);
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
                    if (mode === 'rotate') {
                        director.setRotateMode();
                    }
                    else {
                        director.setScaleMode();
                    }
                },

                _handleQualityModelSelected: function(quality, machineModel) {
                    if ( ['high', 'med', 'low'].indexOf(quality) < 0 ) { quality = 'med'; }
                    var parameters = DefaultPrintSettings[machineModel || 'fd1'][quality];
                    this.setState({model: machineModel, quality: quality});
                    Config().write('preferred-model', machineModel);
                    this._updateAdvancedSettings(parameters);
                    this._saveSetting();
                },

                _handleTutorialStep: function() {
                    if (!tutorialMode) { return; }
                    this.setState({ currentTutorialStep: this.state.currentTutorialStep + 1 }, function() {
                        if (this.state.currentTutorialStep === 1) {
                            let selectedDevice = this._getDevice();
                            const isNotEmptyObject = o => Object.keys(o).length > 0;

                            if (isNotEmptyObject(selectedDevice)) {
                                let addr = parseInt(selectedDevice.addr || '-1'),
                                    callback;

                                callback = {
                                    timeout: 20000,
                                    onSuccess: function(printer) {
                                        //Found ya default printer
                                        ProgressActions.close();
                                        setTimeout(function() {
                                            AlertActions.showChangeFilament(printer, 'TUTORIAL');
                                        }, 100);
                                    }.bind(this),
                                    onTimeout: function() {
                                        //Unable to find configured printer...
                                        ProgressActions.close();
                                        setTimeout(function() {
                                            AlertActions.showWarning(sprintf(lang.set_default.error, selectedDevice.name));
                                        }, 100);
                                    }
                                };

                                DeviceMaster.getDeviceBySerial(selectedDevice.serial, false, callback);
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
                                director.appendModel(url, blob, 'st', () => {
                                    director.startSlicing();
                                });
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

                        setTimeout(function() {
                            this._registerTutorial();
                        }.bind(this), 10);
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
                },

                _handleSliceReport: function(data) {
                    this.setState({ slicingStatus: data.report });
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

                    director.changeEngine(engineName).then((error) => {
                        if(error) {
                            setDefaultEngine(error);
                        }
                        d.resolve();
                    }).fail((error) => {
                        setDefaultEngine(error);
                        d.reject(error);
                    });

                    return d.promise();
                },

                _saveSetting: function() {
                    let { custom } = advancedSettings,
                        raftIndex = custom.indexOf('raft ='),
                        supportIndex = custom.indexOf('support_material =');

                    // extra process for raft (because it's a direct control on left panel)
                    if(raftIndex > 0) {
                        custom = custom.slice(0, raftIndex) + `raft = ${advancedSettings.raft}\n` + custom.slice(raftIndex + 9);
                    }

                    if(supportIndex > 0) {
                        custom= custom.slice(0, supportIndex) + `support_material = ${advancedSettings.support_material}\n` + custom.slice(supportIndex + 21);
                    }

                    advancedSettings.custom = custom;

                    Config().write('advanced-settings', advancedSettings.toString());
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
                            uniqleId='print'
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
                            <div className='arrowBox' onClick={this._handleCloseAllView}>
                                <div title={lang.print.importTitle} className='file-importer'>
                                    <div className='import-btn'>{lang.print.import}</div>
                                    <input ref='import' type='file' accept='.stl,.fc,.gcode,.obj' onChange={this._handleImport} multiple />
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
                            displayModelControl         = {this.state.displayModelControl}
                            raftOn                      = {this.state.raftOn}
                            supportOn                   = {this.state.supportOn}
                            quality                     = {this.state.quality}
                            model                       = {this.state.model}
                            onQualityModelSelected      = {this._handleQualityModelSelected}
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
                            slicingPercentage       = {this.state.slicingPercentage}
                            slicingStatus           = {this.state.slicingStatus}
                            camera                  = {this.state.camera}
                            updateCamera            = {this.state.updateCamera}
                            hasObject               = {this.state.hasObject}
                            disableGoButtons        = {this.state.disableGoButtons}
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
                    var spinner = <div className='spinner-flip spinner-reverse'/>;
                    return (
                        <Modal content={spinner} />
                    );
                },

                _renderProgressWindow: function() {
                    var content = (
                        <div className='progressWindow'>
                            <div className='message'>
                                {this.state.progressMessage}
                            </div>
                            <div className='spinner-flip spinner-reverse'/>
                        </div>
                    );
                    return (
                        <Modal content={content} />
                    );
                },

                _renderPercentageBar: function() {
                    let { slicingPercentage } = this.state;
                    if(slicingPercentage === 1 || slicingPercentage === 0) {
                        return '';
                    }
                    var computed_style = {
                        width: (this.state.slicingPercentage*100 + '%')
                    };
                    return (
                        <div className='slicingProgressBar'>
                            <div className='slicingProgressBarInner' style={computed_style}>
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
                        nwjsMenu.signIn = { label: this.state.nickname, enabled: true, parent: 5}
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
                        percentageBar           = this._renderPercentageBar(),
                        tourGuideSection        = this.state.tutorialOn ? this._renderTourGuide() : '';

                    this._renderNwjsMenu();

                    return (
                        <div className='studio-container print-studio'>

                            {importWindow}

                            {leftPanel}

                            {percentageBar}

                            {rightPanel}



                            {objectDialogue}

                            {printerSelectorWindow}

                            {advancedPanel}

                            {waitWindow}

                            {progressWindow}


                            <div id='model-displayer' className='model-displayer'>
                                <div className='import-indicator'></div>
                            </div>
                            <input className='hide' ref='importBtn' type='file' accept='.stl,.fc,.gcode,.obj' onChange={this._handleImport} multiple/>

                            {tourGuideSection}

                        </div>
                    );
                }
            });

        return view;
    };
});
