define([
    'react',
    'jquery',
    'backbone',
    'helpers/display',
    'app/actions/global'
],
function(React, $, Backbone, display, globalEvents) {
    'use strict';

    var _display = function(view, args, el) {
        args = args || {};
        el = el || $('.content')[0];

        // WARNING: this function includes GLOBAL LIVE EVENTS.
        // DO NOT use non-uniqle selector here (e.g. class, tag name, attribute...etc.)
        display(view, args, el, globalEvents);
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
                        /^initialize\/wifi\/?(ask|select|spot|set-printer|set-password|flux-as-wifi-1|flux-as-wifi-2|setup-complete|success|failure)?/,
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

                _display(view, args, $('.popup-window')[0]);
            });
        },

        initial: function(step) {
            var map = {
                    'ask': 'Wifi-Home',
                    'select': 'Wifi-Select',
                    'spot': 'Wifi-Spot',
                    'set-printer': 'Wifi-Set-Printer',
                    'set-password': 'Wifi-Set-Password',
                    'setup-complete': 'Wifi-Setup-Complete',
                    'flux-as-wifi-1': 'Wifi-Flux-As-Wifi-1',
                    'flux-as-wifi-2': 'Wifi-Flux-As-Wifi-2',
                    'success': 'Wifi-Success',
                    'failure': 'Wifi-Failure'
                },
                view_name = 'Wifi-Home';

            if (true === map.hasOwnProperty(step)) {
                view_name = map[step];
            }

            require(['jsx!pages/' + view_name], function(view) {
                _display(view, {}, $('.popup-window')[0]);
            });
        },

        appendSideBar: function() {
            require(['jsx!views/Sidebar'], function(view) {
                display(view, {}, $('.sidebar')[0]);
            });
        },

        studio: function(page, args) {
            args = args || '';

            var requests = args.split('/'),
                child_view = requests.splice(0, 1)[0],
                map = {
                    'print': this.print,
                    'settings': this.settings,
                    'laser': this.laser,
                    'scan': this.scan
                },
                func = this.print;

            if (true === map.hasOwnProperty(page)) {
                func = map[page];
            }

            func(child_view, requests);

            this.appendSideBar();
        },

        scan: function() {
            require(['jsx!pages/Scan'], function(view) {
                _display(view);
            });
        },

        print: function() {
            require(['jsx!pages/Print'], function(view) {
                _display(view);
            });
        },

        settings: function(child, requests) {
            require(['jsx!pages/Settings', 'app/app-settings'], function(view, settings) {
                child = (child || '').toLowerCase();

                var childView,
                    args = {
                        child: child,
                        requests: requests
                    };

                _display(view, args);
            });
        },

        laser: function() {
            require(['jsx!pages/Laser'], function(view) {
                _display(view);
            });
        },

        e404: function() {
            // TODO: handle 404
            alert('404');
        }

    });

});