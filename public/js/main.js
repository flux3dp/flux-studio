require.config({
    baseUrl: 'js/',

    paths: {
        jquery: 'lib/jquery-1.11.0.min',
        backbone: 'lib/backbone',
        underscore: 'lib/underscore',
        react: 'lib/react/react-with-addons.min',
        JSXTransformer: 'lib/react/JSXTransformer',
        views: 'app/views',
        pages: 'app/pages',
        widgets: 'app/widgets',
        threejs: 'lib/three/three.min',
        threeTransformControls: 'lib/three/controls/TransformControls',
        threeSTLLoader: 'lib/three/loaders/STLLoader',
        threeTrackball: 'lib/three/controls/TrackballControls',
        cssHome: '../css',
        freetrans: 'plugins/freetrans/jquery.freetrans',
        html2canvas: 'lib/html2canvas.min'
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
        },
        threeTransformControls: {
            deps: [
                'threejs'
            ],
            exports: 'TransformControls'
        },
        threeSTLLoader: {
            deps: [
                'threejs'
            ],
            exports: 'STLLoader'
        },
        freetrans: {
            deps: [
                'jquery',
                'plugins/freetrans/Matrix',
                'css!cssHome/3rd-party-plugins/freetrans/jquery.freetrans'
            ],
            exports: 'freetrans'
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