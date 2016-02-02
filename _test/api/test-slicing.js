var ws = require("nodejs-websocket"),
    fs = require('fs'),
    Q = require('q'),
    bootstrap = require(process.cwd() + '/_test/api/bootstrap'),
    uploadName = 'test',
    testCases = [],
    conn;

testCases.push(new bootstrap.TestCase('upload stl file').
    onStarting(function(deferred, conn) {
        fs.readFile(process.cwd() + '/_test/api/assets/guide-example.stl', function(err, data) {
            file = data;
            deferred.notify({ status: 'starting' });
        });
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'starting':
            conn.sendText(['upload', uploadName, file.length].join(' '));
            break;
        case 'continue':
            conn.sendBinary(file);
            break;
        case 'ok':
            deferred.resolve(response);
            break;
        case 'fatal':
        case 'error':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('duplicate stl file').
    onStarting(function(deferred, conn) {
        conn.sendText(['duplicate', uploadName, 'test1'].join(' '));
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'ok':
            deferred.resolve(response);
            break;
        case 'fatal':
        case 'error':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('set stl file').
    onStarting(function(deferred, conn) {
        conn.sendText([
            'set',
            uploadName,
            // position (x, y, z)
            0, 0, 47.981412844073475,
            // rotation (x, y, z)
            0, 0, 0,
            // scale (x, y, z)
            3.1483866030745835, 3.1483866030745835, 3.1483866030745835
        ].join(' '));

    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'ok':
            deferred.resolve(response);
            break;
        case 'fatal':
        case 'error':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('delete existing stl file').
    onStarting(function(deferred, conn) {
        conn.sendText([
            'delete',
            'test1'
        ].join(' '));
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'ok':
            deferred.resolve(response);
            break;
        case 'fatal':
        case 'error':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('upload preview').
    onStarting(function(deferred, conn) {
        fs.readFile(process.cwd() + '/_test/api/assets/guide-example-preview.png', function(err, data) {
            file = data;
            deferred.notify({ status: 'starting' });
        });
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'starting':
            conn.sendText([
                'upload_image',
                file.length
            ].join(' '));
            break;
        case 'continue':
            conn.sendBinary(file);
            break;
        case 'ok':
            deferred.resolve(response);
            break;
        case 'fatal':
        case 'error':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('slice existing stl').
    onStarting(function(deferred, conn) {
        conn.sendText([
            'begin_slicing',
            uploadName,
            'f'
        ].join(' '));
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'ok':
            deferred.resolve(response);
            break;
        case 'error':
            deferred.resolve(response);
            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

bootstrap.executeTest('slicing', '3dprint-slicing', testCases);