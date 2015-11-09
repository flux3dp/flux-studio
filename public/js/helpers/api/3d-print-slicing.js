/**
 * API slicing
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-slicing
 */
define([
    'helpers/websocket',
    'helpers/convertToTypedArray'
], function(Websocket, convertToTypedArray) {
    'use strict';

    return function(opts) {
        opts = opts || {};
        opts.onError = opts.onError || function() {};

        var ws = new Websocket({
                method: '3dprint-slicing',
                onMessage: function(data) {
                    events.onMessage(data);
                    lastMessage = data;
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
            upload: function(name, file) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    switch (result.status) {
                    case 'ok':
                        d.resolve(result);
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
                return d.promise();
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
            // go does not use deferred because multiple response and instant update
            goG: function(nameArray, callback) {
                events.onMessage = function(result) {
                    callback(result);
                };
                ws.send('go ' + nameArray.join(' ') + ' g');
                lastOrder = 'go';
            },
            goF: function(nameArray, callback) {
                events.onMessage = function(result) {
                    callback(result);
                };
                ws.send('go ' + nameArray.join(' ') + ' f');
                lastOrder = 'go';
            },
            setParameter: function(name, value) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                if(name === 'advancedSettings' && value !== '') {
                    ws.send(`advanced_setting ${value}`);
                }
                else {
                    ws.send(`set_params ${name} ${value}`);
                }

                lastOrder = 'set_params';

                return d.promise();
            },
            status: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('position');
                lastOrder = 'status';

                return d.promise();
            },
            getPath: function() {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    d.resolve(result);
                };

                ws.send('get_path');
                lastOrder = 'get_path';

                return d.promise();
            },
            uploadPreviewImage: function(file) {
                var d = $.Deferred();
                events.onMessage = function(result) {
                    switch (result.status) {
                    case 'ok':
                        d.resolve(result);
                        break;
                    case 'continue':
                        ws.send(file);
                        break;
                    default:
                        // TODO: do something?
                        break;
                    }

                };

                ws.send('upload_image ' + file.size);
                lastOrder = 'upload_image';

                return d.promise();
            }
        };
    };
});
