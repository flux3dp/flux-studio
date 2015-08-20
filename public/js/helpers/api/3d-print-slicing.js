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
                    // events.onMessage({status: 'fatal', error: message});
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
            set: function(name, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ, callback) {
                events.onMessage = function(result) {
                    callback(result);
                };
                var args = [name, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ];
                ws.send('set ' + args.join(' '));
                lastOrder = 'set';
            },
            delete: function(name, callback) {
                events.onMessage = function(result) {
                    callback(result);
                };
                ws.send('delete ' + name);
                lastOrder = 'delete';
            },
            go: function(nameArray, callback) {
                events.onMessage = function(result) {
                    callback(result);
                };
                ws.send('go ' + nameArray.join(' '));
                lastOrder = 'go';
            },
            setParameter: function(name, value) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    return d.resolve(result);
                };

                ws.send(`set_params ${name} ${value}`);
                lastOrder = 'set_params';

                return d.promise();
            }
        };
    };
});
