define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'css!cssHome/pages/settings'
], function($, React, i18n, SelectView) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            HomeView;

        HomeView = React.createClass({
            getInitialState: function() {
                return args.state;
            }
            render : function() {
                var lang = this.state.lang,
                    menu_item = 'menu-item',
                    tab_classes = {
                        general : menu_item + ('general' === args.child ? ' active' : ''),
                        flux_cloud : menu_item + ('flux-cloud' === args.child ? ' active' : ''),
                        printer : menu_item + ('printer' === args.child ? ' active' : '')
                    };

                return (
                    <div className="settings">
                        <header>
                            <h1>{lang.settings.caption}</h1>
                            <ul className="menu horizontal-menu tabs clearfix">
                                <li className={tab_classes.general}>
                                    <a href="#studio/settings/general">{lang.settings.tabs.general}</a>
                                </li>
                                <li className={tab_classes.flux_cloud}>
                                    <a href="#studio/settings/flux-cloud">{lang.settings.tabs.flux_cloud}</a>
                                </li>
                                <li className={tab_classes.printer}>
                                    <a href="#studio/settings/printer">{lang.settings.tabs.printer}</a>
                                </li>
                            </ul>
                        </header>
                        <div className="tab-container"></div>
                        <footer className="sticky-bottom">
                            <a className="btn" href="#studio/print">{lang.settings.close}</a>
                        </footer>
                    </div>
                );
            }
        });

        return HomeView;
    };
});