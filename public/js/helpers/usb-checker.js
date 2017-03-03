define([
    'helpers/websocket'
], function(
    Websocket
) {
    let initialized = false,
        usbConnected = false,
        hasError = false,
        availableUsbChannel,
        interval = 3000,
        ws;

    // callback should receive opened usb channel, -1 if not available
    return function(callback) {

        const processResult = (response) => {
            if(response.cmd === 'list') {
                let hasAvailableChannel = Object.keys(response.h2h) > 0;

                if(hasAvailableChannel) {
                    // try to connect
                    availableUsbChannel = Object.keys(response.h2h)[0];

                    if (!response.h2h[availableUsbChannel]) {
                        // Channel not connected
                        usbConnected = false;
                        ws.send(`open ${availableUsbChannel}`);
                    } else {
                        // Connected, do nothing
                        usbConnected = true;
                    }
                
                }
                else {
                    // if usb is unplugged
                    if(usbConnected) {
                        availableUsbChannel = null;
                        usbConnected = false;
                        callback(-1, hasError);
                    }
                    else if(!initialized) {
                        initialized = true;
                        callback(-1, hasError);
                    }
                }
            }
            else if(response.cmd === 'open') {
                if(response.status === 'error') {
                    // if port has been opened
                    let error = response.error.join('');
                    if(error === 'RESOURCE_BUSY') { // weird logic. need to fix
                        usbConnected = true;
                        console.log('usb connected and opened!');
                        hasError = false;
                        callback(availableUsbChannel, false);
                    } else {
                        hasError = true;
                    }
                }

                if(response.devopen) {
                    availableUsbChannel = response.devopen;
                    usbConnected = true;
                    initialized = true;
                    hasError = false;
                    callback(availableUsbChannel, false);
                }
            }
        };

        if(!ws) {
            ws = new Websocket({
                method: 'usb/interfaces',
                onMessage: processResult,
                onError: processResult,
                onFatal: processResult
            });
        }

        clearInterval(this.t);
        ws.send('list');
        this.t = setInterval(() => { ws.send('list'); }, interval);
    };
});
