// ref to: http://www.browserleaks.com/webgl#howto-detect-webgl
define(function() {
    'use strict';

    return function(return_context)
    {
        if (!!window.WebGLRenderingContext) {
            var canvas = document.createElement("canvas"),
                 names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
               context = false;

            for(var i=0;i<4;i++) {
                try {
                    context = canvas.getContext(names[i]);
                    if (context && typeof context.getParameter === "function") {
                        // WebGL is enabled
                        if (return_context) {
                            // return WebGL object if the function's argument is present
                            return {name:names[i], gl:context};
                        }
                        // else, return just true
                        return true;
                    }
                } catch(e) {}
            }

            // WebGL is supported, but disabled
            return false;
        }

        // WebGL not supported
        return false;
    };
});
