define([
    'jquery',
    'react',
    'app/actions/laser',
    'jsx!widgets/Select',
    'jsx!widgets/Radio-Group'
], function($, React, laserEvents, SelectView, RadioGroupView) {
    'use strict';

    return function(args) {
        args = args || {};

        var view = React.createClass({
                render : function() {
                    var lang = args.state.lang;

                    return (
                        <div className="studio-container laser-studio">
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
                            <div id="model-displayer" className="model-displayer">
                                <section id="file-importer" className="file-importer absolute-center border-circle">
                                    <img src="http://placehold.it/200x150"/>
                                    <h2>{lang.laser.acceptable_files}</h2>
                                    <p>{lang.laser.drop_files_to_import}</p>
                                    <input type="file" multiple/>
                                </section>
                                <section id="operation-table" className="operating-panel hide">
                                    <div className="panel objects-params">
                                        <div className="print-params">
                                            <h2 className="estimated-time text-center"> 1 hr 30min </h2>
                                            <div className="row-fluid clearfix">
                                                <div className="param-icon col span3 fa fa-print"></div>
                                                <div className="param col span9">
                                                    <h4 className="caption">{lang.laser.print_params.method.text}</h4>
                                                    <p>
                                                        {lang.laser.print_params.method.options}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="row-fluid clearfix">
                                                <div className="param-icon col span3 fa fa-bullseye"></div>
                                                <div className="param col span9">
                                                    <h4 className="caption">{lang.laser.print_params.material.text}</h4>
                                                    <p>
                                                        <SelectView className="span12" name="material" options={lang.laser.print_params.material.options}/>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="row-fluid clearfix">
                                                <div className="param-icon col span3 fa fa-check"></div>
                                                <div className="param col span9">
                                                    <h4 className="caption">{lang.laser.print_params.object_height.text}</h4>
                                                    <p>
                                                        0.3
                                                        <span>{lang.laser.print_params.object_height.unit}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <button className="btn btn-default btn-full-width">{lang.laser.advenced}</button>
                                            </div>
                                        </div>
                                        <button id="btn-start" className="btn btn-action btn-full-width btn-start">
                                            <img src="/img/icon-laser-s.png"/>
                                            {lang.laser.start_laser}
                                        </button>
                                    </div>
                                    <div className="laser-platform"/>
                                    <div className="laser-object border-circle"/>
                                    <div className="panel object-position">
                                        <div className="controls">
                                            <p className="control">
                                                <label className="caption span4">{lang.laser.object_params.position.text}</label>
                                                <input type="number" min="0" name="object-pos-x" className="span4" defaultValue=""/>
                                                <input type="number" min="0" name="object-pos-y" className="span4" defaultValue=""/>
                                            </p>
                                            <p className="control">
                                                <span className="offset-left-4 span4 text-center unit">X</span>
                                                <span className="span4 text-center unit">Y</span>
                                            </p>
                                        </div>
                                        <div className="controls">
                                            <p className="control">
                                                <label className="caption span4">{lang.laser.object_params.size.text}</label>
                                                <input type="number" min="0" name="object-size-w" className="span4" defaultValue=""/>
                                                <input type="number" min="0" name="object-size-h" className="span4" defaultValue=""/>
                                            </p>
                                            <p className="control">
                                                <span className="offset-left-4 span4 text-center unit">{lang.laser.object_params.size.unit.width}</span>
                                                <span className="span4 text-center unit">{lang.laser.object_params.size.unit.height}</span>
                                            </p>
                                        </div>
                                        <div className="controls">
                                            <p className="control">
                                                <label className="caption span4">{lang.laser.object_params.rotate.text}</label>
                                                <input type="number" min="-180" name="object-angle" className="span4" defaultValue=""/>
                                            </p>
                                        </div>
                                        <div className="controls">
                                            <div className="control">
                                                <label className="caption span4">{lang.laser.object_params.unit.text}</label>
                                                <RadioGroupView className="span8 radio-group" name="object-unit" options={lang.laser.object_params.unit.options}/>
                                            </div>
                                        </div>
                                        <div className="controls">
                                            <div className="control">
                                                <label className="caption span4">{lang.laser.object_params.threshold.text}</label>
                                                <input type="number" min="0" max="255" className="span4" name="threshold" defaultValue={lang.laser.object_params.threshold.default}/>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )
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