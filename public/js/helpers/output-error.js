/**
 * output error log
 */
define([
    'jquery',
    'helpers/i18n',
    'html2canvas',
    'helpers/logger'
], function(
    $,
    i18n,
    html2canvas,
    Logger
) {
    'use strict';

    function obfuse(str){
        var output = [],
            c;

        for (var i in str) {
            if (true === str.hasProperty(i)) {
                c = {'f':'x','l':'u','u':'l','x':'f'}[str[i]];
                output.push(c?c:str[i]);
            }
        }

        return output.join('');
    }

    return function() {
        var $deferred = $.Deferred();

        html2canvas(window.document.body).then(function(canvas) {
            var jpegUrl = canvas.toDataURL('image/jpeg'),
                _logger = new Logger('websocket'),
                allLog = _logger.getAll(),
                report_info = {
                    ws: allLog.websocket || '',
                    discoverDeviceList: allLog.discover || '',
                    localStorage: {},
                    general: allLog.generic || '',
                },
                report_blob;

            allLog = null;

            var output = [];

            if(electron) {
                let os = require("os");
                output.push('======::os::======\n')
                output.push(`OS: ${os.type()}\nARCH: ${os.arch()}\nRELEASE: ${os.release()}\n`);
                output.push(`USER-AGENT: ${navigator.userAgent}\n`);
            }

            output.push('\n\n======::devices::======\n');
            output.push(JSON.stringify(report_info.discoverDeviceList, null, 2))

            if(FLUX.logfile) {
                let fs = require("fs");
                try {
                    let buf = fs.readFileSync(FLUX.logfile, {encoding: "utf8"})
                    output.push('\n\n======::backend::======\n');
                    output.push(buf)
                } catch(err) {
                    output.push('\n\n======::backend::======\n');
                    output.push(`Open backend log failed: ${err}\n`);
                }
            } else {
                output.push('\n\n======::backend::======\nNot available\n');
            }

            output.push('\n\n======::ws::======\n');
            output.push(JSON.stringify(report_info.ws, null, 2))

            output.push('\n\n======::storage::======\n');

            for(let key in localStorage) {
                let value = localStorage[key];
                if(value.startsWith("-----BEGIN RSA PRIVATE KEY-----\n")) {
                    value = "[hidden]";
                }
                output.push(`${key}=${value}\n\n`);
            }

            output.push('\n\n======::generic::======\n');
            output.push(JSON.stringify(report_info.generic, null, 2))

            report_blob = new Blob(output, {type: 'text/html'});
            saveAs(report_blob, 'bugreport_' + Math.floor(Date.now() / 1000) + '.txt');

            $deferred.resolve();
        });

        return $deferred.promise();
    };
});
