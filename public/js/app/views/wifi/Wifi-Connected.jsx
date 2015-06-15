define([
    'jquery',
    'react',
], function($, React) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onNext: React.PropTypes.func
            };
        },
        _handleNext: function() {
            this.props.onNext();
        },
        render: function() {
            var lang = this.props.lang;

            return (
                <div className="wifi center">
                    <img className="wifi-symbol" src="/img/img-wifi-unlock.png"/>
                    <div className="wifi-form">
                        <h2>{lang.wifi.success.caption}</h2>
                        <p>{lang.wifi.success.line1}</p>
                        <div>
                            <a id="next" className="btn btn-large" onClick={this._handleNext}>{lang.wifi.success.next}</a>
                        </div>
                    </div>
                </div>
            );
        }

    });
});