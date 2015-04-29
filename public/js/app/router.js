define([
    'react',
    'jquery',
    'backbone',
    'helpers/local-storage',
    'helpers/i18n',
    'helpers/observe'
],
function(React, $, Backbone, localStorage, i18n, Observe) {
    'use strict';
    var display = function(view, args, el) {
        args = args || {};
        args.props = args.props || {};
        args.state = args.state || {};
        el = el || $('.wrapper')[0];

        args.state.lang = i18n.get();

        var currentView;

        // watching state and auto update
        new Observe(args.state, function(changes){
            currentView.setState(args.state);
        });

        view = React.createFactory(view(args));
        view = view();

        view.props = args.props;

        currentView = React.render(view, el);
    };

    return Backbone.Router.extend({

        routes: {
            '': 'home',
            'initize/wifi(/:step)' : 'wifi',
        },

        home: function() {
            require(['jsx!pages/Home', 'app/app-settings'], function(view, settings) {
                var args = {
                        props : {
                            supported_langs : settings.i18n.supported_langs
                        }
                    };

                display(view, args);
            });
        },

        wifi : function(step, serial) {
            var map = {
                    'ask'          : 'Wifi-Home',
                    'select'       : 'Wifi-Select',
                    'spot'         : 'Wifi-Spot',
                    'set-password' : 'Wifi-Set-Password',
                    'success'      : 'Wifi-Success',
                    'failure'      : 'Wifi-Failure'
                },
                view_name = 'Wifi-Home';

            if (true === map.hasOwnProperty(step)) {
                view_name = map[step];
            }

            require(['jsx!pages/' + view_name], function(view) {
                display(view);
            });
        }

    });

});