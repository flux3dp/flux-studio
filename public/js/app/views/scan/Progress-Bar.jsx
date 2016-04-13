define([
    'react',
], function(React) {
    'use strict';

    return React.createClass({
            ESTIMATED_STEP: 10,

            propTypes: {
                lang: React.PropTypes.object,
                percentage: React.PropTypes.number,
                remainingTime: React.PropTypes.number,
                currentSteps: React.PropTypes.number,
                onStop: React.PropTypes.func
            },

            getDefaultProps: function() {
                return {
                    lang: {},
                    percentage: 0,
                    remainingTime: 0,
                    currentSteps: 0,
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

                self.props.onStop();

                self.setState({
                    stop: true
                }, function() {
                    self.setState(self.getInitialState());
                });
            },

            _renderProgress: function() {
                var self = this,
                    lang = self.props.lang,
                    estimatedTime = (
                        self.ESTIMATED_STEP < self.props.currentSteps ?
                        self._formatSecondToTime(self.props.remainingTime) :
                        lang.scan.estimating
                    ),
                    textRemainingTime = (
                        self.ESTIMATED_STEP < self.props.currentSteps ?
                        lang.scan.remaining_time :
                        ''
                    ),
                    cx = React.addons.classSet,
                    stopButtonClasses = cx({
                        'btn': true,
                        'btn-hexagon': true,
                        'btn-stop-scan': true,
                        'btn-disabled': (0 === self.props.percentage),
                    });

                return (
                    <div className="progress-status">
                        <span className="progress-text">{self.props.percentage}%,</span>
                        <span className="progress-text">{estimatedTime}</span>
                        <span className="progress-text">{textRemainingTime}</span>
                        <button className={stopButtonClasses} data-ga-event="stop-scan" onClick={this._onStop}>{lang.scan.stop_scan}</button>
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