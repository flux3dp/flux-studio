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
                    var lang = args.state.lang;

                    return (
                        <section id="file-importer" className="file-importer absolute-center border-circle">
                            <img src="http://placehold.it/200x150"/>
                            <h2>{lang.laser.acceptable_files}</h2>
                            <p>{lang.laser.drop_files_to_import}</p>
                            <input type="file" multiple/>
                        </section>
                    );
                },
                _renderStageSection: function() {
                    var lang = args.state.lang;

                    return (
                        <section id="operation-table" className="operating-panel">
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
                        activeSection;

                    activeSection = (
                        'start' === args.step ?
                        this._renderStageSection() :
                        this._renderBeginingSection()
                    );

                    return (
                        <div className="studio-container laser-studio">

                            {header}

                            <div className="stage">
                                {activeSection}
                                <div id="model-displayer" className="model-displayer"/>
                            </div>
                        </div>
                    );
                },
                getInitialState: function() {
                    return args.state;
                },
                componentDidMount: function() {
                    laserEvents(args);
                }

            });

        return view;
    };
});