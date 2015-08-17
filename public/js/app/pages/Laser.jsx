define([
    'jquery',
    'react',
    'app/actions/laser',
    'jsx!widgets/Select',
    'jsx!views/laser/Setup-Panel',
    'jsx!views/laser/Image-Panel',
    'jsx!widgets/Modal',
    'jsx!views/Print-Selector'
], function(
    $,
    React,
    laserEvents,
    SelectView,
    SetupPanel,
    ImagePanel,
    Modal,
    PrinterSelector
) {
    'use strict';

    return function(args) {
        args = args || {};

        var view = React.createClass({

                _onRunLaser: function(settings) {
                    this.props.laserEvents.handleLaser(settings);
                },

                _renderStageSection: function() {
                    var lang = args.state.lang,
                        cx = React.addons.classSet,
                        image_panel_class = cx({
                            'hide': false === this.state.hasImage,
                            'panel object-position': true
                        });

                    return (
                        <section id="operation-table">
                            <div className="laser-object border-circle"/>
                            <SetupPanel
                                lang={lang}
                                mode={this.state.mode}
                                className='operating-panel'
                                hasImage={this.state.hasImage}
                                onRunLaser={this._onRunLaser}
                                ref="setupPanel"
                            />
                            <ImagePanel lang={lang} className={image_panel_class}/>
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
                        },
                        content = (
                            <PrinterSelector lang={lang} onGettingPrinter={onGettingPrinter}/>
                        ),
                        onClose = function(e) {
                            self.setState({
                                openPrinterSelectorWindow: false
                            });
                        };

                    return (
                        <Modal content={content} onClose={onClose}/>
                    );
                },

                render: function() {
                    var lang = args.state.lang,
                        stageSection = this._renderStageSection(),
                        printerSelector = (
                            true === this.state.openPrinterSelectorWindow ?
                            this._renderPrinterSelectorWindow(lang) :
                            ''
                        );

                    return (
                        <div className="studio-container laser-studio">
                            {printerSelector}

                            <div className="stage">
                                {stageSection}
                            </div>
                        </div>
                    );
                },

                getInitialState: function() {
                    return {
                        step: '',
                        mode: 'engrave',
                        hasImage: false,
                        selectedPrinter: 0,
                        openPrinterSelectorWindow: false
                    };
                },

                componentDidMount: function() {
                    this.setProps({
                        laserEvents: laserEvents(args, this)
                    });
                }

            });

        return view;
    };
});