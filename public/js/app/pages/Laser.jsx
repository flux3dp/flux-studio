define([
    'jquery',
    'react',
    'app/actions/laser',
    'app/actions/alert-actions',
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
    'helpers/dnd-handler'
], function(
    $,
    React,
    laserEvents,
    AlertActions,
    ProgressActions,
    SelectView,
    LaserSetupPanel,
    HolderSetupPanel,
    ImagePanel,
    FileUploader,
    Modal,
    PrinterSelector,
    ButtonGroup,
    config,
    dndHandler
) {
    'use strict';

    return function(args) {
        args = args || {};

        var storageDefaultKey = storageDefaultKey = args.props.page.toLowerCase() + '-defaults',
            view = React.createClass({
                getDefaultProps: function() {
                    return {
                        page: ''
                    };
                },

                getInitialState: function() {
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
                        threshold: 128,
                        images: []
                    };
                },

                componentDidMount: function() {
                    var self = this;

                    dndHandler.plug(document, self._onDropUpload);

                    self.state.laserEvents.setPlatform(self.refs.laserObject.getDOMNode());


                    self.state.laserEvents.menuFactory.items.import.onClick = function() {
                        self.refs.fileUploader.getDOMNode().click();
                    };

                    self.state.laserEvents.menuFactory.items.execute.enabled = false;
                    self.state.laserEvents.menuFactory.items.execute.onClick = function() {
                        self._onRunLaser();
                    };

                    self.state.laserEvents.menuFactory.items.saveTask.enabled = false;
                    self.state.laserEvents.menuFactory.items.saveTask.onClick = function() {
                        self._onExport('-f');
                    };
                },

                componentWillUnmount: function () {
                    this.state.laserEvents.destroySocket();
                    this.state.laserEvents.destroy();
                    dndHandler.unplug(document);
                },

                // UI events
                _onRunLaser: function() {
                    this.setState({
                        openPrinterSelectorWindow: true,
                        settings: this._fetchFormalSettings()
                    });
                },

                _onExport: function(filemode) {
                    this.state.laserEvents.exportTaskCode(this._fetchFormalSettings(), filemode);
                },

                _onDropUpload: function(e) {
                    e.preventDefault();

                    var self = this,
                        uploadedFiles = e.originalEvent.dataTransfer.files;

                    e.target.files = uploadedFiles;
                    this.refs.fileUploader.readFiles(e, uploadedFiles);
                },

                _onShadingChanged: function(e) {
                    var self = this,
                        $images = self.state.laserEvents.getCurrentImages();

                    $images.each(function(k, el) {
                        var $el = $(el);

                        self.state.laserEvents.refreshImage($el, $el.data('threshold') || 128);
                    });
                },

                // Private events
                _fetchFormalSettings: function() {
                    var self = this,
                        defaultSettings = config().read(storageDefaultKey),
                        max = args.state.lang.laser.advanced.form.power.max,
                        data;

                    if ('laser' === self.props.page) {
                        data = {
                            object_height: defaultSettings.objectHeight,
                            laser_speed: defaultSettings.material.data.laser_speed,
                            power: defaultSettings.material.data.power / max,
                            shading: (true === self.refs.setupPanel.isShading() ? 1 : 0)
                        };
                    }
                    else {
                        data = {
                            lift_height: defaultSettings.liftHeight || 0.1,
                            draw_height: defaultSettings.drawHeight || 0.1,
                            speed: defaultSettings.speed || 20
                        };
                    }

                    return data;
                },

                _inactiveSelectImage: function(e) {
                    if (e.target === e.currentTarget) {
                        this.state.laserEvents.inactiveAllImage();
                    }
                },

                // Lifecycle
                _renderStageSection: function() {
                    var self = this,
                        lang = args.state.lang,
                        cx = React.addons.classSet,
                        image_panel_class = cx({
                            'panel object-position': true
                        }),
                        imagePanel = (
                            true === this.state.selectedImage ?
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
                        paramPanel,
                        setupPanelDefaults;

                    config().read(storageDefaultKey, {
                        onFinished: function(response) {
                            setupPanelDefaults = response || {};

                            if ('laser' === self.props.page) {
                                if ('undefined' === typeof setupPanelDefaults.material) {
                                    setupPanelDefaults.material = lang.laser.advanced.form.object_options.options[0];
                                }

                                setupPanelDefaults.objectHeight = setupPanelDefaults.objectHeight || 0;
                                setupPanelDefaults.isShading = (
                                    'boolean' === typeof setupPanelDefaults.isShading ?
                                    setupPanelDefaults.isShading :
                                    true
                                );
                            }
                            // holder
                            else {
                                setupPanelDefaults = {
                                    liftHeight: response.liftHeight || 55,
                                    drawHeight: response.drawHeight || 50,
                                    speed: response.speed || 20
                                }
                            }

                            if ('' === response) {
                                config().write(storageDefaultKey, setupPanelDefaults);
                            }
                        }
                    });

                    paramPanel = (
                        'laser' === this.props.page ?
                        <LaserSetupPanel
                            lang={lang}
                            page={this.props.page}
                            className="operating-panel"
                            imageFormat={this.state.fileFormat}
                            defaults={setupPanelDefaults}
                            ref="setupPanel"
                            onShadingChanged={this._onShadingChanged}
                        /> :
                        <HolderSetupPanel
                            lang={lang}
                            page={this.props.page}
                            className="operating-panel"
                            imageFormat={this.state.fileFormat}
                            defaults={setupPanelDefaults}
                            ref="setupPanel"
                        />
                    );

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

                _renderPrinterSelectorWindow: function(lang) {
                    var self = this,
                        onGettingPrinter = function(auth_printer) {
                            self.setState({
                                selectedPrinter: auth_printer,
                                openPrinterSelectorWindow: false
                            });

                            self.state.laserEvents.handleLaser(self.state.settings);
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

                _renderFileUploader: function(lang) {
                    var self = this,
                        cx = React.addons.classSet,
                        uploadStyle = cx({
                            'file-importer': false === self.state.hasImage,
                            'absolute-center': false === self.state.hasImage,
                            'hide': true === self.state.hasImage

                        }),
                        accept = ('laser' === self.props.page ? 'image/*' : 'image/svg'),
                        onError = function(msg) {
                            ProgressActions.close();
                            AlertActions.showPopupError('laser-upload-error', msg);
                        },
                        lang = args.state.lang,
                        typeErrorMessage = (
                            'laser' === self.props.page ?
                            lang.laser.laser_accepted_images :
                            lang.laser.draw_accepted_images
                        );

                    return (
                        <div className={uploadStyle}>
                            <lable>{lang.laser.import}</lable>
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

                _renderActionButtons: function(lang) {
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
                            onClick: this._onExport.bind(null, '-f')
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
                            onClick: this._onRunLaser
                        }];

                    return (
                        <ButtonGroup buttons={buttons} className="beehive-buttons action-buttons"/>
                    );
                },

                render: function() {
                    var self = this,
                        lang = args.state.lang,
                        stageSection = this._renderStageSection(),
                        printerSelector = (
                            true === this.state.openPrinterSelectorWindow ?
                            this._renderPrinterSelectorWindow(lang) :
                            ''
                        ),
                        uploader = this._renderFileUploader(lang),
                        actionButtons = this._renderActionButtons(lang);

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
