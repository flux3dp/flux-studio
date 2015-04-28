define(['jquery'], function($) {
    'use strict';

    var url = 'ws://localhost:8080/ws/';

    return function(method) {
        var ws = new WebSocket(url + method);

        ws.onclose = function(v) {
            // TODO: do something
            console.log('CONNECTION CLOSED');
            ws = null;  // release
        };

        return {
            send : function(data) {
                var wait = 0,
                    retry_times = 1000,
                    $deferred = $.Deferred(),
                    timer = setInterval(function() {
                        // waiting for connected
                        retry_times--;

                        try {
                            if (1 === ws.readyState) {
                                ws.send(data);

                                // reset timer
                                retry_times = 0;
                            }
                        }
                        catch (ex) {
                            // TODO: do something
                        }

                        if (retry_times <= 0) {
                            clearInterval(timer);
                        }

                        wait = 100;

                    }, wait);

                ws.onmessage = function(result) {
                    $deferred.resolve(result);
                };

                return $deferred.promise();
            },
            close : function() {
                if (null !== ws) {
                    ws.close();
                }
            }
        };
    };
});