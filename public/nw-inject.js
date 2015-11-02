var gui = require('nw.gui'),
    currentWindow = gui.Window.get(),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    ghost;

fs.chmodSync(process.cwd() + '/ghost/ghost', 0777);

ghost = spawn(process.cwd() + '/ghost/ghost', ['-s', '-d']);

ghost.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
});

ghost.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
});

ghost.on('exit', function (code) {
    console.log('child process exited with code ' + code);
});

currentWindow.on('close', function() {
    // Pretend to be closed already
    this.hide();
    exec('pkill -f ghost', function(error, stdout, stderr) {
        console.log(error, stdout, stderr);
    });
    this.close(true);
});

// avoid name conflict
window.requireNode = window.require || function() {};
delete window.require;