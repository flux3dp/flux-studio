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
                            <p>
                                <span>{lang.scan.complete}: </span>
                                <span>{this.state.progressPercentage}%, </span>
                                <span>{lang.scan.remaining_time}: </span>
                                <span>{this.state.progressRemainingTime}</span>
                            </p>
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