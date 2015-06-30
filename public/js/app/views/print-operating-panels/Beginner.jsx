define([
    'jquery',
    'react',
    'jsx!widgets/Select',
    'jsx!widgets/Radio-Group'
], function($, React, SelectView, RadioGroupView) {
    'use strict';

    return function(args) {
        args = args || {};
        var options = [],
            View = React.createClass({
                render : function() {
                    var lang = this.state.lang;
                    console.log('beginner');
                    return (
                        <div className="panel beginner-panel">
                            <div className="params horizontal-form">
                                <h2>
                                    <span className="fa fa-clock-o"></span>
                                    1 hr 30min
                                </h2>
                                <div className="row-fluid clearfix">
                                    <div className="col span3">
                                        <span className="param-icon fa fa-print"></span>
                                    </div>
                                    <div className="param col span9">
                                        <h4>{lang.print.params.beginner.print_speed.text}</h4>
                                        <p>
                                            <SelectView className="span12" options={lang.print.params.beginner.print_speed.options}/>
                                        </p>
                                    </div>
                                </div>
                                <div className="row-fluid clearfix">
                                    <div className="col span3">
                                        <span className="param-icon fa fa-bullseye"></span>
                                    </div>
                                    <div className="param col span9">
                                        <h4>{lang.print.params.beginner.meterial.text}</h4>
                                        <p>
                                            <SelectView className="span12" options={lang.print.params.beginner.meterial.options}/>
                                        </p>
                                    </div>
                                </div>
                                <div className="row-fluid clearfix">
                                    <div className="col span3">
                                        <span className="param-icon fa fa-check"></span>
                                    </div>
                                    <div className="param col span9">
                                        <h4>{lang.print.params.beginner.support.text}</h4>
                                        <p>
                                            <RadioGroupView name="support" options={lang.print.params.beginner.support.options}/>
                                        </p>
                                    </div>
                                </div>
                                <div className="row-fluid clearfix">
                                    <div className="col span3">
                                        <span className="param-icon fa fa-check"></span>
                                    </div>
                                    <div className="param col span9">
                                        <h4>{lang.print.params.beginner.platform.text}</h4>
                                        <p>
                                            <RadioGroupView name="platform" options={lang.print.params.beginner.platform.options}/>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <button className="btn btn-default span12">{lang.print.advanced}</button>
                                </div>
                            </div>
                            <div>
                                <button className="btn btn-default span12">{lang.print.start_print}</button>
                            </div>
                        </div>
                    )
                },

                getInitialState: function() {
                    return args.state;
                }

            });

        return View;
    };
});