define([
    'react',
    'helpers/local-storage',
    'helpers/api/config',
    'jsx!widgets/Modal'
], function(React, localStorage, config, Modal) {
    'use strict';

    return function(args) {

        args = args || {};

        return React.createClass({
            getInitialState: function() {
                return args.state;
            },

            _handleStartClick: function() {
                var settedPrinters = config().read('printers') || [];

                settedPrinters.push(localStorage.get('setting-printer'));

                config().write('printer-is-ready', true);
                config().write('printers', JSON.stringify(settedPrinters), {
                    onFinished: function(response) {
                        // remove current setting printer
                        localStorage.removeAt('setting-printer');
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
    };
});