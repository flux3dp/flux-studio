'use strict';

// Warning: Do not include any electron module here
// Warning: Do not include any electron module here
// Warning: Do not include any electron module here

const EventEmitter = require('events');
const WebSocketClient = require('websocket').client;
const spawn = require('child_process').spawn;

function uglyJsonParser(data) {
    try {
        return JSON.parse(data);
    } catch(err) {
        console.log(data);
        if(err.name === 'SyntaxError') {
            let offset = Number(err.message.split(' ').reverse()[0]);
            if(offset && data.substr(offset, 3) === 'NaN') {
                return uglyJsonParser(`${data.substr(0, offset)}null${data.substr(offset + 3)}`);
            }
        }
    }
}


class BackendManager extends EventEmitter {
    constructor(options) {
        super();
        // location: exec path
        // trace_pid: optional
        // on_ready: callback, (sender) => {}
        // on_device_updated, callback (sender, deviceProfile) => {}
        // on_stderr: callback, (sender, data) => {}
        // on_stopped: callback, (sender) => {}

        this._args = ['--port', '0'];

        if(!options.location) { throw 'backend location not given'; }
        this._ghost_location = options.location;

        if(options.trace_pid) {
            this._args = this._args.concat(['--trace-pid', options.trace_pid]);
        }

        if(options.on_ready) {
            this.on('ready', options.on_ready);
        }
        if(options.on_stderr) {
            this.on('stderr', options.on_stderr);
        }
        if(options.on_device_updated) {
            this.on('device_updated', options.on_device_updated);
        }
        if(options.on_stopped) {
            this.on('stopped', options.on_stopped);
        }

        this._running = false;
        this._proc = undefined;
        this._ws = undefined;
        this._wsconn = undefined;
    }

    _setRecover() {
        if(this._recover_timer) {
            return;
        } else {
            console.log('Backend manager recover set.');
            this._recover_timer = setTimeout(() => {
                this._recover_timer = undefined;
                if(this._running) {
                    if(!this._proc) {
                        console.log('Backend manager recover from spawn.');
                        this._spawn();
                    } else if(!this._ws) {
                        console.log('Backend manager recover from websocket.');
                        this._prepare_discover();
                    } else {
                        console.log('Nothing to recover in backend manager');
                    }
                } else {
                    console.log('Backend manager recover ignored.');
                }
            }, 2500);
        }
    }

    _prepare_discover() {
        this._ws = new WebSocketClient();
        this._ws.on('connect', (conn) => {
            this._wsconn = conn;
            this._ws_tm = new Date();
            conn.on('message', (message) => {

                // prevent timeout disconnect
                let now = new Date();
                if (now - this._ws_tm > 30000) {
                    conn.send("ping");
                    this._ws_tm = now;
                }

                if (message.type === 'utf8') {
                    let devInfo;

                    try {
                        devInfo = uglyJsonParser(message.utf8Data);
                    } catch(err) {
                        console.error("Can not parse backend stout: %s", err);
                    }
                    this.emit('device_updated', devInfo);
                }
            });
            conn.on('close', () => {
                this._wsconn = undefined;
                this._ws = undefined;
                if(this._running) {
                    console.error('Discover WebSocket close unexpectedly.');
                    this._setRecover();
                }
            });
            conn.on('error', (error) => {
                console.error('Discover WebSocket error: %s', error);
            });
        });
        this._ws.on('connectFailed', (error) => {
            this._ws = undefined;
            if(this._running) {
                console.error('Discover connect failed: %s', error);
                this._setRecover();
            }
        });
        this._ws.connect(`ws://localhost:${this._port}/ws/discover`);
    }

    _spawn() {
        this._proc = spawn('"' + this._ghost_location + '"', this._args, {shell: true});

        this._proc.stdout.on('data', (data) => {
            let result = uglyJsonParser(data.toString());
            if(result && result.type === 'ready') {
                try {
                    this.emit('ready', result);
                } finally {
                    this._port = result.port;
                    this._prepare_discover();
                }
            }
        });

        this._proc.stderr.on('data', (data) => {
            this.emit('stderr', data);
        });

        this._proc.on('exit', () => {
            try {
                this.emit('stopped');
            } finally {
                this._proc = undefined;
                if(this._running) {
                    console.log('Backend terminated unexpectedly!');
                    this._setRecover();
                }
            }
        });
    }

    start() {
        if(!this._running) {
            this._running = true;
            this._spawn();
        }
    }

    stop() {
        if(this._running) {
            this._running = false;
            this._proc.kill();
        }
    }

    poke(ipaddr) {
        if(this._wsconn !== undefined) {
            console.log('wsconn is', this._wsconn);
            this._wsconn.send(ipaddr);
            return true;
        } else {
            return false;
        }
    }
}

module.exports = BackendManager;
