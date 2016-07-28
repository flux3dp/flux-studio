define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'jsx!views/settings/Setting-General',
    'helpers/display',
    'plugins/classnames/index',
    'app/app-settings',
    'helpers/force-reload'
], function(
    $,
    React,
    i18n,
    SelectView,
    SettingGeneral,
    Display,
    ClassNames,
    settings,
    forceReload
) {
    'use strict';

    return function(args) {
        args = args || {};

        var HomeView;

        HomeView = React.createClass({
            getInitialState: function() {
                return {
                    lang: args.state.lang
                };
            },

            _handleDone: function() {
                location.hash = 'studio/print';
                forceReload();
            },

            _onLangChange: function() {
                this.setState({
                    lang: i18n.get()
                });
            },

            render: function() {
                var lang = this.state.lang,
                    footer;

                footer =
                    <footer className="sticky-bottom">
                        <div className="actions">
                            <a className="btn btn-done" onClick={this._handleDone}>{lang.settings.done}</a>
                        </div>
                    </footer>;

                return (
                    <div className="studio-container settings-studio">
                        <div className="settings">
                            <div className="tab-container">
                                <SettingGeneral
                                    lang={this.state.lang}
                                    supported_langs={settings.i18n.supported_langs}
                                    onLangChange={this._onLangChange}
                                />
                            </div>
                            {footer}
                        </div>
                    </div>
                );
            }

        });

        return HomeView;
    };
});
