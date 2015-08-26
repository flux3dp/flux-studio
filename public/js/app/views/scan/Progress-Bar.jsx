define([
    'react',
], function(React) {
    'use strict';

    return React.createClass({

            _paddingZero: function(str, len) {
                var zero = new Array(len + 1),
                    afterPadding = zero.join(0) + str;

                return afterPadding.substr(-1 * len);
            },

            _formatSecondToTime: function(seconds) {
                var minutes = parseInt(seconds / 60, 10),
                    seconds = seconds % 60;

                return this._paddingZero(minutes, 2) + 'm' + this._paddingZero(seconds, 2) + 's';
            },

            _renderProgress: function() {
                var self = this,
                    lang = self.props.lang;

                // TODO: temporary hide remaining time
                return (
                    <p className="progress-status">
                        <span>{lang.scan.complete}:</span>
                        <span>{self.props.percentage}%</span>
                        <span className="hide">{lang.scan.remaining_time}:</span>
                        <span className="hide">{self._formatSecondToTime(self.props.remainingTime)}</span>
                        <span>{lang.scan.elapsed_time}:</span>
                        <span>{self._formatSecondToTime(self.props.elapsedTime)}</span>
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
                    is_finished = (100 <= this.props.percentage),
                    style = {
                        width: Math.min(this.props.percentage, 100) + '%'
                    },
                    content = (
                        true === is_finished ?
                        this._renderFinish() :
                        this._renderProgress()
                    );

                return (
                    <div className="scan-progress">
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
                    percentage: React.PropTypes.number,
                    remainingTime: React.PropTypes.number,
                    elapsedTime: React.PropTypes.number
                };
            }

        });
});