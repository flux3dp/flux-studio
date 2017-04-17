/**
 * output error log
 */
define([
    'jquery',
    'helpers/i18n',
    'html2canvas',
    'helpers/ghost-log-reader',
    'helpers/logger'
], function(
    $,
    i18n,
    html2canvas,
    ghostLogReader,
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

            for (var key in localStorage) {
                if (false === key.startsWith('lang')) {
                    report_info.localStorage[key] = localStorage[key];
                }
            }

            report_info = JSON.stringify(report_info, null, 2);

            if (!window.FLUX.debug) {
                report_info = obfuse(btoa(report_info));
            }

            ghostLogReader().done(function(log) {
                let header = '';
                if(typeof os === 'undefined') {
                    header = `FS: ${window.FLUX.version}\nOS: NA\nARCH: NA\nRELEASE: NA\n`;
                }
                else {
                    header = `OS: ${os.type()}\nARCH: ${os.arch()}\nRELEASE: ${os.release()}\n`;
                }
                header += `USER-AGENT: ${navigator.userAgent}\n\n`;

                report_blob = new Blob([header, log, report_info], { type : 'text/html' });
                saveAs(report_blob, 'bugreport_' + Math.floor(Date.now() / 1000) + '.txt');
            });

            $deferred.resolve();
        });

        return $deferred.promise();
    };
});
