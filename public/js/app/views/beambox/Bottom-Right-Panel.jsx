define([
    'react',
    'reactClassset',
    'app/actions/beambox/bottom-right-funcs',
    'jsx!widgets/Button-Group',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'app/actions/beambox/beambox-version-master'
], function (
    React,
    ReactCx,
    BottomRightFuncs,
    ButtonGroup,
    i18n,
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
        _handleStartClick() {
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
