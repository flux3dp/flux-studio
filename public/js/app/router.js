define([
    'react',
    'jquery',
    'backbone',
    'helpers/display',
    'helpers/api/config',
    'app/app-settings',
    'helpers/detect-webgl',
],
function(React, $, Backbone, display, config, appSettings, detectWebgl) {
    'use strict';

    var _display = function(view, args, el) {
        console.log('_display', args)
        args = args || {};
        el = el || $('.content')[0];

        // WARNING: this function includes GLOBAL LIVE EVENTS.
        // DO NOT use non-uniqle selector here (e.g. class, tag name, attribute...etc.)
        display(view, args, el);
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
                        /^initialize\/wifi\/?(connect-machine|select|not-found|notice-from-device|set-printer|set-password|setup-complete)\/?(.*)?/,
                        'initial',
                        this.initial
                    ],
                    // go to studio
                    [
                        /^studio\/?(print|beambox|svg-edit|laser|scan|usb|settings|draw|cut|mill|cloud)\/?(.*)?/,
                        'studio',
                        this.studio
                    ],
                    // flux home
                    [/^$/, 'home', this.home]
                ];

            routes.forEach(function(route) {
                router.route.apply(router, route);
            });

            this.appendNotificationCollection();
        },

        home: function(name) {
            this.appendSideBar(false);

            requirejs(['jsx!pages/Home', 'app/app-settings'], function(view, settings) {
                var args = {
                    props: {
                        supported_langs: settings.i18n.supported_langs
                    }
                };

                _display(view, args);
            });
        },

        initial: function(step, other) {
            var map = {
                    'connect-machine': 'Connect-Machine',
                    'not-found': 'Printer-Not-Found',
                    'notice-from-device': 'Notice-From-Device',
                    'select': 'Wifi-Select',
                    'set-printer': 'Wifi-Set-Printer',
                    'set-password': 'Wifi-Set-Password',
                    'setup-complete': 'Wifi-Setup-Complete'
                },
                view_name = 'Wifi-Home';

            if (true === map.hasOwnProperty(step)) {
                view_name = map[step];
            }

            this.appendSideBar(false);

            requirejs(['jsx!pages/' + view_name], function(view) {
                _display(
                    view,
                    {
                        props: {
                            other: other
                        }
                    }
                );
            });
        },

        appendNotificationCollection: function() {
            requirejs(['jsx!views/Notification-Collection'], function(view) {
                display(view, {}, $('.notification')[0]);
            });
        },

        appendSideBar: function(show) {
            show = ('boolean' === typeof show ? show : true);
            requirejs(['jsx!views/Top-Menu'], function(view) {
                display(view, {
                    props: {
                        show: show
                    }
                }, $('.top-menu')[0]);
            });
        },

        studio: function(page, args) {
            args = args || '';

            var requests = args.split('/'),
                child_view = requests.splice(0, 1)[0],
                // if something needs webgl then add to the list below
                needWebGL = appSettings.needWebGL,
                map = {
                    'print': this.print,
                    'beambox': this.beambox,
                    'settings': this.settings,
                    'laser': this.holder.bind(null, page),
                    'draw': this.holder.bind(null, page),
                    'cut': this.holder.bind(null, page),
                    'mill': this.holder.bind(null, page),
                    'scan': this.scan,
                    'usb': this.usb,
                    'device': this.device,
                    'cloud': this.cloud
                },
                func = this.print;

            if (true === map.hasOwnProperty(page)) {
                func = map[page];
            }

            this.appendSideBar();

            if (false === detectWebgl() && -1 < needWebGL.indexOf(page)) {
                location.hash = '#studio/laser';
            }
            else {
                func(child_view, requests);
            }
        },

        scan: function(step) {
            requirejs(['jsx!pages/Scan'], function(view) {
                var args = {
                    step: step
                };
                _display(view, args);
            });
        },

        print: function() {
            requirejs(['jsx!pages/Print'], function(view) {
                _display(view);
            });
        },

        beambox: function() {
            requirejs(['jsx!pages/Beambox'], function(view) {
                _display(view);
            });
        },

        usb: function() {
            requirejs(['jsx!pages/usb'], function(view) {
                _display(view);
            });
        },

        settings: function(child, requests) {
            requirejs(['jsx!pages/Settings', 'app/app-settings'], function(view, settings) {
                child = (child || 'general').toLowerCase();

                var childView,
                    args = {
                        child: child,
                        requests: requests
                    };

                _display(view, args);
            });
        },

        holder: function(page, step) {
            let pageCamel = page.charAt(0).toUpperCase() + page.substring(1).toLowerCase();
            requirejs(['jsx!pages/' + pageCamel ], function(view) {
                var args = {
                    step: step,
                    props: {
                        page: page
                    }
                };
                _display(view, args);
            });
        },

        cloud: function(child, requests) {
            requirejs(['jsx!pages/Cloud', 'app/app-settings'], function(view) {
                child = (child || 'general').toLowerCase();

                var args = {
                    child: child,
                    requests: requests
                };

                _display(view, args);
            });
        },

        e404: function() {
            // TODO: handle 404
            alert('404');
        }
    });

});
