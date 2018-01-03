define([
    'react',
    'app/actions/beambox/beambox',
    'app/constants/device-constants',
    'jsx!views/beambox/Left-Panel',
    'jsx!pages/svg-editor',
    'jsx!widgets/Button-Group',
    'helpers/api/config',
    'app/actions/beambox/default-config',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'jsx!views/beambox/Object-Panels-Controller',
    'jsx!views/beambox/Right-Panels/Laser-Panel-Controller',
    'app/actions/beambox/beambox-global-interaction',
], function (
    React,
    beamboxEvents,
    DeviceConstants,
    LeftPanel,
    SvgGenerator,
    ButtonGroup,
    ConfigHelper,
    DefaultConfig,
    i18n,
    Modal,
    PrinterSelector,
    AlertActions,
    ObjectPanelsController,
    LaserPanelController,
    BeamboxGlobalInteraction
) {
        'use strict';

        const Config = ConfigHelper();
        const lang = i18n.lang;
        const machineCommand = {
            START: 'START'
        };

        (function () {
            //init config
            const customConfig = Config.read('beambox-preference');
            const updatedConfig = $.extend({}, DefaultConfig, customConfig);
            Config.write('beambox-preference', updatedConfig);
        })();

        ObjectPanelsController.init("object-panels-placeholder");
        LaserPanelController.init("layer-laser-panel-placeholder");
        

        if (!Config.read('beambox-preference')['mouse-input-device']) {
            function chooseIsTouchpad() {
                AlertActions.showPopupCustomGroup(
                    'confirm_mouse_input_device',
                    lang.beambox.popup.select_favor_input_device,
                    [lang.beambox.popup.touchpad, lang.beambox.popup.mouse],
                    '',
                    '',
                    [
                        () => {
                            Config.update('beambox-preference', 'mouse-input-device', 'TOUCHPAD');
                        },
                        () => {
                            Config.update('beambox-preference', 'mouse-input-device', 'MOUSE');
                        },
                    ]
                );
            }
            chooseIsTouchpad();
        }

        return function (args = {}) {
            let Svg = SvgGenerator(args);
            self = this;

            class view extends React.Component {
                constructor() {
                    super();
                    this.beamboxEvents = beamboxEvents.call(this); //to let beamboxEvents know this.state.selectedPrinter
                    this.state = {
                        openPrinterSelectorWindow: false
                    };
                }
                componentDidMount() {
                    BeamboxGlobalInteraction.attach();
                }
                componentWillUnmount() {
                    BeamboxGlobalInteraction.detach();
                }

                _fetchFormalSettings(holder) {
                    const options = Config.read('beambox-preference');
                    //   const max = options['max-strength'];
                    //   max = lang.laser.advanced.form.power.max;
                    return {
                        //object_height: options.objectHeight,
                        //height_offset: options.heightOffset || 0,
                        //laser_speed: options.material.data.laser_speed,
                        //calibration: 0,
                        //power: options.material.data.power / max,
                    };
                }

                _handleExportClick(filemode) {
                    this.beamboxEvents.exportTaskCode(this._fetchFormalSettings(), filemode);
                }

                _handleStartClick() {
                    this.setState({
                        openPrinterSelectorWindow: true,
                        machineCommand: machineCommand.START,
                        settings: this._fetchFormalSettings(),
                        printerSelectorWindowStyle: {}
                    });
                }

                _renderActionButtons() {
                    //globalInteraction.onImageChanged(this.state.hasImage);
                    var cx = React.addons.classSet,
                        buttons = [{
                            label: lang.laser.get_fcode,
                            className: cx({
                                'btn-disabled': false,
                                'btn-default': true,
                                'btn-hexagon': true,
                                'btn-get-fcode': true
                            }),
                            dataAttrs: {
                                'ga-event': 'get-laser-fcode'
                            },
                            onClick: this._handleExportClick.bind(this, '-f')
                        }, {
                            label: lang.monitor.start,
                            className: cx({
                                'btn-disabled': false,
                                'btn-default': true,
                                'btn-hexagon': true,
                                'btn-go': true
                            }),
                            dataAttrs: {
                                'ga-event': 'laser-goto-monitor'
                            },
                            onClick: this._handleStartClick.bind(this)
                        }];

                    return (
                        <ButtonGroup buttons={buttons} className="beehive-buttons action-buttons" />
                    );
                }

                _renderLeftPanel() {
                    return (<LeftPanel />);
                }

                _renderPrinterSelectorWindow() {
                    if (!this.state.openPrinterSelectorWindow) { return ''; }
                    var self = this,
                        onGettingPrinter = function (auth_printer) {
                            self.setState({
                                selectedPrinter: auth_printer,
                                openPrinterSelectorWindow: false
                            });

                            if (self.state.machineCommand === machineCommand.START) {
                                self.beamboxEvents.uploadFcode(self._fetchFormalSettings());
                            };
                        },
                        onClose = function (e) {
                            self.setState({
                                openPrinterSelectorWindow: false
                            });
                        },
                        content = (
                            <PrinterSelector
                                uniqleId="laser"
                                className="laser-device-selection-popup"
                                lang={lang}
                                onClose={onClose}
                                onGettingPrinter={onGettingPrinter}
                                WindowStyle={this.state.printerSelectorWindowStyle}
                            />
                        );
                    return (
                        <Modal content={content} onClose={onClose} />
                    );
                }


                render() {

                    var actionButtons = this._renderActionButtons(),
                        leftPanel = this._renderLeftPanel(),
                        printerSelector = this._renderPrinterSelectorWindow();

                    return (
                        <div className="studio-container beambox-studio">
                            <div id="grid_mask"></div>
                            {leftPanel}
                            <Svg />
                            {actionButtons}
                            {printerSelector}
                            <div id="object-panels-placeholder"></div>
                        </div>
                    );
                }
            }

            return view;
        };
    });
