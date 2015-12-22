define([
    'react',
], function(React) {
    'use strict';

    return React.createClass({

            propTypes: {
                lang: React.PropTypes.object,
                percentage: React.PropTypes.number,
                remainingTime: React.PropTypes.number,
                elapsedTime: React.PropTypes.number,
                onStop: React.PropTypes.func
            },

            getDefaultProps: function() {
                return {
                    lang: {},
                    percentage: 0,
                    remainingTime: 0,
                    elapsedTime: 0,
                    onStop: function() {}
                };
            },

            getInitialState: function() {
                return {
                    stop: false
                };
            },

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

            _onStop: function() {
                var self = this;

                self.setState({
                    stop: true
                }, function() {
                    self.props.onStop();
                });
            },

            _renderProgress: function() {
                var self = this,
                    lang = self.props.lang;

                return (
                    <div className="progress-status">
                        <span className="progress-text">{self.props.percentage}%,</span>
                        <span className="progress-text">{self._formatSecondToTime(self.props.remainingTime)}</span>
                        <span className="progress-text">{lang.scan.remaining_time}</span>
                        <button className="btn btn-hexagon btn-stop-scan" data-ga-event="stop-scan" onClick={this._onStop}>{lang.scan.stop_scan}</button>
                    </div>
                );
            },

            _renderFinish: function() {
                var lang = this.props.lang;

                return (
                    <p>
                        <span className="amination-breath">{lang.scan.processing}</span>
                    </p>
                );
            },

            render : function() {
                var lang = this.props.lang,
                    isFinish = (100 <= this.props.percentage),
                    cx = React.addons.classSet,
                    className = {
                        'scan-progress': true,
                        'hide': true === this.state.stop
                    },
                    content = (
                        true === isFinish ?
                        this._renderFinish() :
                        this._renderProgress()
                    );

                return (
                    <div className={cx(className)}>
                        {content}
                    </div>
                );
            }

        });
});