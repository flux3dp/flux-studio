define([
    'react',
    'jquery',
    'backbone',
    'helpers/display',
    'helpers/api/config',
    'app/app-settings',
    'helpers/detect-webgl'
],
function(React, $, Backbone, display, config, appSettings, detectWebgl) {
    'use strict';

    var _display = function(view, args, el) {
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
                        /^initialize\/wifi\/?(connect-machine|select|set-printer|set-password|setup-complete)\/?(.*)?/,
                        'initial',
                        this.initial
                    ],
                    // go to studio
                    [
                        /^studio\/?(print|laser|scan|usb|settings|device)\/?(.*)?/,
                        'studio',
                        this.studio
                    ],
                    // flux home
                    [/^$/, 'home', this.home],
                ];

            routes.forEach(function(route) {
                router.route.apply(router, route);
            });

            this.checkSoftwareUpdate();
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

        initial: function(step, other) {
            var map = {
                    'connect-machine': 'Connect-Machine',
                    'select': 'Wifi-Select',
                    'set-printer': 'Wifi-Set-Printer',
                    'set-password': 'Wifi-Set-Password',
                    'setup-complete': 'Wifi-Setup-Complete'
                },
                view_name = 'Wifi-Home';

            if (true === map.hasOwnProperty(step)) {
                view_name = map[step];
            }

            require(['jsx!pages/' + view_name], function(view) {
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

        checkSoftwareUpdate: function() {
            var data = {
                    os: ''
                },
                ignoreVersions = config().read('software-update-ignore-list') || [],
                fetchProfile = function() {
                    var deferred = $.Deferred();

                    $.ajax({
                        url: 'package.json'
                    }).then(function(response) {
                        if(typeof(response) === 'object') {
                            deferred.resolve(response);
                        }
                        else {
                            deferred.resolve(JSON.parse(response));
                        }
                    });

                    return deferred;
                },
                fetchLatestVersion = function(currentProflie) {
                    var deferred = $.Deferred();

                    data.os = (window.FLUX.osType || '') + '-' + (window.FLUX.arch || '');

                    $.ajax({
                        url: 'http://software.flux3dp.com/check-update/',
                        data: data
                    }).then(function(response) {
                        deferred.resolve(currentProflie, response);
                    });

                    return deferred;
                };

            fetchProfile().then(fetchLatestVersion).done(function(currentProflie, currentVersion) {
                var isIgnore = -1 < ignoreVersions.indexOf(currentVersion.latest_version),
                    props = {};

                if (false === isIgnore &&
                    null !== currentVersion.latest_version &&
                    currentVersion.latest_version !== currentProflie.version
                ) {
                    props = {
                        open: true,
                        type: 'software',
                        currentVersion: currentProflie.version,
                        latestVersion: currentVersion.latest_version,
                        releaseNote: currentVersion.changelog,
                        onClose: function() {},
                        onInstall: function() {
                            if ('undefined' !== typeof requireNode) {
                                requireNode('nw.gui').Shell.openExternal('https://flux3dp.com/downloads/');
                            }
                            else {
                                window.open('https://flux3dp.com/downloads/');
                            }
                        }
                    };

                    require(['jsx!views/Update-Dialog'], function(view) {
                        display(
                            function() { return view; },
                            {
                                props: props
                            },
                            $('.software-update')[0]
                        );
                    });
                }
            });
        },

        appendSideBar: function() {
            require(['jsx!views/TopMenu'], function(view) {
                display(view, {}, $('.top-menu')[0]);
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
                    'settings': this.settings,
                    'laser': this.laser,
                    'scan': this.scan,
                    'usb': this.usb,
                    'device': this.device
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
            require(['jsx!pages/Scan'], function(view) {
                var args = {
                    step: step
                };
                _display(view, args);
            });
        },

        print: function() {
            require(['jsx!pages/Print'], function(view) {
                _display(view);
            });
        },

        usb: function() {
            require(['jsx!pages/usb'], function(view) {
                _display(view);
            });
        },

        device: function(child, requests) {
            require(['jsx!pages/Device'], function(view) {
                var args = {
                    child: child,
                    requests: requests
                };
                _display(view, args);
            });
        },

        settings: function(child, requests) {
            require(['jsx!pages/Settings', 'app/app-settings'], function(view, settings) {
                child = (child || 'general').toLowerCase();

                var childView,
                    args = {
                        child: child,
                        requests: requests
                    };

                _display(view, args);
            });
        },

        laser: function(step) {
            require(['jsx!pages/Laser'], function(view) {
                var args = {
                    step: step
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
