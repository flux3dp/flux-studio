'use strict';

const electron = require('electron');
const {app, ipcMain, BrowserWindow} = require('electron');

const BackendManager = require('./src/backend-manager.js');
const MenuManager = require('./src/menu-manager.js');
const UglyNotify = require('./src/ugly-notify.js');
const events = require('./src/ipc-events');

const path = require('path');
const url = require('url');
const fs = require('fs');

let mainWindow;
let menuManager;

global.backend = {alive: false};
global.devices = {};

function createLogFile() {
    let filename = path.join(app.getPath("userData"), "backend.log");
    let f = fs.createWriteStream(filename, {flags: 'w'});
    global.backend.logfile = filename;
    console._stdout = f;
    console._stderr = f;
    return f;
}

var DEBUG = false;
const logger = process.stderr.isTTY ? process.stderr : createLogFile();

if(process.argv.indexOf('--debug') > 0) {
    DEBUG = true;
    console.log("DEBUG Mode");
    // require('electron-reload')(__dirname);
}


function onGhostUp(data) {
    global.backend.alive = true;
    global.backend.port = data.port;
    if(mainWindow) {
        mainWindow.webContents.send(events.BACKEND_UP, global.backend);
    }
}


function onGhostDown() {
    global.backend.alive = false;
    global.backend.port = undefined;
    if(mainWindow) {
        mainWindow.webContents.send('backend-down');
    }
}


function onDeviceUpdated(deviceInfo) {
    let deviceID = `${deviceInfo.source}:${deviceInfo.uuid}`;

    let origDeviceInfo = global.devices[deviceID];
    if(origDeviceInfo && origDeviceInfo.st_id !== null && origDeviceInfo.st_id !== deviceInfo.st_id) {
        switch(deviceInfo.st_id) {
            case 48:
                UglyNotify.send(deviceInfo.name, 'Is paused');
                break;
            case 64:
                UglyNotify.send(deviceInfo.name, 'Is completed!');
                break;
            case 128:
                UglyNotify.send(deviceInfo.name, 'Is aborted');
                break;
        }
    }

    if(mainWindow) {
        mainWindow.webContents.send('device-status', deviceInfo);
    }

    if(deviceInfo.alive) {
        menuManager.updateDevice(deviceInfo.uuid, deviceInfo);
    } else {
        if(global.devices[deviceID]) {
            menuManager.removeDevice(deviceInfo.uuid, global.devices[deviceID]);
            delete global.devices[deviceID]
        }
    }

    global.devices[deviceID] = deviceInfo;
}

require("./src/bootstrap.js");

const backendManager = new BackendManager({
    location: process.env.BACKEND,
    trace_pid: process.pid,
    on_ready: onGhostUp,
    on_device_updated: onDeviceUpdated,
    on_stderr: (data) => logger.write(`${data}`),
    on_stopped: onGhostDown,
    c: console
});
backendManager.start();


function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024, height: 768,
        title: `FLUX Studio - ${app.getVersion()}`,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'main-window-entry.js')
        },
        vibrancy: 'light'});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'public/index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;

        if (process.platform === 'darwin' && DEBUG) {
            console.log("Main window closed.");
        } else {
            app.quit();
        }
    });

    mainWindow.on('page-title-updated', function(event) {
        event.preventDefault();
    });

    menuManager.on("DEBUG-RELOAD", () => {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'public/index.html'),
            protocol: 'file:',
            slashes: true,
        }));
    });

    menuManager.on("DEBUG-INSPECT", () => {
        mainWindow.webContents.openDevTools();
    });
    ipcMain.on("DEBUG-INSPECT", () => {
        mainWindow.webContents.openDevTools();
    });
    if(process.defaultApp || DEBUG) {
        mainWindow.webContents.openDevTools();
    }
}

ipcMain.on(events.CHECK_BACKEND_STATUS, () => {
    if(mainWindow) {
        mainWindow.send(events.NOTIFY_BACKEND_STATUS, {
            backend: global.backend,
            devices: global.devices
        });
    } else {
        console.error('Recv async-status request but main window not exist');
    }
});

app.on('ready', () => {
    app.makeSingleInstance((commandLine, workingDirectory) => {
        if(mainWindow === null) {
            createWindow();
        } else {
            mainWindow.focus();
        }
    });

    menuManager = new MenuManager();
    menuManager.on(events.MENU_CLICK, (data) => {
        if(mainWindow) {
            mainWindow.webContents.send(events.MENU_CLICK, data);
        } else {
            console.log('Menu event triggered but window does not exist.');
        }
    });
    createWindow();
});


// app.on('window-all-closed', function () {
// });


app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
});

app.on('before-quit', function() {
    backendManager.stop();
});
