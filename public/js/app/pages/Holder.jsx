define([
    'jquery',
    'react',
    'app/actions/laser',
    'app/actions/alert-actions',
    'app/actions/global-interaction',
    'app/actions/progress-actions',
    'jsx!widgets/Select',
    'jsx!views/laser/Setup-Panel',
    'jsx!views/holder/Setup-Panel',
    'jsx!views/laser/Image-Panel',
    'jsx!widgets/File-Uploader',
    'jsx!widgets/Modal',
    'jsx!views/Printer-Selector',
    'jsx!widgets/Button-Group',
    'helpers/api/config',
    'helpers/i18n',
    'helpers/dnd-handler'
], function(
    $,
    React,
    laserEvents,
    AlertActions,
    GlobalInteraction,
    ProgressActions,
    SelectView,
    LaserSetupPanel,
    HolderSetupPanel,
    ImagePanel,
    FileUploader,
    Modal,
    PrinterSelector,
    ButtonGroup,
    ConfigHelper,
    i18n,
    DnDHandler
) {
    'use strict';

    let Config = ConfigHelper(),
        lang = i18n.lang;

    class HolderGlobalInteraction extends GlobalInteraction {
        constructor() {
            super();
            this._instance = undefined;
            this._actions = {
                "IMPORT": () => {
                    if(electron) {
                        electron.trigger_file_input_click("file-upload-widget")
                    }
                },
                "EXPORT_FLUX_TASK": () => this._instance._handleExportClick("-f"),
                "CLEAR_SCENE": () => this._instance.state.laserEvents.clearScene(),
            }
        }
        attach(instance) {
            this._instance = instance
            this._hasImage = false;
            super.attach(["IMPORT"]);
        }
        onImageChanged(hasImage) {
            if(this._hasImage !== hasImage) {
                this._hasImage = hasImage;
                if(hasImage) {
                    this.enableMenuItems(["EXPORT_FLUX_TASK", "CLEAR_SCENE"]);
                } else {
                    this.disableMenuItems(["EXPORT_FLUX_TASK", "CLEAR_SCENE"]);
                }
            }
        }
    }

    return function(args) {
        args = args || {};

        let globalInteraction = new HolderGlobalInteraction();

        let view = React.createClass({
                getDefaultProps: function() {
                    return {
                        page: React.PropTypes.string
                    };
                },

                getInitialState: function() {
                    console.log('this.props', this.props);
                    return {
                        mode: 'engrave',
                        hasImage: false,
                        selectedImage: false,
                        fileFormat: undefined,
                        selectedPrinter: 0,
                        openPrinterSelectorWindow: false,
                        openBlocker: false,
                        settings: {},
                        laserEvents: laserEvents.call(this, args),
                        imagePanel: {},
                        position: {},
                        size: {},
                        sizeLock: false,
                        angle: 0,
                        threshold: 255,
                        images: [],
                        machineCommand: 'start'
                    };
                },

                componentDidMount: function() {
                    var self = this;

                    globalInteraction.attach(this);

                    DnDHandler.plug(document, self._handleDragAndDrop);


                    self.state.laserEvents.setPlatform(self.refs.laserObject.getDOMNode());

                    self.state.laserEvents.menuFactory.items.execute.enabled = false;
                    self.state.laserEvents.menuFactory.items.execute.onClick = function() {
                        self._handleStartClick();
                    };

                    var laser_custom_bg = Config.read('laser-custom-bg') && this.props.page === 'laser';
                    if (laser_custom_bg) {
                        $('.laser-object').css({background :'url(' + laser_custom_bg + ')', 'background-size': '100% 100%'});
                    }

                    self.setState({
                        setupPanelDefaults: this.props.panelOptions
                    });

                    if(!Config.read('laser-calibrated') && this.props.page === 'laser') {
                        // NOTE: only yes no support this kind of callback
                        AlertActions.showPopupYesNo('do-calibrate', lang.laser.do_calibrate, '', null, {
                            yes: function() {
                                self._onLoadCalibrationImage();
                                Config.write('laser-calibrated', true);
                            },
                            no: function() {
                                Config.write('laser-calibrated', true);
                            }
                        });
                    }
                },

                componentWillUnmount: function () {
                    globalInteraction.detach()
                    this.state.laserEvents.destroySocket();
                    this.state.laserEvents.destroy();
                    DnDHandler.unplug(document);
                },

                componentWillReceiveProps(nextProps) {
                    this.setState({
                        panelOptions: nextProps.panelOptions
                    });
                },

                // UI events
                _handleStartClick: function() {
                    this.setState({
                        openPrinterSelectorWindow: true,
                        machineCommand: 'start',
                        settings: this._fetchFormalSettings()
                    });
                },
                _handleShowOutlineClick: function() {
                    this.setState({
                        openPrinterSelectorWindow: true,
                        machineCommand: 'showOutline',
                        settings: this._fetchFormalSettings()
                    });
                },

                _handleCalibrateClick: function() {
                    this.setState({
                        openPrinterSelectorWindow: true,
                        machineCommand: 'calibrate'
                    });
                },

                _handleZProbeClick: function() {
                    this.setState({
                        openPrinterSelectorWindow: true,
                        machineCommand: 'zprobe'
                    });
                },

                _handleExportClick: function(filemode) {
                    this.state.laserEvents.exportTaskCode(this._fetchFormalSettings(), filemode);
                },

                _handleDragAndDrop: function(e) {
                    e.preventDefault();

                    var uploadedFiles = e.originalEvent.dataTransfer.files;

                    e.target.files = uploadedFiles;
                    this.refs.fileUploader.readFiles(e, uploadedFiles);
                },

                _onLoadCalibrationImage: function(e) {
                    this.state.laserEvents.uploadDefaultLaserImage();
                    this.setState({debug: 1}); // Debug flag will be reset at laser.js/deleteImage
                },

                _onShadingChanged: function(e) {
                    var self = this,
                        $images = self.state.laserEvents.getCurrentImages();

                    $images.each(function(k, el) {
                        var $el = $(el);

                        self.state.laserEvents.refreshImage($el, $el.data('threshold') || 255);
                    });
                },

                // Private events
                _fetchFormalSettings: function() {
                    return this.props.fetchFormalSettings(this);
                },

                _inactiveSelectImage: function(e) {
                    if (e.target === e.currentTarget) {
                        this.state.laserEvents.inactiveAllImage();
                    }
                },

                // Lifecycle
                _renderStageSection: function() {
                    var self = this,
                        cx = React.addons.classSet,
                        image_panel_class = cx({
                            'panel object-position': true
                        }),
                        imagePanel = (
                            this.state.selectedImage ?
                            <ImagePanel
                                lang={lang}
                                initialPosition={this.state.initialPosition}
                                ref="imagePanel"
                                sizeLock={this.state.sizeLock}
                                mode={this.state.mode}
                                className={image_panel_class}
                                onThresholdChanged={this.state.laserEvents.thresholdChanged}
                                onTransform={this.state.laserEvents.imageTransform}
                                position={this.state.position}
                                size={this.state.size}
                                angle={this.state.angle}
                                threshold={this.state.threshold}
                            /> :
                            ''
                        ),
                        closeSubPopup = function(e) {
                            e.cancelBubble = true;
                            e.stopPropagation();

                            if ('true' === e.target.dataset.closeImagePanel) {
                                self.refs.setupPanel.openSubPopup(e);
                                self._inactiveSelectImage(e);
                            }
                        },
                        paramPanel;

                    paramPanel = this.state.panelOptions ? this.props.renderSetupPanel(this) : null;

                    return (
                        <div ref="laserStage" className="laser-stage">
                            <section ref="operationTable" data-close-image-panel="true" className="operation-table" onClick={closeSubPopup}>
                                <div ref="laserObject" data-close-image-panel="true" className="laser-object border-circle" onClick={closeSubPopup}/>
                                {imagePanel}
                            </section>
                            {paramPanel}
                        </div>
                    );
                },

                _renderPrinterSelectorWindow: function() {
                    if (!this.state.openPrinterSelectorWindow) { return ''; }
                    var self = this,
                        onGettingPrinter = function(auth_printer) {
                            self.setState({
                                selectedPrinter: auth_printer,
                                openPrinterSelectorWindow: false
                            });

                            self.state.laserEvents.runCommand(self.state.settings, self.state.machineCommand);
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
                },

                _renderFileUploader: function() {
                    var self = this,
                        cx = React.addons.classSet,
                        uploadStyle = cx({
                            'file-importer': !self.state.hasImage,
                            'absolute-center': !self.state.hasImage,
                            'hide': self.state.hasImage

                        }),
                        accept = self.props.acceptFormat,
                        onError = function(msg) {
                            ProgressActions.close();
                            AlertActions.showPopupError('laser-upload-error', msg);
                        },
                        typeErrorMessage = (
                            'laser' === self.props.page ?
                            lang.laser.laser_accepted_images :
                            lang.laser.draw_accepted_images
                        );

                    return (
                        <div className={uploadStyle}>
                            <label htmlFor="file-uploader">{lang.laser.import}</label>
                            <FileUploader
                                ref="fileUploader"
                                accept={accept}
                                typeErrorMessage={typeErrorMessage}
                                multiple={true}
                                onReadFileStarted={this.state.laserEvents.onReadFileStarted}
                                onReadEnd={this.state.laserEvents.onFileReadEnd}
                                onError={onError}
                            />
                        </div>
                    );
                },

                _renderActionButtons: function() {
                    globalInteraction.onImageChanged(this.state.hasImage);

                    var cx = React.addons.classSet,
                        buttons = [{
                            label: lang.laser.get_fcode,
                            className: cx({
                                'btn-disabled': !this.state.hasImage,
                                'btn-default': true,
                                'btn-hexagon': true,
                                'btn-get-fcode': true
                            }),
                            dataAttrs: {
                                'ga-event': 'get-laser-fcode'
                            },
                            onClick: this._handleExportClick.bind(null, '-f')
                        }, {
                            label: lang.monitor.start,
                            className: cx({
                                'btn-disabled': !this.state.hasImage,
                                'btn-default': true,
                                'btn-hexagon': true,
                                'btn-go': true
                            }),
                            dataAttrs: {
                                'ga-event': 'laser-goto-monitor'
                            },
                            onClick: this._handleStartClick
                        }];

                    if (this.props.page === 'laser') {
                        buttons = [{
                            label: lang.laser.showOutline,
                            className: cx({
                                'btn-disabled': !this.state.hasImage,
                                'btn-default': true,
                                'btn-hexagon': true,
                                'btn-go': true
                            }),
                            dataAttrs: {
                                'ga-event': 'holder-outline'
                            },
                            onClick: this._handleShowOutlineClick
                        }].concat(buttons);
                    }

                    if (this.props.page === 'cut' || this.props.page === 'mill') {
                        buttons = [{
                            label: lang.cut.horizontal_calibrate,
                            className: cx({
                                'btn-disabled': false,
                                'btn-default': true,
                                'btn-hexagon': true,
                                'btn-go': true,
                                'mini-text': i18n.getActiveLang() === 'en'
                            }),
                            dataAttrs: {
                                'ga-event': 'holder-calibrate'
                            },
                            onClick: this._handleCalibrateClick
                        },
                        {
                            label: lang.cut.height_calibrate,
                            className: cx({
                                'btn-disabled': false,
                                'btn-default': true,
                                'btn-hexagon': true,
                                'btn-go': true,
                                'mini-text': i18n.getActiveLang() === 'en'
                            }),
                            dataAttrs: {
                                'ga-event': 'holder-calibrate'
                            },
                            onClick: this._handleZProbeClick
                        }].concat(buttons);
                    }

                    return (
                        <ButtonGroup buttons={buttons} className="beehive-buttons action-buttons"/>
                    );
                },

                render: function() {
                    var stageSection = this._renderStageSection(),
                        printerSelector = this._renderPrinterSelectorWindow(),
                        uploader = this._renderFileUploader(),
                        actionButtons = this._renderActionButtons();
                    return (
                        <div className="studio-container laser-studio">
                            {printerSelector}

                            <div className="stage">
                                {stageSection}
                                {actionButtons}
                            </div>

                            {uploader}
                        </div>
                    );
                }

            });

        return view;
    };
});
