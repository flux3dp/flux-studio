define([
    'react',
    'reactClassset',
    'app/actions/beambox/bottom-right-funcs',
    'app/actions/beambox/preview-mode-controller',
    'app/actions/beambox/beambox-preference',
    'jsx!widgets/Button-Group',
    'helpers/i18n',
    'helpers/device-master',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'app/actions/film-cutter/record-manager',
    'app/actions/film-cutter/film-cutter-manager',
    'app/actions/beambox/beambox-version-master'
], function (
    React,
    ReactCx,
    BottomRightFuncs,
    PreviewModeController,
    BeamboxPreference,
    ButtonGroup,
    i18n,
    DeviceMaster,
    Modal,
    PrinterSelector,
    AlertActions,
    RecordManager,
    FilmCutterManager,
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
            // validate last connect to cloud
            const maxOfflineDays = 3;
            if (Date.now() - RecordManager.read('last_connect_to_cloud') > maxOfflineDays * 24 * 60 * 60) {
                AlertActions.showPopupInfo('start', `您已 ${maxOfflineDays} 天未連網登入，請連網並登入帳號後，方可使用。`);
                return;
            }

            if (PreviewModeController.isPreviewMode()) {
                await PreviewModeController.end();
            }
            const isPowerTooHigh = $('#svgcontent > g.layer')
                .toArray()
                .map(layer => layer.getAttribute('data-strength'))
                .some(strength => Number(strength) > 80);

            if (isPowerTooHigh) {
                if(BeamboxPreference.read('should_remind_power_too_high_countdown') > 0) {
                    AlertActions.showPopupWarning('', lang.beambox.popup.power_too_high_damage_laser_tube);
                    BeamboxPreference.write('should_remind_power_too_high_countdown', BeamboxPreference.read('should_remind_power_too_high_countdown') - 1);
                }
            }

            this.setState({
                isPrinterSelectorOpen: true
            });
        }
        _renderPrinterSelectorWindow() {
            const onGettingPrinter = async (selected_item) => {
                this.setState({
                    isPrinterSelectorOpen: false,
                });
                //export fcode
                if (selected_item === 'export_fcode') {
                    BottomRightFuncs.exportFcode();
                    return;
                }

                //check firmware
                if (await BeamboxVersionMaster.isUnusableVersion(selected_item)) {
                    console.error('Not a valid firmware version');
                    AlertActions.showPopupError('', lang.beambox.popup.should_update_firmware_to_continue);
                    return;
                }

                await DeviceMaster.select(selected_item);
                await FilmCutterManager.syncWithMachine();

                // validate machine ownership
                if (!(await FilmCutterManager.validateMachineOwnership())) {
                    AlertActions.showPopupInfo('start', '尚未綁定這台機器，請先登入帳號並綁定這台機器');
                    return;
                }

                // validate usage cut
                const usageCutRemain = RecordManager.read('usage_cut_overall_on_cloud') - RecordManager.read('usage_cut_recorded') - RecordManager.read('usage_cut_used_on_cloud');
                if (usageCutRemain <= 0) {
                    AlertActions.showPopupInfo('start', '您已沒有剩餘切割額度，請購買額度或聯絡客服人員');
                    return;
                }

                // start task
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
                    modelFilter={PrinterSelector.BEAMBOX_FILTER}
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
