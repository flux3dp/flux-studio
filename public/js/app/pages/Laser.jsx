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
                    var lang = this.state.lang;

                    return (
                        <div className="studio-container laser-studio">
                            <header>
                                <div className="btn file-importer">
                                    <lable className="fa fa-plus">{lang.laser.import}</lable>
                                    <input type="file" multiple/>
                                </div>
                                <button className="btn fa fa-floppy-o">{lang.laser.save}</button>
                            </header>
                            <div id="model-displayer" className="model-displayer">
                                <section id="file-importer" className="file-importer">
                                    <h2>{lang.laser.acceptable_files}</h2>
                                    <p>{lang.laser.drop_files_to_import}</p>
                                    <input type="file" multiple/>
                                </section>
                                <section id="operation-table" className="operating-panel hide">
                                    <div className="panel print-params">
                                        <div>
                                            <h2>
                                                <span className="fa fa-clock-o"></span>
                                                1 hr 30min
                                            </h2>
                                            <div className="row-fluid clearfix">
                                                <div className="col span3">
                                                    <span className="param-icon fa fa-print"></span>
                                                </div>
                                                <div className="param col span9">
                                                    <h4>{lang.laser.print_params.method.text}</h4>
                                                    <p>
                                                        {lang.laser.print_params.method.options}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="row-fluid clearfix">
                                                <div className="col span3">
                                                    <span className="param-icon fa fa-bullseye"></span>
                                                </div>
                                                <div className="param col span9">
                                                    <h4>{lang.laser.print_params.meterial.text}</h4>
                                                    <p>
                                                        <SelectView className="span12" name="meterial" options={lang.laser.print_params.meterial.options}/>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="row-fluid clearfix">
                                                <div className="col span3">
                                                    <span className="param-icon fa fa-check"></span>
                                                </div>
                                                <div className="param col span9">
                                                    <h4>{lang.laser.print_params.object_height.text}</h4>
                                                    <p>
                                                        <input type="number" min="0" name="object-height" options={lang.laser.print_params.object_height.options} defaultValue=""/>
                                                        <span>{lang.laser.print_params.object_height.unit}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <button className="btn span12">{lang.laser.change_setup}</button>
                                            </div>
                                        </div>
                                        <div>
                                            <button id="btn-start" className="btn span12">{lang.laser.start_laser}</button>
                                        </div>
                                    </div>
                                    <div className="laser-object"/>
                                    <div className="panel object-params">
                                        <div className="param">
                                            <h4>{lang.laser.object_params.position.text}</h4>
                                            <p>
                                                <input type="number" min="0" name="object-pos-x" className="span4" defaultValue=""/>
                                                <span>X</span>
                                                <input type="number" min="0" name="object-pos-y" className="span4" defaultValue=""/>
                                                <span>Y</span>
                                            </p>
                                        </div>
                                        <div className="param">
                                            <h4>{lang.laser.object_params.size.text}</h4>
                                            <p>
                                                <input type="number" min="0" name="object-size-w" className="span4" defaultValue=""/>
                                                <span>{lang.laser.object_params.size.unit.width}</span>
                                                <input type="number" min="0" name="object-size-h" className="span4" defaultValue=""/>
                                                <span>{lang.laser.object_params.size.unit.height}</span>
                                            </p>
                                        </div>
                                        <div className="param">
                                            <h4>{lang.laser.object_params.rotate.text}</h4>
                                            <p>
                                                <input type="number" min="-180" name="object-angle" className="span4" defaultValue=""/>
                                            </p>
                                        </div>
                                        <div className="param">
                                            <h4>{lang.laser.object_params.unit.text}</h4>
                                            <p>
                                                <RadioGroupView name="object-unit" options={lang.laser.object_params.unit.options}/>
                                            </p>
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