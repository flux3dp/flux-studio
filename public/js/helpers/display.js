/**
 * general display helper function
 */
define([
    'react',
    'jquery',
    'helpers/i18n'
], function(React, $, i18n) {
    'use strict';

    var views = [];

    return function(view, args, el) {
        args = args || {};
        args.props = args.props || {};
        args.state = args.state || {};

        args.state.lang = i18n.get();

        view = React.createFactory(view(args));
        view = view();

        view.props = args.props;

        views.push(React.render(view, el));
    };
});
