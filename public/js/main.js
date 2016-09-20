requirejs.config({
    urlArgs: 'v=' + (Boolean(localStorage.dev) ? '' : window.FLUX.timestamp),
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
        events: 'lib/events',
        window: 'app/window',
        localStorage: 'app/local-storage',
        Rx: 'lib/rx.lite.min',
        Redux: 'lib/redux.min'
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
            exports: 'TransformControls'
        },
        threeSTLLoader: {
            exports: 'STLLoader'
        },
        threeOBJLoader: {
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
        },
        Rx: {
            exports: 'Rx'
        },
        Redux: {
            exports: 'Redux'
        }
    }
});

requirejs([
    'jquery',
    'backbone',
    'app/router',
    'app/actions/global',
    'helpers/tracker'
], function($, Backbone, Router, globalEvents) {
    'use strict';

    if (true === window.FLUX.isNW) {
        window.$ = window.jQuery = $;
    }

    // google analytics
    if(window.FLUX.allowTracking) {
        $.getScript('/js/helpers/analytics.js');
    }

    globalEvents(function() {
        let router = new Router();
        Backbone.history.start();
    });
});
