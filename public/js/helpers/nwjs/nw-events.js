/**
 * nwjs events
 */
define(['jquery', 'helpers/i18n'], function($, i18n) {
    'use strict';

    var win = nw.Window.get(),
        lang = i18n.get();

    window.FLUX.close = function() {
        var exec = requireNode('child_process').exec,
            $deferred = $.Deferred(),
            killCommmand;

        switch (window.FLUX.osType) {
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
            if (error) {
                $deferred.fail();
            }
            else {
                $deferred.resolve();
            }
        });

        return $deferred.promise();
    };

    if (true === window.FLUX.isNW) {
        win.title = 'FLUX Studio - {Version}';

        win.on('close', function() {
            if (true === window.confirm(lang.topmenu.sure_to_quit)) {
                window.FLUX.close().always(function() {
                    win.close(true);
                });
            }
        });
    }
});