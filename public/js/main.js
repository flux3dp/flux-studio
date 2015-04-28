require.config({
    baseUrl: 'js/',

    paths: {
        jquery: 'lib/jquery-1.11.0.min',
        backbone: 'lib/backbone',
        underscore: 'lib/underscore',
        react: 'lib/react/react-with-addons.min',
        JSXTransformer: 'lib/react/JSXTransformer',
        views: 'app/views',
        three: 'lib/three',
        threejs: 'lib/three/three.min'
    },

    jsx: {
        fileExtension: '.jsx',
        harmony: true,
        stripTypes: true
    },

    map: {
        '*': {
            jsx: 'lib/react/jsx',
            css: 'lib/css-loader',
            text: 'lib/text',
            domReady: 'lib/domReady',
        }
    },

    shim: {
        threejs: {
            exports: 'threejs'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        jquery: {
            exports: '$'
        },
        underscore: {
            exports: '_'
        }
    }
});

require([
    'jquery',
    'backbone',
    'app/router',
    'helpers/local-storage',
    'domReady!',
    'threejs'
], function($, Backbone, Router, localStorage) {
    'use strict';

    var router = new Router();

    // load lang file
    require(['helpers/i18n'], function(i18n) {
        Backbone.history.start();
    });
});