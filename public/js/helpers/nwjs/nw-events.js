/**
 * nwjs events
 */
define(['helpers/i18n'], function(i18n) {
    if (true === window.FLUX.isNW) {
        var win = nw.Window.get(),
            lang = i18n.get(),
            exec = requireNode('child_process').exec;

        win.title = 'FLUX Studio';

        win.on('close', function() {
            if (true === window.confirm(lang.topmenu.sure_to_quit)) {
                exec('pkill -f flux_api', function(error, stdout, stderr) {
                    console.log(error, stdout, stderr);
                });
                win.close(true);
            }
        });
    }
});