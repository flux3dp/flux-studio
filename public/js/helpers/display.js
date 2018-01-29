/**
 * general display helper function
 */
define([
    'react',
    'reactDOM',
    'jquery',
    'helpers/i18n'
], function(React, ReactDOM, $, i18n) {
    'use strict';

    var views = [];

    return function(view, args, el) {
        args = args || {};
        args.props = args.props || {};
        args.state = args.state || {};

        args.state.lang = i18n.get();
        const viewFactory = React.createFactory(view(args));
        var view = viewFactory(args);

        // view.props = args.props;

        views.push(ReactDOM.render(view, el));
    };
});
