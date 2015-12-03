define([
    'jquery',
    'react',
    'app/actions/laser',
    'app/actions/progress-actions',
    'app/stores/progress-store',
    'jsx!widgets/Select',
    'jsx!views/laser/Setup-Panel',
    'jsx!views/laser/Image-Panel',
    'jsx!widgets/File-Uploader',
    'jsx!widgets/Modal',
    'jsx!views/Print-Selector',
    'jsx!widgets/Alert',
    'jsx!widgets/Button-Group',
    'helpers/api/config'
], function(
    $,
    React,
    laserEvents,
    ProgressActions,
    ProgressStore,
    SelectView,
    SetupPanel,
    ImagePanel,
    FileUploader,
    Modal,
    PrinterSelector,
    Alert,
    ButtonGroup,
    config
) {
    'use strict';

    return function(args) {
        args = args || {};

        var view = React.createClass({
                // UI events
                _onRunLaser: function() {
                    this.setState({
                        openPrinterSelectorWindow: true,
                        settings: this._fetchFormalSettings()
                    });
                },

                _onExport: function() {
                    this.state.laserEvents.export(this._fetchFormalSettings());
                },

                _onDropUpload: function(e) {
                    e.preventDefault();

                    var updatedFiles = e.originalEvent.dataTransfer.files;

                    e.target.files = updatedFiles;
                    this.refs.fileUploader.readFiles(e, updatedFiles);
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
                        defaultSettings = config().read('laser-defaults'),
                        max = args.state.lang.laser.advanced.form.power.max;

                    return {
                        object_height: defaultSettings.objectHeight,
                        laser_speed: defaultSettings.material.data.laser_speed,
                        power: defaultSettings.material.data.power / max,
                        shading: (true === self.refs.setupPanel.isShading() ? 0 : 1)
                    };
                },

                _openBlocker: function(isOpen, onFinished) {
                    onFinished = onFinished || function() {};

                    if (true === isOpen) {
                        ProgressActions.open('', '', '', onFinished);
                    }
                    else {
                        ProgressActions.close();
                    }
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
                            if ('operation-table' === e.currentTarget.id) {
                                self.refs.setupPanel.openSubPopup(e);
                            }
                        },
                        setupPanelDefaults;

                    config().read('laser-defaults', {
                        onFinished: function(response) {
                            setupPanelDefaults = response || {};

                            if ('undefined' === typeof setupPanelDefaults.material) {
                                setupPanelDefaults.material = lang.laser.advanced.form.object_options.options[0];
                            }

                            setupPanelDefaults.objectHeight = setupPanelDefaults.objectHeight || 0;

                            if ('' === response) {
                                config().write('laser-defaults', setupPanelDefaults);
                            }
                        }
                    });

                    return (
                        <div ref="laserStage" className="laser-stage">
                            <section ref="operationTable" id="operation-table" className="operation-table" onClick={closeSubPopup}>
                                <div ref="laserObject" className="laser-object border-circle" onClick={this._inactiveSelectImage}/>
                                {imagePanel}
                            </section>
                            <SetupPanel
                                lang={lang}
                                className="operating-panel"
                                imageFormat={this.state.fileFormat}
                                defaults={setupPanelDefaults}
                                ref="setupPanel"
                                onShadingChanged={this._onShadingChanged}
                            />
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

                _renderAlert: function(lang) {
                    var self = this,
                        onClose = function() {
                            self.setState({
                                openAlert: false
                            });
                        },
                        buttons = [
                            {
                                label: lang.laser.close_alert,
                                onClick: onClose
                            }
                        ],
                        content = (
                            <Alert
                                lang={lang}
                                caption={self.state.alertContents.caption}
                                message={self.state.alertContents.message}
                                buttons={buttons}
                            />
                        );

                    return (
                        true === self.state.openAlert ?
                        <Modal content={content} disabledEscapeOnBackground={true} onClose={onClose}/> :
                        ''
                    );
                },

                _renderFileUploader: function(lang) {
                    var self = this,
                        uploadStyle = false === self.state.hasImage ? 'file-importer absolute-center' : 'hide',
                        onError = function(msg) {
                            self.setState({
                                openAlert: true,
                                alertContents: {
                                    caption: 'Error',
                                    message: msg
                                }
                            });
                        };

                    return (
                        <div className={uploadStyle}>
                            <lable>{lang.laser.import}</lable>
                            <FileUploader
                                ref="fileUploader"
                                accept="image/*"
                                multiple={true}
                                onReadFileStarted={this.state.laserEvents.onReadFileStarted}
                                onReadingFile={this.state.laserEvents.onFileReading}
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
                            onClick: this._onExport
                        }, {
                            label: lang.laser.go,
                            className: cx({
                                'btn-disabled': !this.state.hasImage,
                                'btn-default': true,
                                'btn-hexagon': true,
                                'btn-go': true
                            }),
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
                        actionButtons = this._renderActionButtons(lang),
                        alert = this._renderAlert(lang);

                    return (
                        <div className="studio-container laser-studio">
                            {printerSelector}

                            <div className="stage">
                                {stageSection}
                                {actionButtons}
                            </div>

                            {uploader}
                            {alert}
                        </div>
                    );
                },

                getInitialState: function() {
                    return {
                        step: '',
                        mode: 'engrave',
                        hasImage: false,
                        selectedImage: false,
                        fileFormat: undefined,
                        selectedPrinter: 0,
                        openPrinterSelectorWindow: false,
                        openBlocker: false,
                        openAlert: false,
                        alertContents: {},
                        settings: {},
                        laserEvents: laserEvents.call(this, args),
                        imagePanel: {},
                        position: {},
                        size: {},
                        angle: 0,
                        threshold: 128
                    };
                },

                componentDidMount: function() {
                    var self = this,
                        $operationTable = $(self.refs.operationTable.getDOMNode());

                    $operationTable.on('dragover dragend', function(e) {
                        e.preventDefault();
                    });
                    $operationTable.on('drop', self._onDropUpload);

                    self.state.laserEvents.setPlatform(self.refs.laserObject.getDOMNode());


                    self.state.laserEvents.menuFactory.items.import.onClick = function() {
                        self.refs.setupPanel.refs.fileUploader.getDOMNode().click();
                    };

                    self.state.laserEvents.menuFactory.items.execute.enabled = false;
                    self.state.laserEvents.menuFactory.items.execute.onClick = function() {
                        self.refs.setupPanel._onRunLaser();
                    };

                    self.state.laserEvents.menuFactory.items.saveGCode.enabled = false;
                    self.state.laserEvents.menuFactory.items.saveGCode.onClick = function() {
                        self.refs.setupPanel._onExport();
                    };
                },

                componentWillUnmount: function () {
                    this.state.laserEvents.destroySocket();
                }
            });

        return view;
    };
});
