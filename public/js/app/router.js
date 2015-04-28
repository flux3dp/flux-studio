define([
    'react',
    'jquery',
    'backbone'
],
function(React, $, Backbone) {
    'use strict';
    var display = function(view, args, el) {
        args = args || {};
        el = el || $('.wrapper')[0];

        view = React.createFactory(view(args));
        view = view();

        view.props.params = args;
        view.props.lang = {
            foo : function() {
                return 'test';
            }
        };

        React.render(view, el);
        console.log(React);
    };

    return Backbone.Router.extend({

        routes: {
            '': 'home'
        },

        home: function() {
            require(['jsx!views/Print'], function(View) {
                display(View);
            });
        }

    });

});