define([
    'react',
    'reactClassset',
    'app/actions/beambox/bottom-right-funcs',
    'app/actions/beambox/preview-mode-controller',
    'jsx!widgets/Button-Group',
    'helpers/i18n',
    'helpers/api/config',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'app/actions/beambox/beambox-version-master'
], function (
    React,
    ReactCx,
    BottomRightFuncs,
    PreviewModeController,
    ButtonGroup,
    i18n,
    Config,
    Modal,
    PrinterSelector,
    AlertActions,
    BeamboxVersionMaster
) {
    const lang = i18n.lang;

    class BottomRightPanel extends React.Component {
        constructor() {
            super();
            this.state = {
                isPrinterSelectorOpen: false
            };

            this._handleExportClick = this._handleExportClick.bind(this);
            this._handleStartClick = this._handleStartClick.bind(this);
            this._renderPrinterSelectorWindow = this._renderPrinterSelectorWindow.bind(this);
        }
        _handleExportClick() {
            BottomRightFuncs.exportFcode();
        }
        async _handleStartClick() {
            if (PreviewModeController.isPreviewMode()) {
                await PreviewModeController.end();
            }
            const isPowerTooHigh = $('#svgcontent > g.layer')
                .toArray()
                .map(layer => layer.getAttribute('data-strength'))
                .some(strength => Number(strength) > 80);

            if (isPowerTooHigh) {
                if(Config().read('beambox-preference')['should_remind_power_too_high_countdown'] > 0) {
                    AlertActions.showPopupWarning('', lang.beambox.popup.power_too_high_damage_laser_tube);
                    Config().update('beambox-preference', 'should_remind_power_too_high_countdown', Config().read('beambox-preference')['should_remind_power_too_high_countdown'] - 1);
                }
            }

            this.setState({
                isPrinterSelectorOpen: true
            });
        }
        _renderPrinterSelectorWindow() {
            const onGettingPrinter = async (selected_item) => {
                //export fcode
                if (selected_item === 'export_fcode') {
                    BottomRightFuncs.exportFcode();
                    this.setState({
                        isPrinterSelectorOpen: false
                    });
                    return;
                }

                //check firmware
                if (await BeamboxVersionMaster.isUnusableVersion(selected_item)) {
                    console.log('not valid version');
                    AlertActions.showPopupError('', lang.beambox.popup.should_update_firmware_to_continue);
                    this.setState({
                        isPrinterSelectorOpen: false
                    });
                    return;
                }

                // start task
                this.setState({
                    isPrinterSelectorOpen: false,
                });
                BottomRightFuncs.uploadFcode(selected_item);
            };
            const onClose = () => {
                this.setState({
                    isPrinterSelectorOpen: false
                });
            };
            const content = (
                <PrinterSelector
                    uniqleId="laser"
                    className="laser-device-selection-popup"
                    showExport={true}
                    onClose={onClose}
                    onGettingPrinter={onGettingPrinter}
                />
            );
            return (
                <Modal content={content} onClose={onClose} />
            );
        }
        _renderActionButtons() {
            const buttons = [
                {
                    label: lang.monitor.start,
                    className: ReactCx.cx({
                        'btn-disabled': false,
                        'btn-default': true,
                        'btn-hexagon': true,
                        'btn-go': true
                    }),
                    dataAttrs: {
                        'ga-event': 'laser-goto-monitor'
                    },
                    onClick: this._handleStartClick
                }
            ];

            return (
                <ButtonGroup buttons={buttons} className="beehive-buttons action-buttons" />
            );
        }
        render() {
            const actionButtons = this._renderActionButtons();
            const printerSelector = this._renderPrinterSelectorWindow();

            return (
                <div>
                    {actionButtons}
                    {this.state.isPrinterSelectorOpen?printerSelector:''}
                </div>
            );
        }
    }
    return BottomRightPanel;

});
