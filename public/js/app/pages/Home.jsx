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
                    wrapperClassName = {
                        'initialization': true
                    },
                    content = (
                        <div className="home text-center">
                            <img className="brand-image" src="/img/menu/main_logo.svg"/>
                            <div>
                                <h1 className="headline">{lang.initialize.select_language}</h1>
                                <div className="language">
                                    <SelectView id="select-lang" options={options}/>
                                </div>
                                <div>
                                    <a href="#initialize/wifi/connect-machine" className="btn btn-action btn-large">{lang.initialize.next}</a>
                                </div>
                            </div>
                        </div>
                    );

                return (
                    <Modal className={wrapperClassName} content={content}/>
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