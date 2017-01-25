define([

], function(

) {
    return function(url, onMessage, onError) {
        return new Promise((resolve) => {
            let ws = new WebSocket(url);

            ws.onopen = function() {
                resolve(ws);
            };

            ws.onmessage = function(response) {
                onMessage(response);
            };

            ws.onerror = function(response) {
                onError(response);
            };
        });
    };
});
