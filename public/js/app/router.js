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
            setTimeout(function() {
                currentView.setState(args.state);
            }, 1000);
        });

        view = React.createFactory(view(args.state));
        view = view();

        view.props = args.props;

        currentView = React.render(view, el);
    };

    return Backbone.Router.extend({

        routes: {
            '': 'home'
        },

        home: function() {
            require(['jsx!views/Home'], function(View) {
                display(View);
            });
        }

    });

});