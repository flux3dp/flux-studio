
const electron = require('electron');
const {ipcMain} = require('electron');

const BackendManager = require('./src/backend_manager.js').BackendManager;
const MenuManager = require('./src/menu_manager.js').MenuManager;
const UglyNotify = require('./src/ugly_notify.js').UglyNotify;

const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')


let mainWindow;
let menuManager;

global.backend = {alive: false};
global.devices = {};


function onGhostUp(data) {
    global.backend = {alive: true, port: data.port};
    if(mainWindow) {
        mainWindow.webContents.send("backend-up", {port: data.port});
    }
}


function onGhostDown() {
    global.backend = {alive: false};
    if(mainWindow) {
        mainWindow.webContents.send("backend-down");
    }
}


function onDeviceUpdated(deviceInfo) {
    let origDeviceInfo = global.devices[deviceInfo.uuid];
    if(origDeviceInfo && origDeviceInfo.st_id !== null && origDeviceInfo.st_id !== deviceInfo.st_id) {
        switch(deviceInfo.st_id) {
            case 48:
                UglyNotify.send(deviceInfo.name, "Is paused");
                break;
            case 64:
                UglyNotify.send(deviceInfo.name, "Is completed!");
                break;
            case 128:
                UglyNotify.send(deviceInfo.name, "Is aborted");
                break;
        }
    }

    if(mainWindow) {
        mainWindow.webContents.send("device-status", deviceInfo);
    }

    if(global.devices[deviceInfo.uuid]) {
        menuManager.updateDevice(deviceInfo.uuid, deviceInfo);
    } else {
        menuManager.appendDevice(deviceInfo.uuid, deviceInfo);
    }

    global.devices[deviceInfo.uuid] = deviceInfo;
}

const resourcesRoot = defaultApp ? "." : process.resourcesPath;
process.env.GHOST_SLIC3R = process.env.GHOST_SLIC3R || path.join(resourcesRoot, "backend", "slic3r")
process.env.GHOST_CURA = process.env.GHOST_CURA || path.join(resourcesRoot, "backend", "CuraEngine")
process.env.GHOST_CURA2 = process.env.GHOST_CURA || path.join(resourcesRoot, "backend", "CuraEngine2")

const backendManager = new BackendManager({
    location: process.env.BACKEND || path.join(resourcesRoot, "backend", "flux_api", "flux_api"),
    trace_pid: process.pid,
    on_ready: onGhostUp,
    on_device_updated: onDeviceUpdated,
    on_stderr: (data) => { console.log(`${data}`.trim()); },
    on_stopped: onGhostDown
});
backendManager.start();


function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1024, height: 768, vibrancy: "light"});

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'public/index.html'),
        protocol: 'file:',
        slashes: true,
    }))

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    mainWindow.webContents.openDevTools();
}

ipcMain.on("sync-status", () => {
    if(mainWindow) {
        mainWindow.send("flush-status", {
            backend: global.backend,
            devices: global.devices
        });
    } else {
        console.error("Recv async-status request but main window not exist");
    }
});

ipcMain.on("open-devtool", () => { mainWindow.webContents.openDevTools(); });
ipcMain.on("discover-poke", (ipaddr) => { backendManager.poke(ipaddr) });

app.on('ready', () => {
    if(process.argv.indexOf("--debug") > 0) {
        require('electron-reload')(__dirname);
    }

    menuManager = new MenuManager();
    menuManager.on("trigger", (data) => {
        if(mainWindow) {
            mainWindow.webContents.send("menu-trigger", data);
        } else {
            console.log("Menu event triggered but window does not exist.")
        }
    });
    createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
})

app.on('before-quit', function() {
    backendManager.stop();
})
