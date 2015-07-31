define([
    'react',
], function(React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Widget = React.createClass({
                _renderProgress: function() {
                    var lang = this.state.lang;

                    return (
                        <p>
                            <span>{lang.scan.complete}: </span>
                            <span>{this.state.progressPercentage}%, </span>
                            <span>{lang.scan.remaining_time}: </span>
                            <span>{this.state.progressRemainingTime}</span>
                        </p>
                    );
                },
                _renderFinish: function() {
                    var lang = this.state.lang;

                    return (
                        <p>
                            <span>{lang.scan.complete}</span>
                        </p>
                    );
                },

                render : function() {
                    var lang = this.state.lang,
                        is_finished = this.state.is_finished,
                        style = {
                            width: this.state.progressPercentage + '%'
                        },
                        content = (
                            true === is_finished ?
                            this._renderFinish() :
                            this._renderProgress()
                        );

                    return (
                        <div className="scan-progress absolute-center">
                            <h4>{lang.scan.convert_to_3d_model}</h4>
                            <div className="progress">
                                <div className="progress-bar progress-bar-striped active" style={style}/>
                            </div>

                            {content}
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