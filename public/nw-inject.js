var fs = require('fs'),
    os = require('os'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    cwd = process.cwd(),
    net = require('net'),
    currentPort = 8000,
    maxPort = 65535,
    gui = require('nw.gui'),
    currentWindow = gui.Window.get(),
    ghost,
    appWindow,
    executeGhost = function(port) {
        var slic3rPathIndex = 2,
            args = [
                '-s',
                '--slic3r',
                '',
                '--port',
                port,
                '--assets',
                cwd + 'lib/ghost/assets'
            ],
            ghostCmd = '';

        if ('Windows_NT' === os.type()) {
            // TODO: has to assign env root for slic3r
            args[slic3rPathIndex] = cwd + '/lib/Slic3r.app/Contents/MacOS/slic3r';
            ghostCmd = cwd + '/lib/ghost/ghost/ghost.exe';
        }
        else {
            args[slic3rPathIndex] = cwd + '/lib/Slic3r.app/Contents/MacOS/slic3r';
            ghostCmd = cwd + '/lib/ghost/ghost/ghost';
        }

        fs.chmodSync(ghostCmd, 0777);
        ghost = spawn(ghostCmd, args);

        ghost.stdout.on('data', function(data) {
            console.log('stdout: ' + data);
        });

        ghost.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        ghost.on('exit', function (code) {
            console.log('child process exited with code ' + code);
        });

        process.env.ghostPort = port;
    },
    probe = function(port, callback) {
        var socket = new net.Socket(),
            portAvailable = true;

        socket.connect(port, '127.0.0.1', function() {
            portAvailable = false;

            socket.end(function() {
                callback(portAvailable);
            });
        });

        socket.on('error', function() {
            callback(portAvailable);
        });
    },
    findPort = function(result) {
        if (true === result) {
            executeGhost(currentPort);
        }
        else if (currentPort < maxPort) {
            currentPort++;
            probe(currentPort, findPort);
        }
        else {
            // stop trying and response error
        }
    };

// find port
probe(currentPort, findPort);

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