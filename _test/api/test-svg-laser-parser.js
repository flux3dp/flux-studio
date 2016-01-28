var ws = require("nodejs-websocket"),
    fs = require('fs'),
    Q = require('q'),
    uploadName = 'test',
    upload,
    getSVG,
    compute,
    setParams,
    metaOption,
    getTaskCode,
    conn;

console.log('#####\tTEST SVG LASER PARSER');

conn = ws.connect('ws://127.0.0.1:10000/ws/svg-laser-parser', function() {
    var methods = [upload, getSVG],
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

    console.log('###\tUPLOAD SVG FILE');

    (function() {
        fs.readFile(process.cwd() + '/_test/api/assets/circle-test.svg', function(err, data) {
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

getSVG = function() {
    var deferred = Q.defer(),
        buffer = new Buffer(0),
        length = 0;

    console.log('###\tGET POST-PROCESSING SVG FILE');

    (function() {
        conn.sendText(['get', uploadName].join(' '));

        return deferred.promise;
    }()).then(null, function() {
        // fail
        console.log('fail', arguments);
        process.exit(1);
    }, function(response) {
        console.log(JSON.stringify(response));

        // progress
        switch (response.status) {
        case 'continue':
            length = response.length;
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

    conn.on('binary', function(inStream) {
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

    return deferred.promise;
};