define([
    'react',
    'jquery',
    'backbone',
    'helpers/display',
    'app/actions/global'
],
function(React, $, Backbone, display, globalEvents) {
    'use strict';

    var _display = function(view, args) {
        args = args || {};

        // WARNING: this function includes GLOBAL LIVE EVENTS.
        // DO NOT use non-uniqle selector here (e.g. class, tag name, attribute...etc.)
        display(view, args, $('.content')[0], globalEvents);
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

                _display(view, args);
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
                _display(view);
            });
        },

        appendSideBar: function() {
            require(['jsx!views/Sidebar'], function(view) {
                display(view, {}, $('.sidebar')[0]);
            });
        },

        studio: function(page, params) {
            var map = {
                    'print': this.print,
                    'settings': this.settings
                },
                func = this.print;

            if (true === map.hasOwnProperty(page)) {
                func = map[page];
            }

            func(params);

            this.appendSideBar();
        },

        print: function() {
            require(['jsx!pages/Print'], function(view) {
                _display(view);
            });
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

                _display(view, {child: child});

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