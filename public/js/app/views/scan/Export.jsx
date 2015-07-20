define([
    'react',
    'jsx!widgets/Radio-Group'
], function(React, RadioGroupView) {
    'use strict';

    return function(args) {
        args = args || {};
        args.onExport = args.onExport || function() {};

        var Widget = React.createClass({
                _onExport: function(e) {
                    args.onExport(e);
                },
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div className="scan-model-save-as absolute-center">
                            <h4 className="caption">{lang.scan.save_as}</h4>
                            <RadioGroupView className="file-formats clearfix" name="file-format" options={lang.scan.save_mode}/>
                            <div>
                                <button className="btn btn-default" onClick={this._onExport}>{lang.scan.do_save}</button>
                            </div>
                        </div>
                    );
                },
                getInitialState: function() {
                    return args.state;
                }

            });

        return Widget;
    };
});