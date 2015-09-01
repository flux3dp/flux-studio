define([
    'jquery',
    'react',
    'helpers/api/config',
    'jsx!widgets/Modal'
], function($, React, config, Modal) {
    'use strict';

    return function(args) {

        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },

            _handleStartClick: function() {
                config().write('printer-is-ready', true, {
                    onFinished: function() {
                        location.hash = '#studio/print';
                    }
                });
            },
            render : function() {
                var lang = this.state.lang,
                    content = (
                    <div className="wifi initialization text-center">
                        <h1>{lang.welcome_headline}</h1>
                        <img className="wifi-symbol" src="/img/img-done.png" />
                        <div className="wifi-form">
                            <h2>{lang.wifi.setup_complete.caption}</h2>
                            <p>{lang.wifi.setup_complete.description}</p>
                            <div>
                                <button className="btn btn-action btn-large" onClick={this._handleStartClick}>{lang.wifi.setup_complete.start}</button>
                            </div>
                        </div>
                    </div>
                );

                return (
                    <Modal content={content}/>
                );
            }
        });

        return Page;
    };
});