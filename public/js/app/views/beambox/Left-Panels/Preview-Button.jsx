define([
    'react',
    'reactDOM',
    'jsx!widgets/Modal',
    'jsx!views/beambox/Left-Panels/Clear-Preview-Graffiti-Button',
    'jsx!views/beambox/Left-Panels/Image-Trace-Button',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/beambox/preview-mode-background-drawer',
    'app/actions/beambox/preview-mode-controller',
    'app/actions/beambox/beambox-version-master',
    'app/actions/beambox/beambox-preference',
    'app/actions/beambox',
    'app/actions/global-actions',
    'app/stores/beambox-store',
    'jsx!app/actions/beambox/Image-Trace-Panel-Controller',
    'plugins/classnames/index',
    'helpers/api/config',
    'helpers/i18n',
], function(
    React,
    ReactDOM,
    Modal,
    ClearPreviewGraffitiButton,
    ImageTraceButton,
    PrinterSelector,
    AlertActions,
    FnWrapper,
    PreviewModeBackgroundDrawer,
    PreviewModeController,
    BeamboxVersionMaster,
    BeamboxPreference,
    BeamboxActions,
    GlobalActions,
    BeamboxStore,
    ImageTracePanelController,
    classNames,
    ConfigHelper,
    i18n
) {

    const LANG = i18n.lang.beambox.left_panel;

    return class PreviewButton extends React.Component {
        constructor() {
            super();
            this.state = {
                isPreviewMode: false,
                isImageTraceMode: false,
                isDrawing: false,
                isDrawn: false
            };
        }

        componentDidMount() {
            BeamboxStore.onStartDrawingPreviewBlob(() => this.startDrawing());
            BeamboxStore.onEndDrawingPreviewBlob(() => this.endDrawing());
            BeamboxStore.onClearCameraCanvas(() => this.hideImageTraceButton());
            BeamboxStore.onEndImageTrace(() => this.endImageTrace());
            BeamboxStore.onResetPreviewButton(() => this.resetPreviewButton());
        }

        componentWillUnmount() {
            BeamboxStore.removeStartDrawingPreviewBlobListener(() => this.startDrawing());
            BeamboxStore.removeEndDrawingPreviewBlobListener(() => this.endDrawing());
            BeamboxStore.removeClearCameraCanvasListener(() => this.hideImageTraceButton())
            BeamboxStore.removeEndImageTraceListener(() => this.endImageTrace());
            BeamboxStore.removeResetPreviewButton(() => this.resetPreviewButton());
        }

        endImageTrace() {
            this.setState({
                isPreviewMode: false,
                isImageTraceMode: false
            });
        }

        hideImageTraceButton() {
            this.setState({ isDrawn: false });
        }

        handleImageTraceClick() {
            try {
                if (this.state.isPreviewMode) {
                    PreviewModeController.end();
                }
            } catch (error) {
                console.log(error);
            } finally {
                FnWrapper.useSelectTool();
                FnWrapper.clearSelection();
                BeamboxActions.closeInsertObjectSubmenu();
                GlobalActions.monitorClosed();
                this.setState({
                    isPreviewMode: false,
                    isImageTraceMode: true
                });
            }
        }

        endDrawing() {
            ClearPreviewGraffitiButton.show();
            this.setState({ isDrawing: false, isDrawn: true });
        }

        startDrawing() {
            ClearPreviewGraffitiButton.hide();
            this.setState({ isDrawing: true, isDrawn: false });
        }

        _handlePreviewClick() {
            if (!document.getElementById('image-trace-panel-outer')) {
                ImageTracePanelController.render();
            }

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
                    this.resetPreviewButton()
                }
            };

            FnWrapper.clearSelection();
            BeamboxActions.closeInsertObjectSubmenu();
            GlobalActions.monitorClosed();

            if(!this.state.isPreviewMode) {
                tryToStartPreviewMode();
            } else {
                endPreviewMode();
            }
        }

        _renderImageTraceButton() {
            if(this.state.isImageTraceMode) {
                return ;
            } else {
                return null;
            }
        }

        resetPreviewButton() {
            FnWrapper.useSelectTool();
            this.setState({
                isPreviewMode: false,
                isImageTraceMode: false
            });
        }

        render() {
            const {
                isPreviewMode,
                isImageTraceMode,
                isDrawing,
                isDrawn
            } = this.state;
            const ImageTrace = (
                PreviewModeBackgroundDrawer.isClean() || isDrawing ?
                null :
                <ImageTraceButton
                    onClick={() => this.handleImageTraceClick()}
                />
            );

            return (
                <div>
                    <div
                        className={classNames('option', 'preview-btn', {'preview-mode-on': isPreviewMode})}
                        onClick={() => this._handlePreviewClick()}
                    >
                        {isPreviewMode ? LANG.end_preview : LANG.preview}
                    </div>
                    <span id='clear-preview-graffiti-button-placeholder' />
                    <span id='printer-selector-placeholder' />
                    {ImageTrace}
                </div>
            );
        }
    };
});
