define([
    'jquery',
    'react',
], function($, React) {
    'use strict';

    return React.createClass({
        render: function() {
            var lang    = this.props.lang

            return (
                <div className="configured-flux center">
                    <img className="wifi-symbol" src="/img/img-flux-ap-success.png" />
                    <div className="wifi-form">
                        <h2>{lang.wifi.flux_as_wifi_2.caption}</h2>
                        <p>{lang.wifi.flux_as_wifi_2.description}</p>
                        <div>
                            <a id="btn-next" className="btn btn-large" onClick={this._next}>
                                {lang.wifi.flux_as_wifi_2.next}
                            </a>
                        </div>
                        <div>
                            <a>{lang.wifi.flux_as_wifi_2.footer}</a>
                        </div>
                    </div>
                </div>
            );
        }

    });
});