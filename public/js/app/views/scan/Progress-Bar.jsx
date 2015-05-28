define([
    'react',
], function(React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Widget = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div className="scan-progress absolute-center">
                            <h4>{lang.scan.convert_to_3d_model}</h4>
                            <div className="progress">
                                <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"/>
                            </div>
                            <p>{lang.scan.complete}<span>{this.state.progressPercentage}</span>%</p>
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