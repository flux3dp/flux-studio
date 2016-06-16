/*
 * Test API scan-modeling
 * https://github.com/flux3dp/fluxghost/wiki/websocket-3dscan-modeling
 */
var fs = require('fs'),
    bootstrap = require(process.cwd() + '/_test/api/bootstrap'),
    left = 1474,
    right = 0,
    uploadName = 'test',
    testCases = [],
    file,
    dumpPointCloud,
    conn;

testCases.push(new bootstrap.TestCase('import pcd file').
    onStarting(function(deferred, conn) {
        fs.readFile(process.cwd() + '/_test/api/assets/pcd-for-test.pcd', function(err, data) {
            file = data;
            deferred.notify({ status: 'starting' });
        });
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'starting':
            conn.sendText(['import_file', uploadName, 'pcd', file.length].join(' '));
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

testCases.push(new bootstrap.TestCase('cut point cloud').
    onStarting(function(deferred, conn) {
        conn.sendText(['cut', uploadName, 'test1', 'r >= 50'].join(' '));
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

testCases.push(new bootstrap.TestCase('delete noise from point cloud').
    onStarting(function(deferred, conn) {
        conn.sendText(['delete_noise', uploadName, 'test2 0.3'].join(' '));
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

testCases.push(new bootstrap.TestCase('apply point cloud').
    onStarting(function(deferred, conn) {
        conn.sendText(['apply_transform', uploadName, '0 0 0 10 10 10 test3'].join(' '));
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

testCases.push(new bootstrap.TestCase('merge 2 point cloud').
    onStarting(function(deferred, conn) {
        conn.sendText('merge test1 test2 test4');
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

testCases.push(new bootstrap.TestCase('dump point cloud').
    onStarting(function(deferred, conn) {
        conn.sendText('dump ' + uploadName);
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'ok':
        case 'continue':
            // do nothing
            break;
        case 'progressing':
            dumpPointCloud = response.buffer;
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

testCases.push(new bootstrap.TestCase('export point cloud').
    onStarting(function(deferred, conn) {
        conn.sendText('export test4 stl');
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'ok':
            deferred.resolve(response);
            break;
        case 'continue':
            // do nothing
            break;
        case 'fatal':
        case 'error':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('upload pcd file').
    onStarting(function(deferred, conn) {
        conn.sendText(['upload test5', left].join(' '));
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'continue':
            conn.sendBinary(dumpPointCloud);
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

bootstrap.executeTest('Scan Modeling', '3d-scan-modeling', testCases);