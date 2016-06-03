requirejs.config({
    urlArgs: 'v=' + window.FLUX.timestamp,
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
        threeOrbitControls: 'lib/three/controls/OrbitControls',
        threeTrackballControls: 'lib/three/controls/TrackballControls',
        threeSTLLoader: 'lib/three/loaders/STLLoader',
        threeOBJLoader: 'lib/three/loaders/OBJLoader',
        threeTrackball: 'lib/three/controls/TrackballControls',
        threeCircularGridHelper: 'helpers/CircularGridHelper',
        cssHome: '../css/3rd-party-plugins',
        freetrans: 'plugins/freetrans/jquery.freetrans',
        html2canvas: 'lib/html2canvas.min',
        events: 'lib/events'
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
        threeOBJLoader: {
            deps: [
                'threejs'
            ],
            exports: 'OBJLoader'
        },
        freetrans: {
            deps: [
                'jquery',
                'plugins/freetrans/Matrix',
                'css!cssHome/freetrans/jquery.freetrans'
            ],
            exports: 'freetrans'
        },
        events: {
            exports: 'events'
        }
    }
});

requirejs([
    'jquery',
    'backbone',
    'app/router',
    'app/actions/global',
    'helpers/tracker',
    'threejs'
], function($, Backbone, Router, globalEvents) {
    'use strict';

    if (true === window.FLUX.isNW) {
        window.$ = window.jQuery = $;
    }

    // GA setting up
    // NOTICE: rename ga as GA to prevent conflict with requirejs
    window.GA = ('undefined' !== typeof ga ? ga : function() {});

    GA(
        'create',
        'UA-40862421-6',
        {
            'cookieDomain': 'none'
        }
    );

    GA('send', 'pageview', location.hash);

    globalEvents(function() {
        var router = new Router();
        Backbone.history.start();
    });
});
