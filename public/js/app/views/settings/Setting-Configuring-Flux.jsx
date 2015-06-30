define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!views/settings/Setting-Menuless-Top-Nav',
    'jsx!views/wifi/Configuring-Flux'
], function($, React, i18n, TopNav, ConfiguringFlux) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                getInitialState: function() {
                    return {
                        configured: false
                    };
                },
                componentDidMount: function() {
                    $('#next').addClass('btn-confirm');
                    setTimeout(() => { this._handleConfigured() }, 2000);
                },
                _handleNext: function() {
                    location.href = '#studio/settings/setting-configured-flux';
                },
                _handleSwtichToWifi: function() {
                    // todo
                },
                _handleConfigured: function() {
                    this.setState({ configured: true }, function() {
                        $('#btn-next').addClass('btn-confirm');
                    });
                },
                render : function() {
                    var lang = args.state.lang;

                    return (
                        <div className="wifi-connected wifi center">
                            <TopNav lang={lang} hideBack={true}/>
                            <ConfiguringFlux
                                lang={lang}
                                configured={this.state.configured}
                                onNext={this._handleNext}
                                onSwitchToWifi={this._handleSwtichToWifi} />
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