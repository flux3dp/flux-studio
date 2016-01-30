var fs = require('fs'),
    bootstrap = require(process.cwd() + '/_test/api/bootstrap'),
    uploadName = 'test',
    testCases = [],
    params = [
        { name: 'object_height', value: 10 },
        { name:'laser_speed', value: 20 },
        { name:'power', value: 1 }
    ],
    width,
    height,
    svgFile,
    bitmapFile,
    conn;

testCases.push(new bootstrap.TestCase('upload svg file').
    onStarting(function(deferred, conn) {
        fs.readFile(process.cwd() + '/_test/api/assets/circle-test.svg', function(err, data) {
            svgFile = data;
            deferred.notify({ status: 'starting' });
        });
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'starting':
            conn.sendText(['upload', uploadName, svgFile.length].join(' '));
            break;
        case 'continue':
            conn.sendBinary(svgFile);
            break;
        case 'fatal':
            console.error(new Error(JSON.stringify(response)));
            break;
        case 'ok':
            deferred.resolve(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('get post-processing svg file').
    onStarting(function(deferred, conn) {
        conn.sendText(['get', uploadName].join(' '));
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'continue':
            width = response.width;
            height = response.height;
            break;
        case 'progressing':
            // ignore
            break;
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

testCases.push(new bootstrap.TestCase('compute svg file', 60000).
    onStarting(function(deferred, conn) {
        fs.readFile(process.cwd() + '/_test/api/assets/circle-test.svg', function(err, data) {
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
                'compute',
                uploadName,
                // size in real world
                100,
                100,
                // position (top left)
                -50,
                -50,
                // position (bottom right)
                50,
                50,
                // rotation
                0,
                svgFile.length,
                size.width,
                size.height
            ].join(' '));
        });
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'continue':
            conn.sendBinary(svgFile);
            conn.sendBinary(bitmapFile);
            break;
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
        conn.sendText(['go', uploadName, '-g'].join(' '));
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
        conn.sendText(['go', uploadName, '-f'].join(' '));
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

bootstrap.executeTest('svg laser parser', 'svg-laser-parser', testCases);