define([
    'jquery',
    'react',
    'app/actions/laser',
    'jsx!widgets/Select',
    'jsx!views/laser/Setup-Panel',
    'jsx!views/laser/Image-Panel',
    'jsx!widgets/Modal',
    'jsx!views/Print-Selector',
    'helpers/nwjs/menuitem'
], function(
    $,
    React,
    laserEvents,
    SelectView,
    SetupPanel,
    ImagePanel,
    Modal,
    PrinterSelector,
    menuitem
) {
    'use strict';

    return function(args) {
        args = args || {};

        var view = React.createClass({

                _renderTopMenu: function(lang) {
                    var self = this,
                        items = [{
                            label: lang.laser.topmenu.main.label,
                            subItems: [{
                                label: lang.laser.topmenu.main.open,
                                onClick: function() {
                                    self.refs.setupPanel.refs.fileUploader.getDOMNode().click();
                                }
                            },
                            {
                                label: lang.laser.topmenu.main.save,
                                enabled: this.state.hasImage,
                                onClick: function() {
                                    self.refs.setupPanel._onExport();
                                }
                            },
                            {
                                label: lang.laser.topmenu.main.engrave,
                                enabled: this.state.hasImage,
                                onClick: function() {
                                    self.refs.setupPanel._onRunLaser();
                                }
                            }]
                        }],
                        subMenu,
                        menu;

                    menuitem.clear();

                    items.forEach(function(menu) {
                        subMenu = menuitem.createSubMenu(menu.subItems);
                        menuitem.appendToMenu(menu.label, subMenu);
                    });

                    menuitem.refresh();
                },

                _onRunLaser: function(settings) {
                    this.setState({
                        openPrinterSelectorWindow: true,
                        settings: settings
                    });
                },

                _onExport: function(settings) {
                    this.props.laserEvents.export(settings);
                },

                _openBlocker: function(is_open) {
                    this.setState({
                        openBlocker: is_open
                    })
                },

                _inactiveSelectImage: function(e) {
                    if (e.target === e.currentTarget) {
                        this.props.laserEvents.inactiveAllImage();
                    }
                },

                _renderStageSection: function() {
                    var lang = args.state.lang,
                        cx = React.addons.classSet,
                        image_panel_class = cx({
                            'panel object-position': true
                        }),
                        imagePanel = (
                            true === this.state.hasImage ?
                            <ImagePanel
                                lang={lang}
                                ref="imagePanel"
                                mode={this.state.mode}
                                className={image_panel_class}
                                onThresholdChanged={this.props.laserEvents.thresholdChanged}
                            /> :
                            ''
                        );

                    return (
                        <section id="operation-table" className="operation-table">
                            <div className="laser-object border-circle" onClick={this._inactiveSelectImage}/>
                            <SetupPanel
                                lang={lang}
                                mode={this.state.mode}
                                className='operating-panel'
                                hasImage={this.state.hasImage}
                                onRunLaser={this._onRunLaser}
                                onExport={this._onExport}
                                uploadProcess={this.props.laserEvents}
                                ref="setupPanel"
                            />
                            {imagePanel}
                        </section>
                    );
                },

                _renderPrinterSelectorWindow: function(lang) {
                    var self = this,
                        onGettingPrinter = function(auth_printer) {
                            self.setState({
                                selectedPrinter: auth_printer,
                                openPrinterSelectorWindow: false
                            });

                            self.props.laserEvents.handleLaser(self.state.settings);
                        },
                        onClose = function(e) {
                            self.setState({
                                openPrinterSelectorWindow: false
                            });
                        },
                        content = (
                            <PrinterSelector lang={lang} onClose={onClose} onGettingPrinter={onGettingPrinter}/>
                        );

                    return (
                        <Modal content={content} onClose={onClose}/>
                    );
                },

                _renderBlocker: function(lang) {
                    return (
                        true === this.state.openBlocker ?
                        <Modal content={<div className="spinner-flip spinner-reverse"/>}/> :
                        ''
                    );
                },

                render: function() {
                    var lang = args.state.lang,
                        stageSection = this._renderStageSection(),
                        printerSelector = (
                            true === this.state.openPrinterSelectorWindow ?
                            this._renderPrinterSelectorWindow(lang) :
                            ''
                        ),
                        blocker = this._renderBlocker(lang);

                    this._renderTopMenu(lang);

                    return (
                        <div className="studio-container laser-studio">
                            {printerSelector}

                            <div className="stage">
                                {stageSection}
                            </div>

                            {blocker}
                        </div>
                    );
                },

                getDefaultProps: function () {
                    return {
                        laserEvents: React.PropTypes.object,
                    };
                },
                getInitialState: function() {
                    return {
                        step: '',
                        mode: 'engrave',
                        hasImage: false,
                        selectedPrinter: 0,
                        openPrinterSelectorWindow: false,
                        openBlocker: false,
                        settings: {}
                    };
                },

                componentDidMount: function() {
                    var _laserEvents = laserEvents.call(this, args);
                    this.setProps({
                        laserEvents: _laserEvents
                    });
                },

                componentWillUnmount: function () {
                    this.props.laserEvents.destroySocket();
                }

            });

        return view;
    };
});