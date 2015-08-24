/**
 * API bitmap laser parser
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-bitmap-laser-parser
 */
define([
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'helpers/is-json'
], function(Websocket, convertToTypedArray, isJson) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: '3dprint-slicing',
                onMessage: function(result) {

                    var data = (true === isJson(result.data) ? JSON.parse(result.data) : result.data);

                    events.onMessage(data);
                    lastMessage = data.error;
                },
                onClose: function(message) {
                    lastMessage = message;
                }
            }),
            lastOrder = '',
            lastMessage = '',
            events = {
                onMessage: function() {}
            };

        return {
            connection: ws,
            upload: function(name, file, callback) {

                events.onMessage = function(result) {
                    switch (result.status) {
                    case 'ok':
                        callback(result);
                        break;
                    case 'continue':
                        ws.send(file);
                        break;
                    default:
                        // TODO: do something?
                        break;
                    }

                };

                ws.send('upload ' + name + ' ' + file.size);
                lastOrder = 'upload';
            },
            set: function(name, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };
                var args = [name, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ];
                ws.send('set ' + args.join(' '));
                lastOrder = 'set';

                return d.promise();
            },
            delete: function(name, callback) {
                events.onMessage = function(result) {
                    callback(result);
                };
                ws.send('delete ' + name);
                lastOrder = 'delete';
            },
            go: function(nameArray) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    // server returns status first then blob
                    if(result instanceof Blob) {
                        d.resolve(result);
                    }
                    else {
                        if(result.status !== 'complete') {
                            d.resolve(result.error);
                        }
                    }
                };
                ws.send('go ' + nameArray.join(' '));
                lastOrder = 'go';

                return d.promise();
            },
            setParameter: function(name, value) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send(`set_params ${name} ${value}`);
                lastOrder = 'set_params';

                return d.promise();
            }
        };
    };
});
