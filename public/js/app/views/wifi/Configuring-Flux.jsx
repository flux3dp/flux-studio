define([
    'jquery',
    'react',
], function($, React) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onNext:         React.PropTypes.func,
                onSwitchToWifi: React.PropTypes.func
            };
        },
        getInitialState: function() {
            return {
                configured: false
            };
        },
        componentWillReceiveProps: function(nextProps) {
            if(nextProps.configured) {
                this.setState({ configured: true });
            }
        },
        componentWillUpdate: function(nextProps, nextState) {
            return nextProps.configured != nextState.configured;
        },
        _handleNext: function() {
            this.props.onNext();
        },
        _handleSwitchToWifi: function() {
            this.props.onSwitchToWifi();
        },
        _renderAction: function(lang) {
            return this.state.configured ? (
                <a id="btn-next" className="btn btn-large" onClick={this._handleNext}>
                    {lang.wifi.flux_as_wifi_1.next}
                </a>
            ) : (
                <img className="loading" src="/img/ring.svg" />
            );
        },
        render: function() {
            var lang    = this.props.lang,
                action  = this._renderAction(lang);

            return (
                <div className="configuring-flux center">
                    <img className="wifi-symbol" src="/img/img-flux-ap.png" />
                    <div className="wifi-form">
                        <h2>{lang.wifi.flux_as_wifi_1.caption}</h2>
                        <p>{lang.wifi.flux_as_wifi_1.description}</p>
                        <div>
                            {action}
                        </div>
                        <div>
                            <a onClick={this._handleSwitchToWifi}>{lang.wifi.flux_as_wifi_1.footer}</a>
                        </div>
                    </div>
                </div>
            );
        }

    });
});