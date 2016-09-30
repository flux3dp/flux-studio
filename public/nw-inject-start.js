// avoid name conflict
window.requireNode = nw.require || function() {};

var process = nw.process,
    fs = requireNode('fs'),
    os = requireNode('os'),
    updater = requireNode('node-webkit-updater'),
    pkg = requireNode('./package.json'), // Insert your app's manifest here
    upd = new updater(pkg),
    path = requireNode('path'),
    nwPath = process.execPath,
    nwDir = path.dirname(nwPath),
    dirParts = nwDir.split(path.sep),
    osType = os.type(),
    spawn = requireNode('child_process').spawn,
    exec = requireNode('child_process').exec,
    cwd = process.cwd(),
    net = requireNode('net'),
    currentPort = 10000,
    maxPort = 65535,
    ghost,
    ghostExecuted = false,
    appWindow,
    executeGhost = function(port, libPath) {
        var slic3rPathIndex = 1,
            curaPathIndex = 5,
            args = [
                '--slic3r',
                '',
                '--port',
                port,
                '--cura',
                ''
            ],
            ghostCmd = '',
            writeLog = function(message, mode) {
                var callback = function(err) {
                    if (err) {
                        console.log('[error] Failed to write log file.');
                    }
                };

                if ('w' === mode) {
                    fs.writeFile('message.log', message, 'utf8', callback);
                }
                else {
                    fs.appendFile('message.log', message, 'utf8', callback);
                }
            },
            recordOutput = function(type, data) {
                str = data.toString();
                console.log(type, str);
                writeLog(str);
                if(str.indexOf('Unhandled exception') >= 0){
                    process.env.processPythonException(str);
                }
                process.env.ghostPort = port;
            };

            process.env.processPythonException = function(str){
                //Note: this function might be replaced from globa.js, in order to interact with react component
                console.log('Unhandled exception occured.', str);
                process.env.ghostPort = port;
            };

        // empty message.log
        writeLog('', 'w');

        if ('Windows_NT' === osType) {
            // TODO: has to assign env root for slic3r
            args[slic3rPathIndex] = libPath + '/lib/Slic3r/slic3r-console.exe';
            args[curaPathIndex] = libPath + '/lib/CuraEngine/CuraEngine.exe';
            ghostCmd = libPath + '/lib/flux_api/flux_api.exe' ;
        }
        else if ('Linux' === osType) {
            args[slic3rPathIndex] = libPath + '/lib/Slic3r/bin/slic3r';
            args[curaPathIndex] = libPath + '/lib/CuraEngine';
            ghostCmd = libPath + '/lib/flux_api/flux_api';
        }
        else {
            args[slic3rPathIndex] = libPath + '/lib/slic3r';
            args[curaPathIndex] = libPath + '/lib/CuraEngine';
            ghostCmd = libPath + '/lib/flux_api/flux_api';
        }

        try {
            fs.chmodSync(args[slic3rPathIndex], 0777);
            fs.chmodSync(args[curaPathIndex], 0777);
            fs.chmodSync(ghostCmd, 0777);
        }
        catch (ex) {
            console.log(ex);
            writeLog(ex.message);
        }

        if (false === ghostExecuted) {
            ghost = spawn(ghostCmd, args);
            ghost.stdout.on('data', recordOutput.bind(null, 'stdout'));
            ghost.stderr.on('data', recordOutput.bind(null, 'stderr'));

            ghostExecuted = true;
        }

        ghost.on('error', function(err) {
            if (err) {
                writeLog(err.message);
            }
        });

        ghost.on('exit', function (code) {
            console.log('child process exited with code ' + code);
            writeLog('FLUX API is closed (' + code + ')');
        });
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
            var seperate_package_path,
                contentPos,
                appRoot;

            switch (osType) {
            case 'Windows_NT':
                appRoot = dirParts.join(path.sep);
                seperate_package_path = appRoot + '/lib/flux_api/flux_api.exe';
                break;
            case 'Linux':
            case 'Darwin':
                contentPos = dirParts.indexOf('Contents');
                contentPos = (-1 < contentPos ? contentPos : dirParts.length);
                appRoot = dirParts.slice(0, contentPos + 1).join(path.sep);
                seperate_package_path = appRoot + '/lib/flux_api/flux_api';
                break;
            }

            fs.stat(seperate_package_path, function(err, stat) {
                if (null === err) {
                    executeGhost(currentPort, appRoot);
                }
                else {
                    executeGhost(currentPort, cwd);
                }
            });
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

delete window.require;

nw.App.checkUpdate = function(cb) {
    cb = cb || function() {};

    return upd.checkNewVersion(function(error, newVersionExists, manifest) {
        cb.apply(null, arguments);
    });
};

nw.App.downloadUpdate = function(manifest, cb, onProgress) {
    cb = cb || function() {};

    return upd.download(function(error, filename) {
        cb.apply(null, arguments);
    }, manifest, onProgress);
};

nw.App.runInstaller = function(filename, manifest, cb) {
    cb = cb || function() {};

    return upd.unpack(filename, function(error, newAppPath) {
        cb.apply(null, arguments);

        if (!error) {
            upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()],{});
            nw.App.quit();
        }
    }, manifest);
};
