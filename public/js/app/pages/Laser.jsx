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
                _setupSettings: undefined,

                _saveSettings: function(settings) {
                    this._setupSettings = settings;
                },

                _renderHeader: function() {
                    var lang = args.state.lang,
                        cx = React.addons.classSet,
                        export_file_class = cx({
                            'btn btn-default fa fa-floppy-o': true,
                            'hide': false === this.state.hasImage
                        });

                    return (
                        <header className="top-menu-bar">
                            <div className="btn-h-group pull-left">
                                <div className="btn btn-default file-importer">
                                    <lable className="fa fa-plus">{lang.laser.import}</lable>
                                    <input type="file" multiple/>
                                </div>
                                <button className={export_file_class}>{lang.laser.save}</button>
                            </div>
                        </header>
                    );
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
                                getSettings={this._saveSettings}
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
                            self.props.doLaser(self._setupSettings);
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
                        header = this._renderHeader(),
                        stageSection = this._renderStageSection(),
                        printerSelector = (
                            true === this.state.openPrinterSelectorWindow ?
                            this._renderPrinterSelectorWindow(lang) :
                            ''
                        );

                    this._setupSettings = lang.laser.advanced.form.object_options.options.filter(
                        function(obj) {
                            return true === obj.selected;
                        }
                    )[0].data;

                    return (
                        <div className="studio-container laser-studio">
                            {header}
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
                    laserEvents(args, this);
                }

            });

        return view;
    };
});