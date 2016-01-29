var ws = require("nodejs-websocket"),
    assert = require('assert'),
    Q = require('q');

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
    });

    return conn;
};

exports.TestCase = function(describe, timeout) {
    timeout = timeout || 1000;

    var self = this,
        deferred = Q.defer(),
        _onStarting = function() {},
        _onProgress = function() {};

    self.onProgress = function(cb) {
        _onProgress = cb;

        return self;
    };
    self.onStarting = function(cb) {
        _onStarting = cb;

        return self;
    };

    self.go = function(conn) {
        console.log('###\t' + describe.toUpperCase());

        _onStarting(deferred, conn).then(null, function() {
            exports.err(JSON.stringify(argument), 9999);    // runtime error
        }, function(response) {
            exports.response(response);

            _onProgress(response, deferred, conn);
        });

        conn.on('text', function(data) {
            var json = JSON.parse(data);

            deferred.notify(json);
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