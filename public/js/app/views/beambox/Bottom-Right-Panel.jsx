define([
    'react',
    'app/actions/beambox/bottom-right-funcs',
    'jsx!widgets/Button-Group',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'app/actions/beambox/beambox-version-master'
], function (
    React,
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
            }

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
            const onGettingPrinter = async (auth_printer) => {
                if(await BeamboxVersionMaster.isUnusableVersion(auth_printer)) {
                    console.log('not valid version');
                    AlertActions.showPopupError('', i18n.lang.beambox.popup.should_update_firmware_to_continue);
                    this.setState({
                        isPrinterSelectorOpen: false
                    });
                    return;
                }
                this.setState({
                    isPrinterSelectorOpen: false,
                });

                BottomRightFuncs.uploadFcode(auth_printer);
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
                    onClose={onClose}
                    onGettingPrinter={onGettingPrinter}
                />
            );
            return (
                <Modal content={content} onClose={onClose} />
            );
        }
        _renderActionButtons() {
            const cx = React.addons.classSet;
            const buttons = [{
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
                    onClick: this._handleExportClick
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
                    onClick: this._handleStartClick
                }];

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
