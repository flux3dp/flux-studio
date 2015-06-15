define([
    'react',
], function(React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Widget = React.createClass({
                render : function() {
                    var lang = this.state.lang,
                        style = {
                            width: this.state.progressPercentage + '%'
                        };

                    return (
                        <div className="scan-progress absolute-center">
                            <h4>{lang.scan.convert_to_3d_model}</h4>
                            <div className="progress">
                                <div className="progress-bar progress-bar-striped active" style={style}/>
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