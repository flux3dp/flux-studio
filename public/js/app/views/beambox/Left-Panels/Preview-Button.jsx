define([
    'react',
    'reactDOM',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/beambox/preview-mode-controller',
    'app/actions/beambox/beambox-version-master',
    'app/actions/beambox/beambox-preference',
    'plugins/classnames/index',
    'helpers/api/config',
    'helpers/i18n',
], function(
    React,
    ReactDOM,
    Modal,
    PrinterSelector,
    AlertActions,
    FnWrapper,
    PreviewModeController,
    BeamboxVersionMaster,
    BeamboxPreference,
    classNames,
    ConfigHelper,
    i18n
) {

    const LANG = i18n.lang.beambox.left_panel;

    return class LeftPanel extends React.Component {
        constructor() {
            super();
            this.state = {
                isPreviewMode: false
            };
        }

        _handlePreviewClick() {
            const tryToStartPreviewMode = async () => {

                const isAlreadyRemindUserToCalibrateCamera = () => {
                    return !BeamboxPreference.read('should_remind_calibrate_camera');
                };

                const remindCalibrateCamera = () => {
                    AlertActions.showPopupInfo('what-is-this-parameter-for?', LANG.suggest_calibrate_camera_first);
                    BeamboxPreference.write('should_remind_calibrate_camera', false);
                };

                const isFirmwareVersionValid = async (device) => {
                    return !(await BeamboxVersionMaster.isUnusableVersion(device));
                };

                const alertUserToUpdateFirmware = () => {
                    AlertActions.showPopupError('', i18n.lang.beambox.popup.should_update_firmware_to_continue);
                };

                // return device or false
                const getDeviceToUse = async () => {
                    const d = $.Deferred();
                    const root = document.getElementById('printer-selector-placeholder');
                    const printerSelector = (
                        <Modal onClose={d.reject}>
                            <PrinterSelector
                                uniqleId='laser'
                                className='preview-printer-selector'
                                modelFilter={PrinterSelector.BEAMBOX_FILTER}
                                onClose={d.reject}
                                onGettingPrinter={device => d.resolve(device)}
                                WindowStyle={{
                                    top: 'calc(50% - 180px)',
                                    left: '173px'
                                }}
                                arrowDirection='left'
                            />
                        </Modal>
                    );
                    try {
                        ReactDOM.render(printerSelector, root);
                        const device = await d;
                        ReactDOM.unmountComponentAtNode(root);
                        return device;
                    } catch (error) {
                        console.log(error);
                        ReactDOM.unmountComponentAtNode(root);
                        return false;
                    }
                };

                const startPreviewMode = async (device) => {
                    const errorCallback = (errMessage) => {
                        AlertActions.showPopupError('menu-item', errMessage);
                        this.setState({ isPreviewMode: false });
                        $(workarea).css('cursor', 'auto');
                    };

                    $(workarea).css('cursor', 'wait');

                    try {
                        await PreviewModeController.start(device, errorCallback);
                        this.setState({ isPreviewMode: true });
                        $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');

                    } catch (error) {
                        console.log(error);
                        AlertActions.showPopupError('menu-item', error.message || 'Fail to start preview mode');
                        FnWrapper.useSelectTool();
                    }
                };


                // MAIN PROCESS HERE

                if (!isAlreadyRemindUserToCalibrateCamera()) {
                    remindCalibrateCamera();
                    return;
                }

                const device = await getDeviceToUse();
                if (!device) {
                    return;
                };

                if (!(await isFirmwareVersionValid(device))) {
                    alertUserToUpdateFirmware();
                    return;
                }

                startPreviewMode(device);
            };

            const endPreviewMode = () => {
                try {
                    PreviewModeController.end();
                } catch (error) {
                    console.log(error);
                } finally {
                    FnWrapper.useSelectTool();
                    this.setState({isPreviewMode: false});
                }
            };

            if(!this.state.isPreviewMode) {
                tryToStartPreviewMode();
            } else {
                endPreviewMode();
            }
        }

        render() {
            return (
                <div>
                    <div
                        className={classNames('option', 'preview-btn', {'preview-mode-on': this.state.isPreviewMode})}
                        onClick={() => this._handlePreviewClick()}
                    >
                        {this.state.isPreviewMode ? LANG.end_preview : LANG.preview}
                    </div>
                    <span id='clear-preview-graffiti-button-placeholder' />
                    <span id='printer-selector-placeholder' />
                </div>
            );
        }
    };
});
