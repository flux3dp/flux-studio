var ws = require("nodejs-websocket"),
    assert = require('assert'),
    Q = require('q');

ws.setMaxBufferLength(4096);

exports.executeTest = function(name, apiMethod, testCases) {
    var conn;
    console.log('#####\tTEST ' + name.toUpperCase());
    console.time(name);

    conn = ws.connect('ws://127.0.0.1:10000/ws/' + apiMethod, function() {
        var methods = testCases,
            result = Q(1);

        methods.forEach(function(f, index) {
            result = result.then(f.go.bind(null, conn));

            if (index + 1 === methods.length) {
                result.done(function() {
                    console.timeEnd(name);
                    process.exit();
                });
            }
        });

        conn.on('error', function(data) {
            exports.err(JSON.stringify(data));
        });

        conn.on('close', function(code, reason) {
            exports.err(reason, code);
        });

        // off event
        conn.off = function(eventName) {
            if (true === eventName in conn._events) {
                delete conn._events[eventName];
            }

            return this;
        };
    });

    return conn;
};

exports.TestCase = function(describe, timeout) {
    timeout = timeout || 1000;

    var self = this,
        deferred = Q.defer(),
        buffer = new Buffer(0),
        length = 0,
        _onStarting = function() {},
        _onProgress = function() {};

    deferred.time = describe + '-' + (new Date()).getTime();

    self.onProgress = function(cb) {
        _onProgress = ('function' === typeof cb ? cb : _onProgress);

        return self;
    };
    self.onStarting = function(cb) {
        _onStarting = ('function' === typeof cb ? cb : _onStarting);

        return self;
    };

    self.go = function(conn) {
        console.log('###\t' + describe.toUpperCase());


        (function() {
            _onStarting(deferred, conn);

            return deferred.promise;
        }()).then(null, function() {
            exports.err(JSON.stringify(argument), 9999);    // runtime error
        }, function(response) {
            exports.response(response);

            _onProgress(response, deferred, conn);
        });

        conn.off('text').on('text', function(data) {
            var json = JSON.parse(data);

            if ('number' === typeof json.length) {
                length = json.length;
            }

            deferred.notify(json);
        });

        conn.off('binary').on('binary', function(inStream) {
            var status = 'progressing';

            // Read chunks of binary data and add to the buffer
            inStream.on('readable', function () {
                var newData = inStream.read();

                if (newData) {
                    buffer = Buffer.concat([buffer, newData], buffer.length + newData.length);
                }
            });

            inStream.on('end', function () {
                if (buffer.length === length) {
                    status = 'ok';
                }

                deferred.notify({ status: status, buffer: buffer });
            });
        });

        setTimeout(function() {
            exports.err(describe + ' Timeout', 9999);
        }, timeout);

        return deferred.promise;
    };
};

exports.response = function(response) {
    console.info('[Response] ', response);
};

exports.err = function(response, code) {
    code = code || 0;
    response = ('string' === typeof response ? response : JSON.stringify(response));

    console.error(new Error(response.toString()), code);
    process.exit(1);
};