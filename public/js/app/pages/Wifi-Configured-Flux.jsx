define([
    'react',
    'jsx!widgets/Modal'
], function(React, Modal) {
    'use strict';

    return function(args) {

        args = args || {};

        return React.createClass({

            getInitialState: function() {
                return args.state;
            },

            render : function() {
                var lang = this.state.lang,
                    content = (
                        <div className="wifi initialization absolute-center text-center">
                            <h1>{lang.welcome_headline}</h1>
                            <img className="wifi-symbol" src="/img/img-flux-ap-success.png" />
                            <div className="wifi-form">
                                <h2>{lang.wifi.configured_flux.caption}</h2>
                                <p>{lang.wifi.configured_flux.description}</p>
                                <div>
                                    <a className="btn btn-action btn-large" href="#initialize/wifi/setup-complete" autoFocus={true}>
                                        {lang.wifi.configured_flux.next}
                                    </a>
                                </div>
                                <div>
                                    <a href="#initialize/wifi/select">{lang.wifi.configured_flux.footer}</a>
                                </div>
                            </div>
                        </div>
                    );

                return (
                    <Modal content={content}/>
                );
            }
        });
    };
});