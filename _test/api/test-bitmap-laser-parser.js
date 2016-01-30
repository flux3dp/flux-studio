var fs = require('fs'),
    bootstrap = require(process.cwd() + '/_test/api/bootstrap'),
    testCases = [],
    params = [
        { name: 'object_height', value: 10 },
        { name:'laser_speed', value: 20 },
        { name:'power', value: 1 },
        { name:'shading', value: 1 }
    ],
    bitmapFile,
    conn;

testCases.push(new bootstrap.TestCase('clear uploaded bitmap file', 60000).
    onStarting(function(deferred, conn) {
        conn.sendText('clear_imgs');
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'ok':
            deferred.resolve(response);
            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('upload bitmap file', 60000).
    onStarting(function(deferred, conn) {
        var size = {
                width: 640,
                height: 640
            },
            thumbnailImageCapacity = size.width * size.height;

        bitmapFile = [];

        for (var i = 0; i < thumbnailImageCapacity; i++) {
            bitmapFile[i] = 255;
        }

        bitmapFile = new Buffer(bitmapFile);

        conn.sendText([
            'upload',
            // size in px
            size.width,
            size.height,
            // position (top left)
            -50,
            -50,
            // position (bottom right)
            50,
            50,
            // rotation
            0,
            // threshold
            128
        ].join(' '));
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'continue':
            conn.sendBinary(bitmapFile);
            break;
        case 'accept':
            deferred.resolve(response);
            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('set params', 60000).
    onStarting(function(deferred, conn) {
        setTimeout(function() {
            deferred.notify({ status: 'starting' });
        }, 0);
    }).
    onProgress(function(response, deferred, conn) {
        var nextParam;

        // progress
        switch (response.status) {
        case 'starting':
        case 'ok':
            nextParam = params.pop();

            if ('undefined' === typeof nextParam) {
                deferred.resolve(response);
            }
            else {
                conn.sendText(['set_params', nextParam.name, nextParam.value].join(' '));
            }

            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('get gcode', 60000).
    onStarting(function(deferred, conn) {
        conn.sendText(['go', '-g'].join(' '));
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'computing':
            // ignore
            break;
        case 'complete':
            deferred.resolve(response);
            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('get fcode', 60000).
    onStarting(function(deferred, conn) {
        conn.sendText(['go', '-f'].join(' '));
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'computing':
            // ignore
            break;
        case 'complete':
            deferred.resolve(response);
            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

bootstrap.executeTest('bitmap laser parser', 'bitmap-laser-parser', testCases);