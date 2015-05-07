define([
    'jquery',
    'react',
    'helpers/display',
    'app/actions/print',
    'jsx!widgets/Radio-Group'
], function($, React, display, printEvents, RadioGroupView) {
    'use strict';

    return function(args) {
        args = args || {};

        var view = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div className="studio-container print-studio">
                            <header>
                                <div id="uploader" className="btn file-importer">
                                    <lable className="fa fa-plus">{lang.print.import}</lable>
                                    <input type="file" multiple/>
                                </div>
                                <button className="btn fa fa-home">{lang.print.go_home}</button>
                                <button className="btn fa fa-floppy-o">{lang.print.save}</button>
                                <button className="btn fa fa-eye">{lang.print.normal_preview}</button>
                                <RadioGroupView className="btn" name="print-mode" options={lang.print.mode}/>
                            </header>
                            <div id="operating-panel" className="operating-panel"></div>
                            <div id="model-displayer" className="model-displayer"></div>
                        </div>
                    )
                },
                getInitialState: function() {
                    return args.state;
                },
                componentDidMount: function() {
                    printEvents(args);
                }

            });

        return view;
    };
});