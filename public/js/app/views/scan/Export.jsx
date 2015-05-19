define([
    'react',
    'jsx!widgets/Radio-Group'
], function(React, RadioGroupView) {
    'use strict';

    return function(args) {
        args = args || {};

        var Widget = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div className="scan-model-save-as absolute-center">
                            <h4>{lang.scan.save_as}</h4>
                            <div className="progress">
                                <RadioGroupView name="file-mode" options={lang.scan.save_mode}/>
                            </div>
                            <div>
                                <button id="btn-save-scan-model" className="btn span12">{lang.scan.do_save}</button>
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