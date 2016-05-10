define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'helpers/display',
    'plugins/classnames/index'
], function($, React, i18n, SelectView, Display, ClassNames) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            HomeView;

        HomeView = React.createClass({
            getInitialState: function() {
                return {
                    displayMenu: true,
                    displayFooter: true
                }
            },

            componentDidMount: function() {
                var childView;

                switch (args.child) {
                    case 'flux-cloud':
                        childView = 'Setting-Flux-Cloud';
                        this.setState({ displayFooter: false });
                        break;

                    case 'flux-cloud-setup':
                        childView = 'Setting-Flux-Cloud-Setup';
                        break;

                    case 'printer':
                        childView = 'Setting-Printer';
                        this.setState({ displayFooter: false });
                        break;

                    case 'general':
                        childView = 'Setting-General';
                        this.setState({ displayFooter: true });
                        break;

                    default:
                        childView = args.child;
                        this.setState({
                            displayMenu: false,
                            displayFooter: false
                        });
                }

                // show child view
                requirejs(['jsx!views/settings/' + childView, 'app/app-settings'], function(view, settings) {
                    var args = {
                        props: {
                            supported_langs: settings.i18n.supported_langs
                        }
                    };
                    Display(view, args, $('.tab-container')[0]);
                });
            },

            _handleDone: function() {
                location.hash = '#studio/print';

                if (true === window.FLUX.isNW) {
                    window.FLUX.close().always(function() {
                        window.location.reload();
                    });
                }
                else {
                    window.location.reload();
                }
            },

            render : function() {
                var lang = args.state.lang,
                    menu_item = 'nav-item',
                    generalClass = ClassNames(
                        menu_item,
                        {active: 'general' === args.child}),
                    fluxCloudClass = ClassNames(
                        menu_item,
                        {active: 'flux-cloud' === args.child || 'flux-cloud-setup' === args.child}),
                    printerClass = ClassNames(
                        menu_item,
                        {active: 'printer' === args.child}),
                    tabContainerClass = ClassNames(
                        'tab-container',
                        {'no-top-margin': !this.state.displayMenu}),
                    header,
                    footer;

                header =
                    <header>
                        <ul className="nav clearfix">
                            <li className={generalClass}>
                                <a href="#studio/settings/general">{lang.settings.tabs.general}</a>
                            </li>
                            {
                                /* turn off temporary, do not remove
                                <li className={fluxCloudClass}>
                                    <a href="#studio/settings/flux-cloud">{lang.settings.tabs.flux_cloud}</a>
                                </li>

                                <li className={printerClass}>
                                    <a href="#studio/settings/printer">{lang.settings.tabs.printer}</a>
                                </li>
                                */
                            }
                        </ul>
                    </header>

                footer =
                    <footer className="sticky-bottom">
                        <div className="actions">
                            <a className="btn btn-done" onClick={this._handleDone}>{lang.settings.done}</a>
                        </div>
                    </footer>

                return (
                    <div className="studio-container settings-studio">
                        <div className="settings">
                            {this.state.displayMenu ? header : ''}
                            <div className={tabContainerClass}></div>
                            {this.state.displayFooter ? footer : ''}
                        </div>
                    </div>
                );
            }

        });

        return HomeView;
    };
});
