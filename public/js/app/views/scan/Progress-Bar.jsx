define([
    'react',
], function(React) {
    'use strict';

    return React.createClass({
            _renderProgress: function() {
                var lang = this.props.lang;

                return (
                    <p>
                        <span>{lang.scan.complete}: </span>
                        <span>{this.props.progressPercentage}%, </span>
                        <span>{lang.scan.remaining_time}: </span>
                        <span>{this.props.progressRemainingTime}</span>
                    </p>
                );
            },
            _renderFinish: function() {
                var lang = this.props.lang;

                return (
                    <p>
                        <span>{lang.scan.complete}</span>
                    </p>
                );
            },

            render : function() {
                var lang = this.props.lang,
                    is_finished = (100 <= this.props.progressPercentage),
                    style = {
                        width: Math.min(this.props.progressPercentage, 100) + '%'
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

            getDefaultProps: function() {
                return {
                    lang: React.PropTypes.object,
                    progressPercentage: React.PropTypes.number,
                    progressRemainingTime: React.PropTypes.string,
                };
            }

        });
});