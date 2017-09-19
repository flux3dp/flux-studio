define([
    'react',
    'app/actions/beambox',
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

    if (!Config.read('beambox-defaults')) {
        Config.write('beambox-defaults', DefaultConfig);
    }


    return function(args = {}) {
        let Svg = SvgGenerator(args);
            self = this;

        class view extends React.Component {
        constructor(){
            super();
            this.beamboxEvents = beamboxEvents.call(this);
            this.state = {
                openPrinterSelectorWindow: false
            };
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
                      label: lang.laser.get_fcode,
                      className: cx({
                          //'btn-disabled': !this.state.hasImage,
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
                          //'btn-disabled': !this.state.hasImage,
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

        _handleStartClick() {
            this.setState({
                openPrinterSelectorWindow: true,
                machineCommand: 'start',
                settings: this._fetchFormalSettings()
            });
        }

        _renderPrinterSelectorWindow() {
            if (!this.state.openPrinterSelectorWindow) { return ''; }
            var self = this,
                onGettingPrinter = function(auth_printer) {
                    self.setState({
                        selectedPrinter: auth_printer,
                        openPrinterSelectorWindow: false
                    });

                    self.beamboxEvents.uploadFcode(self._fetchFormalSettings());
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
                printerSelector = this._renderPrinterSelectorWindow();

            return (
                    <div className="studio-container beambox-studio">
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
