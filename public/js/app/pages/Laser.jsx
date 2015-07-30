define([
    'jquery',
    'react',
    'app/actions/laser',
    'jsx!widgets/Select',
    'jsx!views/laser/Setup-Panel',
    'jsx!views/laser/Image-Panel'
], function($, React, laserEvents, SelectView, SetupPanel, ImagePanel) {
    'use strict';

    return function(args) {
        args = args || {};

        var view = React.createClass({
                _renderHeader: function() {
                    var lang = args.state.lang,
                        cx = React.addons.classSet,
                        export_file_class = cx({
                            'btn btn-default fa fa-floppy-o': true,
                            'hide': false === this.state.has_image
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
                            'hide': false === this.state.has_image,
                            'panel object-position': true
                        });

                    return (
                        <section id="operation-table">
                            <div className="laser-object border-circle"/>
                            <SetupPanel lang={lang} mode={this.state.mode} className='operating-panel' hasImage={this.state.has_image}/>
                            <ImagePanel lang={lang} className={image_panel_class}/>
                        </section>
                    );
                },
                render : function() {
                    var lang = args.state.lang,
                        header = this._renderHeader(),
                        stageSection = this._renderStageSection();

                    return (
                        <div className="studio-container laser-studio">

                            {header}

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
                        has_image: false
                    };
                },
                componentDidMount: function() {
                    laserEvents(args, this);
                }

            });

        return view;
    };
});