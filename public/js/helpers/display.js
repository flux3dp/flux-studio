/**
 * general display helper function
 */
define([
    'react',
    'jquery',
    'helpers/i18n',
    'helpers/observe'
], function(React, $, i18n, Observe) {
    'use strict';

    return function(view, args, el, callback) {
        callback = callback || function() {};
        args = args || {};
        args.props = args.props || {};
        args.state = args.state || {};

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

        callback(args);
    };
});