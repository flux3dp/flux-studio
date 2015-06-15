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
                        <h2>{lang.wifi.configured_flux.caption}</h2>
                        <p>{lang.wifi.configured_flux.description}</p>
                        <div>
                            <a id="btn-next" className="btn btn-large" onClick={this._next}>
                                {lang.wifi.configured_flux.next}
                            </a>
                        </div>
                        <div>
                            <a>{lang.wifi.configured_flux.footer}</a>
                        </div>
                    </div>
                </div>
            );
        }

    });
});