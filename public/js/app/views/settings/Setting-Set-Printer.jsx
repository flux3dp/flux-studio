define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!views/settings/Setting-Menuless-Top-Nav',
    'jsx!views/wifi/Set-Printer'
], function($, React, i18n, TopNav, SetPrinter) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                componentDidMount: function() {
                    $('#btn-set-printer').addClass('btn-confirm');
                },
                _handleSetPrinter: function(name, password) {
                    console.log(name, password);
                    location.href = '#studio/settings/setting-configuring-flux';
                },
                render : function() {
                    var lang = args.state.lang

                    return (
                        <div className="set-printer wifi center">
                            <TopNav lang={lang} hideBack={true}/>
                            <SetPrinter lang={lang} onSetPrinter={this._handleSetPrinter} />
                        </div>
                    )
                }

            });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code],
                selected: lang_code === i18n.getActiveLang()
            });
        }

        return View;
    };
});