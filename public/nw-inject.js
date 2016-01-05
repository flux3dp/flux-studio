// avoid name conflict
window.requireNode = window.require || function() {};

var fs = requireNode('fs'),
    os = requireNode('os'),
    osType = os.type(),
    spawn = requireNode('child_process').spawn,
    exec = requireNode('child_process').exec,
    cwd = process.cwd(),
    net = requireNode('net'),
    currentPort = 10000,
    maxPort = 65535,
    gui = requireNode('nw.gui'),
    currentWindow = gui.Window.get(),
    ghost,
    appWindow,
    executeGhost = function(port) {
        var slic3rPathIndex = 1,
            args = [
                '--slic3r',
                '',
                '--port',
                port
            ],
            ghostCmd = '';

        if ('Windows_NT' === osType) {
            // TODO: has to assign env root for slic3r
            args[slic3rPathIndex] = cwd + '/lib/Slic3r/slic3r-console.exe';
            ghostCmd = cwd + '/lib/ghost/ghost.exe';
        }
        else if ('Linux' === osType) {
            args[slic3rPathIndex] = cwd + '/lib/Slic3r/bin/slic3r';
            ghostCmd = cwd + '/lib/ghost/ghost';
        }
        else {
            args[slic3rPathIndex] = cwd + '/lib/Slic3r.app/Contents/MacOS/slic3r';
            ghostCmd = cwd + '/lib/ghost/ghost';
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

switch (osType) {
case 'Windows_NT':
    process.env.osType = 'win';
    break;
case 'Linux':
    process.env.osType = 'linux';
    break;
case 'Darwin':
    process.env.osType = 'osx';
    break;
}

switch (os.arch()) {
case 'x64':
    process.env.arch = 'x64';
    break;
case 'ia32':
default:
    process.env.arch = 'x86';
    break;
}

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

delete window.require;