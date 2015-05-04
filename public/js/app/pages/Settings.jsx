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
        console.log(args);

        var options = [],
            HomeView = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div className="settings">
                            <header>
                                <h1>{lang.settings.caption}</h1>
                                <ul className="menu horizontal-menu tabs clearfix">
                                    <li className="menu-item active">
                                        <a href="#studio/settings/general">{lang.settings.tabs.general}</a>
                                    </li>
                                    <li className="menu-item">
                                        <a href="#studio/settings/flux-cloud">{lang.settings.tabs.flux_cloud}</a>
                                    </li>
                                    <li className="menu-item">
                                        <a href="#studio/settings/printer">{lang.settings.tabs.printer}</a>
                                    </li>
                                </ul>
                            </header>
                            <div className="tab-container"></div>
                            <footer className="sticky-bottom">
                                <a className="btn" href="#studio/print">{lang.settings.close}</a>
                            </footer>
                        </div>
                    )
                },

                getInitialState: function() {
                    return args.state;
                }

            });

        return HomeView;
    };
});