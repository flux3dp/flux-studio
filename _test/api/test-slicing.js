var ws = require("nodejs-websocket"),
    fs = require('fs'),
    Q = require('q'),
    uploadName = 'test',
    upload,
    conn;

console.log('#####\tTEST SLICING');

conn = ws.connect('ws://127.0.0.1:8000/ws/3dprint-slicing', function() {
    var methods = [upload],
        result = Q(1);

    methods.forEach(function(f, index) {
        result = result.then(f);

        if (index + 1 === methods.length) {
            result.done(function() {
                process.exit();
            });
        }
    });

    conn.on('error', function(data) {
        console.log('error', data);
        process.exit(1);
    });
});

upload = function() {
    var deferred = Q.defer(),
        file;

    console.log('###\tUPLOAD STL FILE');

    (function() {
        fs.readFile(process.cwd() + '/_test/api/assets/guide-example.stl', function(err, data) {
            file = data;
            deferred.notify({ status: 'starting' });
        });

        return deferred.promise;
    }()).then(null, function() {
        // fail
        console.log('fail', arguments);
        process.exit(1);
    }, function(response) {
        console.log(JSON.stringify(response));

        // progress
        switch (response.status) {
        case 'starting':
            conn.sendText(['upload', uploadName, file.length].join(' '));
            break;
        case 'continue':
            conn.sendBinary(file);
            break;
        case 'fatal':
            process.exit(1);
            break;
        case 'ok':
            deferred.resolve(response);
            break;
        }
    });

    conn.on('text', function(data) {
        var json = JSON.parse(data);

        deferred.notify(json);
    });

    return deferred.promise;
};