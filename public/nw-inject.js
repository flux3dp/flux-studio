var gui = require('nw.gui'),
    currentWindow = gui.Window.get(),
    fs = require('fs'),
    os = require('os'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    cwd = process.cwd(),
    ghost;

console.log(process);
if ('Windows_NT' === os.type()) {
    fs.chmodSync(cwd + '/lib/ghost/ghost/ghost.exe', 0777);
    ghost = spawn(cwd + '/lib/ghost/ghost/ghost.exe', ['-s']);
    // TODO: has to assign env root for slic3r
}
else {
    fs.chmodSync(cwd + '/lib/ghost/ghost/ghost', 0777);
    ghost = spawn(cwd + '/lib/ghost/ghost/ghost', ['-s', '--slic3r', cwd + '/lib/Slic3r.app/Contents/MacOS/slic3r']);
}

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