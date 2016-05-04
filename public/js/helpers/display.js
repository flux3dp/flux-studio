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

        // watching state and auto update
        // new Observe(args.state, function(changes) {
        //     console.log('1');
        //     views.forEach(function(view, key) {
        //         view.setState(args.state);
        //     });
        // });

        view = React.createFactory(view(args));
        view = view();

        view.props = args.props;

        views.push(React.render(view, el));

        $('body').off('change').on('change', '#select-lang', function(e) {
            args.state.lang = i18n.setActiveLang(e.currentTarget.value).get();
            views.forEach(function(view, key) {
                view.setState(args.state);
            });
        });
    };
});
