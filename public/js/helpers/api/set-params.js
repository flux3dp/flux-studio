/**
 * set params
 */
define(['helpers/is-json'], function(isJson) {
    'use strict';

    var convertObjectToArray = function(params) {
        var arr = [];

        for (var key in params) {
            arr.push([
                'set_params',
                key,
                params[key]
            ]);
        }

        return arr;
    };

    return function(ws) {

        return {
            /**
             * set single parameter each time
             *
             * @param params {json} - a set of parameter
             * @param opts   {json} - option arguments
             */
            setEach: function(params, opts) {
                var timer,
                    nextParam,
                    paramsAmount,
                    okTimes = 0;

                params = convertObjectToArray(params);
                paramsAmount = params.length;
                nextParam = params.pop();
                opts.onFinished = opts.onFinished || function() {};
                opts.onClose = opts.onClose || function() {};

                ws.onMessage(function(result) {
                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data);

                    if ('ok' === data.status) {
                        nextParam = params.pop();
                        okTimes++;
                    }
                }).onClose(function(result) {
                    clearInterval(timer);
                    opts.onClose(result);
                });

                timer = setInterval(function() {
                    if (okTimes === paramsAmount) {
                        clearInterval(timer);
                        opts.onFinished();
                    }

                    if ('undefined' !== typeof nextParam) {
                        ws.send(nextParam.join(' '));
                        nextParam = undefined;
                    }
                }, 0);
            }
        };
    };
});