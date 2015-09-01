define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'jsx!widgets/Modal',
    'helpers/api/config'
], function($, React, i18n, SelectView, Modal, config) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            HomeView;

        HomeView = React.createClass({
            _onSkipSettingUp: function(e) {
                config().write('printer-is-ready', true, {
                    onFinished: function() {
                        location.hash = '#studio/print';
                        console.log(location.hash);
                    }
                });
            },

            render : function() {
                var content = (
                        <div className="welcome initialization text-center">
                            <h1>{this.state.lang.welcome_headline}</h1>
                            <img className="brand-image" src="/img/wel-flux-logo.png"/>
                            <div>
                                <h2>{this.state.lang.welcome.header1}</h2>
                                <p>{this.state.lang.welcome.header2}</p>
                                <div>
                                    <SelectView id="select-lang" options={options}/>
                                </div>
                                <div>
                                    <a href="#initialize/wifi/ask" className="btn btn-action btn-large">{this.state.lang.welcome.start}</a>
                                </div>
                                <div>
                                    <button className="btn btn-link" onClick={this._onSkipSettingUp}>{this.state.lang.welcome.skip}</button>
                                </div>
                            </div>
                        </div>
                    );

                return (
                    <Modal content={content}/>
                );
            },

            getInitialState: function() {
                return args.state;
            }
        });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code],
                selected: lang_code === i18n.getActiveLang()
            });
        }

        return HomeView;
    };
});