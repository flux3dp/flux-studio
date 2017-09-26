define([
    'react',
    'app/actions/beambox',
    'app/constants/device-constants',
    'jsx!views/beambox/Left-Panel',
    'jsx!pages/svg-editor',
    'jsx!widgets/Button-Group',
    'helpers/api/config',
    'app/actions/beambox/default-config',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
], function(
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
    PrinterSelector
) {
    'use strict';

    const Config = ConfigHelper();
    const lang = i18n.lang;
    const machineCommand = {
        TEST: 'TEST',
        MOVE: 'MOVE',
        START: 'START'
    };

    const customConfig = Config.read('beambox-defaults');
    const updatedConfig = $.extend({}, DefaultConfig, customConfig);
    Config.write('beambox-defaults', updatedConfig);


    return function(args = {}) {
        let Svg = SvgGenerator(args);
            self = this;

        class view extends React.Component {
          constructor(){
              super();
              this.beamboxEvents = beamboxEvents.call(this);
              this.state = {
                  openPrinterSelectorWindow: false,
                  connectedMovementMode: false
                };
          }

          _fetchMoveLocation() {

          }

          _fetchMoveLocation() {

          }

          _fetchFormalSettings(holder) {
              const options = Config.read('beambox-defaults');
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

          _renderActionButtons() {
              //globalInteraction.onImageChanged(this.state.hasImage);
              var cx = React.addons.classSet,
                  buttons = [{
                      label: 'Test',
                      className: cx({
                          'btn-disabled': false,
                          'btn-default': true,
                          'btn-hexagon': true,
                          'btn-get-fcode': true
                      }),
                      dataAttrs: {
                          'ga-event': 'get-laser-test'
                      },
                      onClick: this._handleTestClick.bind(this, '-f')
                  }, {
                      label: 'Move',
                      className: cx({
                          'btn-disabled': false,
                          'btn-default': true,
                          'btn-hexagon': true,
                          'btn-get-fcode': true
                      }),
                      dataAttrs: {
                          'ga-event': 'get-laser-Move'
                      },
                      onClick: this._handleMoveClick.bind(this, '-f')
                  }, {
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
                <ButtonGroup buttons={buttons} className="beehive-buttons action-buttons"/>
            );
        }
        _handleTestClick() {
            var self = this;
            var move = {
                f: 6000,
                x: 50,
                y: 20,
                z: 30
            };
            this.beamboxEvents.connectDevice()
                .done(function(status) {
                    self.beamboxEvents.maintainMove(move);
                })
                .fail(function(status) {
                    this.setState({
                        connectedMovementMode: false
                    });
                });
        }

        _handleMoveClick() {
            var self = this;
            if (this.state.connectedMovementMode) {
              this.beamboxEvents.connectDevice()
                  .done(function(status) {
                      self.beamboxEvents.endMaintainMove();
                      self.setState({
                          connectedMovementMode: false
                      });
                  })
                  .fail(function(status) {
                      self.setState({
                          connectedMovementMode: false
                      });
                  });
            } else {
              this.setState({
                  openPrinterSelectorWindow: true,
                  machineCommand: machineCommand.MOVE,
                  settings: this._fetchMoveLocation(),
                  printerSelectorWindowStyle: {bottom: '15.5rem'}
              });
            }
        }

        _handleStartClick() {
            this.setState({
                openPrinterSelectorWindow: true,
                machineCommand: machineCommand.START,
                settings: this._fetchFormalSettings(),
                printerSelectorWindowStyle: {}
            });
        }

        _renderMovementMode() {
          if (!this.state.connectedMovementMode) { return ''; }
          var style = {
            position: 'absolute',
            zIndex: 100,
            right: '16rem',
            top: '7rem'
          };

          return (
            <i className="fa fa-camera-retro fa-5x"
               style={style}
               aria-hidden="true"></i>
          )
        }

        _renderPrinterSelectorWindow() {
            if (!this.state.openPrinterSelectorWindow) { return ''; }
            var self = this,
                onGettingPrinter = function(auth_printer) {
                    self.setState({
                        selectedPrinter: auth_printer,
                        openPrinterSelectorWindow: false
                    });

                    if (self.state.machineCommand === machineCommand.START) {
                        self.beamboxEvents.uploadFcode(self._fetchFormalSettings());
                    }else if (self.state.machineCommand === machineCommand.MOVE) {
                        self.beamboxEvents.movement(self.state.connectedMovementMode).done(function(status) {
                          if (status === DeviceConstants.CONNECTED) {
                            self.setState({
                              connectedMovementMode: true
                            });
                          }
                        });
                    };
                },
                onClose = function(e) {
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
                <Modal content={content} onClose={onClose}/>
            );
        }

          _renderLeftPanel() {
          return (<LeftPanel/>);
          }

          render() {
            var actionButtons = this._renderActionButtons(),
                leftPanel = this._renderLeftPanel(),
                movementMode = this._renderMovementMode(),
                printerSelector = this._renderPrinterSelectorWindow();

            return (
                    <div className="studio-container beambox-studio">
                        {movementMode}
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
