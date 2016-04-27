/**
 * nwjs events
 */
define(['helpers/i18n'], function(i18n) {
    'use strict';

    if (true === window.FLUX.isNW) {
        var win = nw.Window.get(),
            lang = i18n.get(),
            exec = requireNode('child_process').exec,
            killCommmand;

        win.title = 'FLUX Studio - {Version}';

        win.on('close', function() {
            if (true === window.confirm(lang.topmenu.sure_to_quit)) {
                switch (window.FLUX.os) {
                case 'osx':
                case 'linux':
                    killCommmand = 'pkill -f flux_api';
                    break;
                case 'win':
                    killCommmand = 'taskkill /F /FI "IMAGENAME eq flux_api.exe*"';
                    break;
                }

                exec(killCommmand, function(error, stdout, stderr) {
                    console.log(error, stdout, stderr);
                });
                win.close(true);
            }
        });
    }
});