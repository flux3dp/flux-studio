define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!views/settings/Setting-General',
    'jsx!views/settings/Setting-Device',
    'plugins/classnames/index',
    'app/app-settings',
    'helpers/force-reload',
    'helpers/api/config',
], function(
    $,
    React,
    i18n,
    GeneralSetting,
    DeviceSetting,
    ClassNames,
    settings,
    forceReload,
    config
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
                location.hash = 'studio/' + (config().read('default-app')||'print');
                location.reload();
            },

            _onLangChange: function() {
                this.setState({
                    lang: i18n.get()
                });
            },

            _renderContent: function() {
                var content = {},
                    view = args.child;

                content.general = () => {
                    return (
                        <GeneralSetting
                            lang={this.state.lang}
                            supported_langs={settings.i18n.supported_langs}
                            onLangChange={this._onLangChange} />
                    );
                };

                content.device = () => (<DeviceSetting lang={this.state.lang} />);

                if(typeof content[view] === 'undefined') { view = 'general'; }
                return content[view]();
            },

            render: function() {
                var lang = this.state.lang,
                    menu_item = 'nav-item',
                    generalClass = ClassNames( menu_item, {active: args.child === 'general'}),
                    deviceClass = ClassNames( menu_item, {active: args.child === 'device'}),
                    // printerClass = ClassNames( menu_item, {active: 'printer' === args.child}),
                    // tabContainerClass = ClassNames( 'tab-container', {'no-top-margin': !this.state.displayMenu}),
                    tabs,
                    footer;

                tabs = (
                    <header>
                        <ul className="nav clearfix">
                            <li className={generalClass}>
                                <a href="#studio/settings/general">{lang.settings.tabs.general}</a>
                            </li>
                            <li className={deviceClass}>
                                <a href="#studio/settings/device">{lang.settings.tabs.device}</a>
                            </li>
                        </ul>
                    </header>
                );

                footer = (
                    <footer className="sticky-bottom">
                        <div className="actions">
                            <a className="btn btn-done" onClick={this._handleDone}>{lang.settings.done}</a>
                        </div>
                    </footer>
                );

                return (
                    <div className="studio-container settings-studio">
                        <div className="settings">
                            <div className='title'>偏好设置</div>
                            <br/>
                            <div className="tab-container">
                                {this._renderContent()}
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
