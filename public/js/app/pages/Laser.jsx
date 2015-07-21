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
                    var lang = args.state.lang;

                    return (
                        <header className="top-menu-bar">
                            <div className="btn-h-group pull-left">
                                <div className="btn btn-default file-importer">
                                    <lable className="fa fa-plus">{lang.laser.import}</lable>
                                    <input type="file" multiple/>
                                </div>
                                <button className="btn btn-default fa fa-floppy-o">{lang.laser.save}</button>
                            </div>

                            <div className="btn-h-group zoom pull-right">
                                <button className="btn btn-default fa fa-plus"></button>
                                <button className="btn btn-default fa fa-search"></button>
                                <button className="btn btn-default fa fa-minus"></button>
                            </div>
                        </header>
                    );
                },
                _renderBeginingSection: function() {
                    var lang = args.state.lang,
                        cx = React.addons.classSet,
                        class_name = cx({
                            'file-importer': true,
                            'absolute-center': true,
                            'border-circle': true,
                            'hide': ('start' === this.state.step)
                        });

                    return (
                        <section id="file-importer" className={class_name}>
                            <img src="http://placehold.it/200x150"/>
                            <h2>{lang.laser.acceptable_files}</h2>
                            <p>{lang.laser.drop_files_to_import}</p>
                            <input type="file" multiple/>
                        </section>
                    );
                },
                _renderStageSection: function() {
                    var lang = args.state.lang,
                        cx = React.addons.classSet,
                        class_name = cx({
                            'operating-panel': true,
                            'hide': ('start' !== this.state.step)
                        });

                    return (
                        <section id="operation-table" className={class_name}>
                            <div className="laser-platform"/>
                            <div className="laser-object border-circle"/>
                            <SetupPanel lang={lang}/>
                            <ImagePanel lang={lang}/>
                        </section>
                    );
                },
                render : function() {
                    var lang = args.state.lang,
                        header = this._renderHeader(),
                        beginingSection = this._renderBeginingSection(),
                        stageSection = this._renderStageSection();

                    return (
                        <div className="studio-container laser-studio">

                            {header}

                            <div className="stage">
                                {stageSection}
                                {beginingSection}
                            </div>
                        </div>
                    );
                },
                getInitialState: function() {
                    return {
                        step: ''
                    };
                },
                componentDidMount: function() {
                    laserEvents(args, this);
                }

            });

        return view;
    };
});