
const path = require('path');

const {ipcRenderer, webFrame} = require('electron');
const events = require(path.join(__dirname, 'ipc-events'));


global.electron = {
    ipc: ipcRenderer,
    events: events,
    trigger_file_input_click: (inputId) => {
        if(inputId.match(/^[a-zA-Z0-9\-\_]+$/)) {
            webFrame.executeJavaScript(`document.getElementById("${inputId}").click()`, true);
        }
    } 
}
