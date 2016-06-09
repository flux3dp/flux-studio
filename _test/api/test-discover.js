/**
 * Test API `discover`
 * https://github.com/flux3dp/fluxghost/wiki/websocket-discover
 */
var fs = require('fs'),
    bootstrap = require(process.cwd() + '/_test/api/bootstrap'),
    testCases = [],
    startTime,
    timeLimit = 10000,
    necessaryKeys = {
        alive: { type: 'boolean' },
        serial: { type: 'string', format: /^[A-Z0-9]{10}$/ },
        uuid: { type: 'string', format: /^[a-zA-Z0-9]{32}$/ },
        name: { type: 'string', format: /^.{1,}$/ },
        model: { type: 'string', format: /^.{1,}$/ },
        password: { type: 'boolean' },
        head_module: { type: 'string', format: /^(EXTRUDER|LASER|N\/A|OFFLINE)$/ },
        st_id: { type: 'number' }
    },
    keys = Object.keys(necessaryKeys),
    keyChecker = function(val, validator) {
        if (typeof val === validator.type) {
            if ('undefined' !== typeof validator.format) {
                return validator.format.test(val.toString());
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    },
    conn;

testCases.push(new bootstrap.TestCase('discover', timeLimit).
    onProgress(function(response, deferred, conn) {
        if (0 > timeLimit) {
            deferred.resolve(response);
        }

        keys.forEach(function(key) {
            if (false === keyChecker(response[key], necessaryKeys[key])) {
                bootstrap.err('key `' + key + '` does not pass', response);
            }
        });

        timeLimit -= 1000;
    })
);

startTime = new Date();
bootstrap.executeTest('discover should return every necessary fields', 'discover', testCases);