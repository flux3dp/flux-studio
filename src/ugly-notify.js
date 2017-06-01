// ref to https://github.com/electron/electron/issues/3359
// use a hidden window to send notify now
//
// working with public/ugly_notify.html

// const electron = require('electron');
const { BrowserWindow, ipcMain, app } = require('electron');
const events = require('./ipc-events');
// const BrowserWindow = electron.BrowserWindow;
// const {ipcMain} = require('electron');
// const app = electron.app

const path = require('path')
const url = require('url')


class _UglyNotify {
    constructor() {
        app.on('ready', () => {
            this._win = new BrowserWindow({width: 400, height: 300, show: false});
            this._win.loadURL(url.format({
                pathname: path.join(__dirname, '../public/ugly_notify.html'),
                protocol: 'file:',
                slashes: true,
            }));
        });
    }
    send(title, body) {
        if(this._win) {
            this._win.webContents.send(events.NOTIFY_MACHINE_STATUS, JSON.stringify({
              'title': title,
              'body': body
            }));
        }
    }
}


module.exports = new _UglyNotify();
