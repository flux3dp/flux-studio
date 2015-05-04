define([
    'react',
    'jquery',
    'backbone',
    'helpers/local-storage',
    'helpers/i18n',
    'helpers/observe',
    'app/actions/global',
],
function(React, $, Backbone, localStorage, i18n, Observe, globalEvents) {
    'use strict';
    var display = function(view, args, el) {
        args = args || {};
        args.props = args.props || {};
        args.state = args.state || {};
        el = el || $('.content')[0];

        args.state.lang = i18n.get();

        var currentView;

        // watching state and auto update
        new Observe(args.state, function(changes) {
            currentView.setState(args.state);
        });

        view = React.createFactory(view(args));
        view = view();

        view.props = args.props;

        currentView = React.render(view, el);

        // WARNING: this function includes GLOBAL LIVE EVENTS.
        // DO NOT use non-uniqle selector here (e.g. class, tag name, attribute...etc.)
        globalEvents(args);
    };

    return Backbone.Router.extend({
        routes: {},

        initialize: function() {
            var router = this,
                routes = [
                    // catch no match route, 404
                    [/^.*$/, 'e404', this.e404],
                    // initialize Flux Printer
                    [
                        /^initialize\/wifi\/?(ask|select|spot|set-printer|set-password|success|failure)?/,
                        'initial',
                        this.initial
                    ],
                    // go to studio
                    [
                        /^studio\/?(print|laser|scan|usb|settings)\/?(.*)?/,
                        'studio',
                        this.studio
                    ],
                    // flux home
                    [/^$/, 'home', this.home],
                ];

            routes.forEach(function(route) {
                router.route.apply(router, route);
            });
        },

        home: function(name) {
            require(['jsx!pages/Home', 'app/app-settings'], function(view, settings) {
                var args = {
                    props: {
                        supported_langs: settings.i18n.supported_langs
                    }
                };

                display(view, args);
            });
        },

        initial: function(step) {
            var map = {
                    'ask': 'Wifi-Home',
                    'select': 'Wifi-Select',
                    'spot': 'Wifi-Spot',
                    'set-printer': 'Wifi-Set-Printer',
                    'set-password': 'Wifi-Set-Password',
                    'success': 'Wifi-Success',
                    'failure': 'Wifi-Failure'
                },
                view_name = 'Wifi-Home';

            if (true === map.hasOwnProperty(step)) {
                view_name = map[step];
            }

            require(['jsx!pages/' + view_name], function(view) {
                display(view);
            });
        },

        appendSideBar: function() {
            require(['jsx!views/Sidebar'], function(view) {
                display(view, {}, $('.sidebar')[0]);
            });
        },

        studio: function(page, params) {
            var map = {
                    'settings': this.settings
                },
                func = this.settings;

            if (true === map.hasOwnProperty(page)) {
                func = map[page];
            }

            func(params);

            this.appendSideBar();
        },

        settings: function(child) {

            require(['jsx!pages/Settings', 'app/app-settings'], function(view, settings) {
                child = (child || '').toLowerCase();

                var childView;

                switch (child) {
                case 'flux-cloud':
                    childView = 'Setting-Flux-Cloud';
                    break;

                case 'printer':
                    childView = 'Setting-Printer';
                    break;

                default:
                    childView = 'Setting-General';
                    break;
                }

                display(view, {}, $('.content')[0]);

                // show child view
                require(['jsx!views/' + childView], function(view) {
                    var args = {
                        props: {
                            supported_langs: settings.i18n.supported_langs
                        },
                        child: child
                    };
                    display(view, args, $('.tab-container')[0]);
                });
            });
        },

        e404: function() {
            // TODO: handle 404
            alert('404');
        }

    });

});