define(['helpers/is-json'], function(isJson) {
    'use strict';

    var websockets = [];
    websockets.list = function() {
        for(var i = 0; i < websockets.length; i++){
            console.log(i, websockets[i].url);
        }
    };

    window.FLUX.websockets = websockets;


    // options:
    //      hostname      - host name (Default: 127.0.0.1)
    //      port          - what protocol uses (Default: 8000)
    //      method        - method be called
    //      autoReconnect - auto reconnect on close
    //      onMessage     - fired on receive message
    //      onError       - fired on a normal error happend
    //      onFatal       - fired on a fatal error closed
    //      onClose       - fired on connection closed
    //      onOpen        - fired on connection connecting
    return function(options) {
        var _logs = [];

        var defaultCallback = function(result) {},
            defaultOptions = {
                hostname: location.hostname,
                method: '',
                port: window.FLUX.ghostPort,
                autoReconnect: true,
                onMessage: defaultCallback,
                onError: defaultCallback,
                onFatal: defaultCallback,
                onClose: defaultCallback,
                onOpen: defaultCallback
            },
            received_data = [],
            origanizeOptions = function(opts) {
                for (var name in defaultOptions) {
                    if (false === opts.hasOwnProperty(name) || 'undefined' === typeof opts[name]) {
                        opts[name] = defaultOptions[name];
                    }
                }

                return opts;
            },
            createWebSocket = function(options) {
                var url = 'ws://' + options.hostname + ':' + options.port + '/ws/' + options.method,
                    _ws = new WebSocket(url);

                _ws.onopen = function(e) {
                    options.onOpen(e);
                };

                _ws.onmessage = function(result) {
                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data);
                    _logs.push(['recv', data]);

                    if ('string' === typeof data) {
                        data = result.data.replace(/NaN(,)/g, 'null$1');
                    }

                    data = (true === isJson(data) ? JSON.parse(data) : data);

                    received_data.push(data);

                    if ('error' === data.status) {
                        options.onError(data);
                    }
                    else if ('fatal' === data.status) {
                        options.onFatal(data);
                    }
                    else if ('pong' === data.status) {
                        // it's a heartbeat response. ignore it.
                    }
                    else {
                        options.onMessage(data);
                    }
                };

                _ws.onclose = function(result) {
                    options.onClose(result);

                    if (true === options.autoReconnect) {
                        received_data = [];
                        ws = createWebSocket(options);
                    }
                    else {
                        ws = null;  // release
                    }
                };

                return _ws;
            },
            ws = null,
            readyState = {
                CONNECTING : 0,
                OPEN       : 1,
                CLOSING    : 2,
                CLOSED     : 3
            },
            socketOptions = origanizeOptions(options);

        ws = createWebSocket(socketOptions);

        setInterval(function() {
            if (null !== ws && readyState.OPEN === ws.readyState) {
                _logs.push(['sent','ping']);
                ws.send('ping');
            }
        }, 60000);

        var wsobj = {
            readyState: readyState,
            options: socketOptions,
            _logs: _logs,
            url: '/ws/' + options.method,

            send: function(data) {
                var self = this;

                if (null === ws) {
                    ws = createWebSocket(socketOptions);
                }

                if (null === ws || readyState.OPEN !== ws.readyState) {
                    ws.onopen = function() {
                        _logs.push(['sent',data]);
                        ws.send(data);
                    };
                }
                else {
                    _logs.push(['sent',data]);
                    ws.send(data);
                }

                return this;
            },

            fetchData: function() {
                return received_data;
            },

            fetchLastResponse: function() {
                return this.fetchData()[received_data.length - 1];
            },

            getReadyState: function() {
                return ws.readyState;
            },

            close: function(reconnect) {
                if ('boolean' === typeof reconnect) {
                    socketOptions.autoReconnect = reconnect;
                }

                if (null !== ws) {
                    ws.close();
                }
            },

            // events
            onOpen: function(callback) {
                socketOptions.onOpen = callback;

                return this;
            },

            onMessage: function(callback) {
                socketOptions.onMessage = callback;

                return this;
            },

            onClose: function(callback) {
                socketOptions.onclose = callback;

                return this;
            },

            onError: function(callback) {
                socketOptions.onError = callback;

                return this;
            },

            onFatal: function(callback) {
                socketOptions.onFatal = callback;

                return this;
            },

            optimizeLogs: function(){
                for(var i = 0; i < _logs.length; i++){
                    var process_data = JSON.stringify(_logs[i][1]);
                    if(typeof _logs[i][1] == "string"){
                        process_data = _logs[i][1];
                    }
                    if(process_data.length > 100){
                        process_data = process_data.substring(0,97) + "...";
                    }
                    _logs[i][1] = process_data;
                }
            },

            logs: function(){
                for(var i = 0; i < _logs.length; i++){
                    var data = JSON.stringify(_logs[i][1]);
                    var additional_data = null;
                    if(typeof _logs[i][1] == "string"){
                        data = _logs[i][1];
                        if(data.length > 100){
                            additional_data = {str: data};
                            data = data.substring(0,20) + "...";
                        }
                    }
                    if(data && data.length > 100) data = _logs[i][1];
                    if(additional_data){
                        console.log(_logs[i][0], data, additional_data);
                    }else{
                        console.log(_logs[i][0], data);
                    }
                }
            }
        };
        websockets.push(wsobj);
        return wsobj;
    };
});
