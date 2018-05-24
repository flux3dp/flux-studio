define([
    'react',
    'plugins/classnames/index',
    'jsx!widgets/Unit-Input',
    'jsx!widgets/Slider-Control',
    'jsx!widgets/Dialog-Menu',
    'jsx!views/beambox/Insert-Object-Submenu',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'app/actions/alert-actions',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/beambox/preview-mode-controller',
    'app/actions/beambox/beambox-version-master',
    'helpers/api/config',
    'helpers/i18n',
], function(
    React,
    classNames,
    UnitInput,
    SliderControl,
    DialogMenu,
    InsertObjectSubmenu,
    Modal,
    PrinterSelector,
    AlertActions,
    FnWrapper,
    PreviewModeController,
    BeamboxVersionMaster,
    ConfigHelper,
    i18n
) {

    const Config = ConfigHelper();
    const LANG = i18n.lang.beambox.left_panel;

    class LeftPanel extends React.Component {

        constructor() {
            super();
            this.state = {
                isPreviewMode: false,
                isPrinterSelectorOpen: false
            };

            this._handlePreviewClick = this._handlePreviewClick.bind(this);
            this._handleClearPreviewClick = this._handleClearPreviewClick.bind(this);
        }
        _handlePreviewClick() {
            const __tooglePrinterSelector = () => {
                if(this.state.isPrinterSelectorOpen) {
                    this.setState({isPrinterSelectorOpen: false});
                } else {
                    this.setState({isPrinterSelectorOpen: true});
                }
            };
            const __endPreviewMode = () => {
                try {
                    PreviewModeController.end();
                } catch (error) {
                    console.log(error);
                } finally {
                    FnWrapper.useSelectTool();
                    this.setState({isPreviewMode: false});
                }
            };
            const __remindCalibrateOnce = () => {
                AlertActions.showPopupInfo('what-is-this-parameter-for?', LANG.suggest_calibrate_camera_first);
                Config.update('beambox-preference', 'should_remind_calibrate_camera', false);
            };

            if(!this.state.isPreviewMode) {
                //remind to caibrate and do nothing.
                if(Config.read('beambox-preference')['should_remind_calibrate_camera']) {
                    __remindCalibrateOnce();
                } else {
                    __tooglePrinterSelector();
                }
            }
            else {
                __endPreviewMode();
            }
        }
        _handleClearPreviewClick() {
            PreviewModeController.clearGraffiti();
        }
        _renderInsertObject() {
            return {
                label: (
                    <div onClick={FnWrapper.reset_select_mode}>
                        <span>{LANG.insert_object}</span>
                    </div>
                ),
                content: (
                    <InsertObjectSubmenu />
                ),
                disable: false
            };
        }

        _renderPreview() {
            const clearPreviewStyle = PreviewModeController.isGraffitied() ? {} : { display: 'none' };
            return {
                label: (
                    <div>
                        <span
                            className={classNames('preview-btn', {'preview-mode-on': this.state.isPreviewMode})}
                            onClick={this._handlePreviewClick}
                        >
                            {this.state.isPreviewMode?LANG.end_preview:LANG.preview}
                        </span>
                        <i
                            className='fa fa-times clear-preview'
                            style={clearPreviewStyle}
                            title="Clear all"
                            onClick={this._handleClearPreviewClick}
                        />
                    </div>
                ),
                disable: false,
                labelClass: {
                    'preview-btns': true
                }
            };
        }

        async _startPreviewMode(auth_printer) {
            const errorCallback = (errMessage) => {
                AlertActions.showPopupError('menu-item', errMessage);
                this.setState({ isPreviewMode: false });
                $(workarea).css('cursor', 'auto');
            };

            $(workarea).css('cursor', 'wait');

            try {
                await PreviewModeController.start(auth_printer, errorCallback);
                this.setState({ isPreviewMode: true });
                $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');

            } catch (error) {
                console.log(error);
                AlertActions.showPopupError('menu-item', error.message || 'Fail to start preview mode');
                FnWrapper.useSelectTool();
            }
        }

        _renderPrinterSelecter() {
            const __onGettingPrinter = async (auth_printer) => {
                if(await BeamboxVersionMaster.isUnusableVersion(auth_printer)) {
                    AlertActions.showPopupError('', i18n.lang.beambox.popup.should_update_firmware_to_continue);
                    __closePrinterSelector();
                } else {
                    __closePrinterSelector();
                    this._startPreviewMode(auth_printer);
                }
            };
            const __onClose = () => {
                __closePrinterSelector();
            };

            const __closePrinterSelector = () => {
                this.setState({ isPrinterSelectorOpen: false });
            };
            const content = (
                <PrinterSelector
                    uniqleId="laser"
                    className="preview-printer-selector"
                    onClose={__onClose}
                    onGettingPrinter={__onGettingPrinter}
                    WindowStyle={{
                        top: 'calc(50% - 180px)',
                        left: '173px'
                    }}
                    arrowDirection="left"
                />
            );
            return (
                <Modal content={content} onClose={__onClose}/>
            );
        }

        render() {
            let items = [
                this._renderInsertObject(),
                this._renderPreview(),
            ];
            const printerSelecter = (this.state.isPrinterSelectorOpen)?this._renderPrinterSelecter():'';

            return (
                <div className="left-panel">
                    <DialogMenu ref="dialogMenu" items={items}/>
                    {printerSelecter/* for preview mode */}
                </div>
            );
        }
    }
    return LeftPanel;
});
