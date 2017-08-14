
requirejs.config({
    urlArgs: 'v=' + (Boolean(localStorage.dev) ? '' : window.FLUX.timestamp),
    baseUrl: 'js/',
    paths: {
        //jquery: 'lib/jquery-1.11.0.min',
        jquery: 'lib/svgeditor/jquery',
        backbone: 'lib/backbone',
        underscore: 'lib/underscore',
        react: 'lib/react/react-with-addons.min',
        views: 'app/views',
        pages: 'app/pages',
        widgets: 'app/widgets',
        svgeditor: 'lib/svgeditor',
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
        Redux: 'lib/redux.min',
        Raven: 'helpers/raven.min',
        threejs: 'lib/three/three.min'
    },

    jsx: {
        fileExtension: '.jsx',
        harmony: true,
        stripTypes: true
    },

    map: {
        '*': {
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
        },
        Raven: {
            exports: 'Raven'
        }
    }
});

requirejs([
    'jquery',
    'backbone',
    'app/router',
    'app/actions/global',
    'Raven',
    'helpers/tracker'
], function($, Backbone, Router, globalEvents, Raven) {
    'use strict';

    window.$ = window.jQuery = $;
    console.log(`Flux-Studio: ${window.FLUX.version}`);

    if(window.FLUX.allowTracking) {
        // google analytics
        $.getScript('/js/helpers/analytics.js');

        // sentry
        Raven.config('http://6113878f548846998899855e8e83c477@sentry.io/124829', {
            ignoreUrls: [/cloudserv1\.flux3dp\.com:3000/]
        });
        Raven.debug = false;
        try { window.Raven.setRelease(window.FLUX.version); } catch (e) { }
        Raven.install();
        window.Raven = Raven;
    }

    globalEvents(function() {
        let router = new Router();
        Backbone.history.start();
    });
});
