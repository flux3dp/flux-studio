/**
 * tracker
 */
define(function() {
    var body = document.querySelector('body'),
        tracker = document.createElement('script');

    if (false === window.FLUX.debug && true === window.FLUX.onLine) {
        tracker.setAttribute('src', 'https://d2zah9y47r7bi2.cloudfront.net/releases/current/tracker.js');
        tracker.setAttribute('async', true);
        body.appendChild(tracker);

        window._trackJs = {
            token: '650f74d7a9224d2c8792376b3be58530',
            onError: function (payload, error) {
                // List borrowed from the awesome @pamelafox
                // https://gist.github.com/pamelafox/1878283
                var i, commonCrypticExtensionErrors = [
                    "top.GLOBALS",
                    "originalCreateNotification",
                    "canvas.contentDocument",
                    "MyApp_RemoveAllHighlights",
                    "http://tt.epicplay.com",
                    "Can't find variable: ZiteReader",
                    "jigsaw is not defined",
                    "ComboSearch is not defined",
                    "http://loading.retry.widdit.com/",
                    "atomicFindClose",
                    "fb_xd_fragment",
                    "Script error."
                ];
                for (i = 0; i < commonCrypticExtensionErrors.length; i++) {
                    if (payload.message.indexOf(commonCrypticExtensionErrors[i]) > -1) {
                        // returning any kind of falsy value will reject error
                        return false;
                    }
                }

                // You can ignore based on any property in the payload
                var urlToIgnore = new RegExp("admin", "i");
                if(urlToIgnore.test(payload.url)){
                    return false;
                }

                return true; // Return any kind of truthy value here to allow transmission of error
            },

            console: {

                // Watch the console for events
                enabled: true,

                // Pass console messages through to the browser
                display: true,

                // Transmit console errors to TrackJS
                error: true,

                // Names of console functions to watch
                watch: ["log","debug","info","warn","error"]

            }
        };
    }

});