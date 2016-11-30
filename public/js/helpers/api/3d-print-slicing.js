/**
 * API slicing
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-slicing
 */
define([
    'helpers/websocket',
    'helpers/convertToTypedArray',
    'helpers/is-json'
], (Websocket, convertToTypedArray, isJSON) => {
    'use strict';
    return (opts) => {

        opts = opts || {};
        opts.onError = opts.onError || function() {};

        let ws = new Websocket({

                method: '3dprint-slicing',

                onMessage: (data) => {
                    events.onMessage(data);
                    lastMessage = data;
                },

                onError: (data) => {
                    events.onError(data);
                    lastMessage = data;
                },

                onFatal: (data) => {
                    events.onFatal(data);
                    lastMessage = data;
                },

                onClose: (message) => {
                    lastMessage = message;
                }
            }),
            lastMessage = '',
            events = {
                onMessage: () => {},
                onError: () => {}
            },
            queueLock = false,
            queuedCommands = [];

        
        // When the queue is free, resolve to run the next "Command", and send a wrapped "Psuedo - Promise" 
        setInterval(() => {
            // Check queue
            if (!queueLock && queuedCommands.length > 0) {
                queueLock = true;
                // Pop 1 command
                let command = queuedCommands.splice(0,1)[0];
                console.log("Pop Command", command.name);
                command.q.resolve(command.wrapped);
            }
        }, 10);

        function getQueuePromise(api_name) {
            let qPromise = $.Deferred();
            
            let jPromise = $.Deferred();
            let wrapped = {
                resolve: (...args) => {
                    queueLock = false;
                    console.log("Resolve:: ", args);
                    jPromise.resolve.apply(jPromise, args);
                },
                reject: (...args) => {
                    queueLock = false;
                    jPromise.reject.apply(jPromise, args);
                },
                notify: (...args) => {
                    jPromise.notify.apply(jPromise, args);
                },
                promise: () => {
                    let promise = jPromise.promise();
                    return {           
                        then: (cb) => {
                            return promise.then(cb);
                        },
                        fail: (cb) =>{
                            return promise.fail(cb);
                        },
                        catch: (cb) => {
                            console.log("WARNING:: ES2016 Promise catch is not supported")
                            queueLock = false;
                            return promise.fail(cb);
                        },
                        progress: (cb) => {
                            return promise.progres(cb);
                        }
                    }
                }
            };
            
            queuedCommands.push({name: api_name, q: qPromise, wrapped: wrapped});
            return { q: qPromise.promise(), wrapped: wrapped };
        }

        return {

            connection: ws,

            queueLocked() {
                return queueLock;
            },

            upload: (name, file, ext) => {
                let queuedPromise = getQueuePromise('upload');
                queuedPromise.q.then((d) => {
                let progress,
                currentProgress;

                const CHUNK_PKG_SIZE = 4096;
                const nth = 5;

                events.onMessage = (result) => {

                    switch (result.status) {

                    case 'ok':
                        d.resolve(result);
                        break;

                    case 'continue':
                        let fileReader,
                            chunk,
                            length = file.length || file.size;

                        let step = 0,
                            total = parseInt((file.length || file.size) / CHUNK_PKG_SIZE);

                        for (let i = 0; i < length; i += CHUNK_PKG_SIZE) {
                            step++;
                            currentProgress = parseInt((step - step % (total/nth)) / total * 100);
                            if(currentProgress !== progress) {
                                progress = currentProgress;
                                d.notify(step++, total, progress);
                            }

                            chunk = file.slice(i, i + CHUNK_PKG_SIZE);

                            if (file instanceof Array) {
                                chunk = convertToTypedArray(chunk, Uint8Array);
                            }

                            fileReader = new FileReader();

                            fileReader.onloadend = (e) => {
                                ws.send(e.target.result);
                            };

                            fileReader.readAsArrayBuffer(chunk);
                        }
                        break;

                    case 'error':
                        d.reject(result);
                        break;

                    default:
                        // TODO: do something?
                        break;
                    }

                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ext = ext === 'obj' ? ' ' + ext : '';
                ws.send('upload ' + name + ' ' + file.size + ext);
                });
                return queuedPromise.wrapped.promise();
            },

            upload_via_path: (name, file, ext, fileUrl) => {
                let queuedPromise = getQueuePromise('upload_via_path');
                queuedPromise.q.then((d) => {
                let progress,
                currentProgress;

                events.onMessage = (result) => {

                    switch (result.status) {

                    case 'ok':
                        d.resolve(result);
                        break;

                    case 'continue':
                        break;

                    case 'error':
                        d.reject(result);
                        break;

                    default:
                        // TODO: do something?
                        break;
                    }

                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                }
                
                fileUrl = encodeURI(fileUrl);
                ext = ext === 'obj' ? ' ' + ext : '';
                ws.send('load_stl_from_path ' + name + ' ' + fileUrl + ext);

                return d.promise();
                });
                return queuedPromise.wrapped.promise();
            },

            set: (name, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ) => {
                let queuedPromise = getQueuePromise('set');
                queuedPromise.q.then((d) => {
                events.onMessage = (result) => {
                    d.resolve(result);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                let args = [name, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ];
                ws.send('set ' + args.join(' '));

                return d.promise();
                });
                return queuedPromise.wrapped.promise();
            },

            delete: (name) => {

                let queuedPromise = getQueuePromise('delete');
                queuedPromise.q.then((d) => {

                events.onMessage = (result) => {
                    d.resolve(result);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send('delete ' + name);
                return d.promise();
                });
                return queuedPromise.wrapped.promise();
            },

            // need revisit
            goF: (nameArray) => {

                let queuedPromise = getQueuePromise('goF');
                queuedPromise.q.then((d) => {

                events.onMessage = (result) => {
                    d.resolve(result);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send('go ' + nameArray.join(' ') + ' -f');
                return d.promise();
                });
                return queuedPromise.wrapped.promise();
            },

            beginSlicing: (nameArray, type) => {

                let queuedPromise = getQueuePromise('beginSlicing');
                queuedPromise.q.then((d) => {
                type = type || 'f';

                events.onMessage = (result) => {
                    d.resolve(result);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send(`begin_slicing ${nameArray.join(' ')} -${type}`);
                return d.promise();
                });
                return queuedPromise.wrapped.promise();
            },

            reportSlicing: () => {
                let queuedPromise = getQueuePromise('reportSlicing');
                queuedPromise.q.then((d) => {
                    let progress = [];

                    events.onMessage = (result) => {
                        if(result.status === 'ok') {
                            if(progress.length > 0) {
                                // only care about the last progress
                                let lastProgress = progress.pop();
                                progress.length = 0;
                                d.resolve(lastProgress);
                            }
                            else {
                                d.resolve();
                            }
                        }
                        else {
                            progress.push(result);
                        }
                    };

                    events.onError = (error) => {
                        d.reject(error);
                    };

                    events.onFatal = (error) => {
                        d.reject(error);
                    };

                    ws.send(`report_slicing`);
                    return d.promise();
                });
                return queuedPromise.wrapped.promise();
            },

            getSlicingResult: () => {

                let queuedPromise = getQueuePromise('getSlicingResult');
                queuedPromise.q.then((d) => {

                events.onMessage = (result) => {
                    if(result instanceof Blob) {
                        d.resolve(result);
                    }
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send(`get_result`);
                return d.promise();

                });
                return queuedPromise.wrapped.promise();
            },

            stopSlicing: () => {

                let queuedPromise = getQueuePromise('stopSlicing');
                queuedPromise.q.then((d) => {

                events.onMessage = (result) => {
                    d.resolve(result);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send(`end_slicing`);
                return d.promise();

                });
                return queuedPromise.wrapped.promise();
            },

            setParameter: (name, value) => {

                let queuedPromise = getQueuePromise('setParameter');
                queuedPromise.q.then((d) => {
                
                let errors = [];

                events.onMessage = (result) => {
                    d.resolve(result, errors);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                if(name === 'advancedSettings' && value !== '') {
                    ws.send(`advanced_setting ${value}`);
                }
                else {
                    ws.send(`advanced_setting ${name} = ${value}`);
                }

                return d.promise();

                });
                return queuedPromise.wrapped.promise();
            },

            getPath: () => {

                let queuedPromise = getQueuePromise('getPath');
                queuedPromise.q.then((d) => {

                events.onMessage = (result) => {
                    d.resolve(result);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send('get_path');
                return d.promise();

                });
                return queuedPromise.wrapped.promise();
            },

            uploadPreviewImage: (file) => {

                let queuedPromise = getQueuePromise('uploadPreviewImage');
                queuedPromise.q.then((d) => {

                events.onMessage = (result) => {

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

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send('upload_image ' + file.size);// + file.size);
                return d.promise();

                });
                return queuedPromise.wrapped.promise();
            },

            duplicate: (oldName, newName) => {

                let queuedPromise = getQueuePromise('duplicate');
                queuedPromise.q.then((d) => {

                events.onMessage = (result) => {
                    d.resolve(result);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send(`duplicate ${oldName} ${newName}`);

                return d.promise();

                });
                return queuedPromise.wrapped.promise();
            },

            changeEngine: (engine) => {

                let queuedPromise = getQueuePromise('changeEngine');
                queuedPromise.q.then((d) => {

                events.onMessage = (result) => {
                    d.resolve(result);
                };

                events.onError = (error) => {
                    d.reject(error);
                };

                events.onFatal = (error) => {
                    d.reject(error);
                };

                ws.send(`change_engine ${engine} default`);
                return d.promise();

                });
                return queuedPromise.wrapped.promise();
            },

            // this is a helper  for unit test
            trigger: (message, type) => {
                // console.log(message, type);
                if(type) {
                    type === 'FATAL' ? events.onFatal(message) : events.onError(message);
                }
                else {
                    events.onMessage(message);
                }
            }
        };
    };
});
