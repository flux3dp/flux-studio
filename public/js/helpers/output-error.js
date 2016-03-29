/**
 * output error log
 */
define([
    'jquery',
    'helpers/i18n',
    'html2canvas',
    'plugins/file-saver/file-saver.min',
    'helpers/ghost-log-reader'
], function(
    $,
    i18n,
    html2canvas,
    fileSaver,
    ghostLogReader
) {
    'use strict';

    window.html2canvas = html2canvas;
    function obfuse(str){
        var output = [],
            c;

        for (var i in str) {
            c = {'f':'x','l':'u','u':'l','x':'f'}[str[i]];
            output.push(c?c:str[i]);
        }

        return output.join('');
    }

    return function() {
        html2canvas(window.document.body).then(function(canvas) {
            var jpegUrl = canvas.toDataURL("image/jpeg"),
                report_info = {
                    ws: window.FLUX.websockets,
                    screenshot: jpegUrl,
                    localStorage: {}
                },
                report_blob;

            for (var key in localStorage) {
                if (false === key.startsWith('lang')) {
                    report_info.localStorage[key] = localStorage[key];
                }
            }

            report_info = JSON.stringify(report_info, null, 2);

            for(var i in window.FLUX.websockets){
                if ("function" !== typeof window.FLUX.websockets[i]){
                    window.FLUX.websockets[i].optimizeLogs();
                }
            }

            if (!window.FLUX.debug) {
                report_info = obfuse(btoa(report_info));
            }

            ghostLogReader().done(function(log) {
                report_blob = new Blob([log, report_info], { type : 'text/html' });
                saveAs(report_blob, 'bugreport_' + Math.floor(Date.now() / 1000) + '.txt');
            });
        });
    };
});