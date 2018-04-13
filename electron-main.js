const {app, ipcMain, BrowserWindow} = require('electron');
app.commandLine.appendSwitch('ignore-gpu-blacklist');

const BackendManager = require('./src/backend-manager.js');
const MenuManager = require('./src/menu-manager.js');
const UglyNotify = require('./src/ugly-notify.js');
const events = require('./src/ipc-events');

const TTC2TTF = require('./src/ttc2ttf.js');

const FontManager = require('font-manager');
const TextToSVG = require('text-to-svg');

const path = require('path');
const url = require('url');
const fs = require('fs');
const os = require('os');

let mainWindow;
let menuManager;

global.backend = {alive: false};
global.devices = {};

function createLogFile() {
    var storageDir = app.getPath('userData');

    function chkDir(target) {
        if (fs.existsSync(target)) {
            return;
        } else {
            chkDir(path.dirname(target));
            fs.mkdirSync(target);
        }

    }
    chkDir(storageDir);

    let filename = path.join(app.getPath('userData'), 'backend.log');
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
    console.log('DEBUG Mode');
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
            delete global.devices[deviceID];
        }
    }

    global.devices[deviceID] = deviceInfo;
}

require('./src/bootstrap.js');

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

    mainWindow.maximize();

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'public/index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;

        if (process.platform === 'darwin' && DEBUG) {
            console.log('Main window closed.');
        } else {
            app.quit();
        }
    });

    mainWindow.on('page-title-updated', function(event) {
        event.preventDefault();
    });

    menuManager.on('DEBUG-RELOAD', () => {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'public/index.html'),
            protocol: 'file:',
            slashes: true,
        }));
    });

    menuManager.on('DEBUG-INSPECT', () => {
        mainWindow.webContents.openDevTools();
    });
    ipcMain.on('DEBUG-INSPECT', () => {
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

ipcMain.on(events.GET_AVAILABLE_FONTS , (event, arg) => {
    const fonts = FontManager.getAvailableFontsSync();
    event.returnValue = fonts;
});

ipcMain.on(events.FIND_FONTS , (event, arg) => {
    // FontManager.findFontsSync({ family: 'Arial' });
    const fonts = FontManager.findFontsSync(arg);
    event.returnValue = fonts;
});

ipcMain.on(events.FIND_FONT , (event, arg) => {
    // FontManager.findFontSync({ family: 'Arial', weight: 700 })
    const font = FontManager.findFontSync(arg);
    event.returnValue = font;
});

ipcMain.on(events.REQUEST_PATH_D_OF_TEXT , async (event, {text, x, y, fontFamily, fontSize, fontStyle, letterSpacing, key}) => {

    const substitutedFamily = (function(){

        //if only contain basic character (123abc!@#$...), don't substitute.
        //because my Mac cannot substituteFont properly handing font like 'Windings'
        //but we have to subsittue text if text contain both English and Chinese
        const textOnlyContainBasicLatin = Array.from(text).every(char => {
            return char.charCodeAt(0) <= 0x007F;
        });
        if (textOnlyContainBasicLatin) {
            return fontFamily;
        }

        const originFont = FontManager.findFontSync({
            family: fontFamily,
            style: fontStyle
        });

        // array of used family which are in the text
        const familyList = (function(){
            const originPostscriptName = originFont.postscriptName;
            const list = Array.from(text).map(char =>
                FontManager.substituteFontSync(originPostscriptName, char).family
            );
            // make unique
            return [...new Set(list)];
        })();

        if (familyList.length === 1) {
            return familyList[0];
        } else if (familyList.length === 2) {
            // consider mixing Chinese with English. For example: '甲乙丙ABC' with font Arial.
            // we choose to use Chinese font instead of English font, which make English characters differ form what it should be.
            // This is not the best solution, just a quick fix.
            return (familyList.filter(family => family !== fontFamily))[0];
        } else {
            console.log('Unexpected case in convert text to path: text contain more than 2 font-family!');
            return familyList[0];
        }
    })();

    const font = FontManager.findFontSync({
        family: substitutedFamily,
        style: fontStyle
    });
    let fontPath = font.path;

    if(fontPath.toLowerCase().endsWith('.ttc') || fontPath.toLowerCase().endsWith('.ttcf')) {
        fontPath = await TTC2TTF(fontPath, font.postscriptName);
    }
    const pathD = TextToSVG.loadSync(fontPath).getD(text, {
        fontSize: Number(fontSize),
        anchor: 'left baseline',
        x: x,
        y: y,
        letterSpacing: letterSpacing
    });

    event.sender.send(events.RESOLVE_PATH_D_OF_TEXT + key, pathD);
});

console.log("Running FLUX Studio on ", os.arch());

if  (os.arch() == 'ia32' || os.arch() == 'x32') {
    app.commandLine.appendSwitch('js-flags', '--max-old-space-size=2048');
} else {
    app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
}

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
