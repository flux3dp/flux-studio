define([
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'jsx!widgets/Modal'
], function(React, i18n, SelectView, Modal) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({
            // Private methods
            _getLanguageOptions: function() {
                var options = [];

                for (var lang_code in args.props.supported_langs) {
                    options.push({
                        value: lang_code,
                        label: args.props.supported_langs[lang_code],
                        selected: lang_code === i18n.getActiveLang()
                    });
                }

                return options;
            },

            // Lifecycle
            render: function() {
                var lang = this.state.lang,
                    options = this._getLanguageOptions(),
                    content = (
                        <div className="welcome initialization text-center">
                            <h1>{lang.welcome_headline}</h1>
                            <img className="brand-image" src="/img/wel-flux-logo.png"/>
                            <div>
                                <h2>{lang.welcome.header1}</h2>
                                <p>{lang.welcome.header2}</p>
                                <div>
                                    <SelectView id="select-lang" options={options}/>
                                </div>
                                <div>
                                    <a href="#initialize/wifi/connect-machine" className="btn btn-action btn-large">{lang.welcome.start}</a>
                                </div>
                            </div>
                        </div>
                    );

                return (
                    <Modal content={content}/>
                );
            },

            getInitialState: function() {
                return {
                    lang: args.state.lang
                };
            }
        });
    };
});