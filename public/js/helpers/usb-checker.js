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
                    if(!usbConnected) {
                        availableUsbChannel = Object.keys(response.h2h)[0];
                        ws.send(`open ${availableUsbChannel}`);
                    }
                }
                else {
                    // if usb is unplugged
                    if(usbConnected) {
                        availableUsbChannel = null;
                        usbConnected = false;
                        callback(-1);
                    }
                    else if(!initialized) {
                        initialized = true;
                        callback(-1);
                    }
                }
            }
            else if(response.cmd === 'open') {
                if(response.status === 'error') {
                    // if port has been opened
                    if(response.error.join('') === 'RESOURCE_BUSY') {
                        usbConnected = true;
                        console.log('usb connected and opened!');
                        callback(availableUsbChannel);
                    }
                    else if(!hasError) {
                        hasError = true;
                    }
                }

                if(response.devopen) {
                    availableUsbChannel = response.devopen;
                    usbConnected = true;
                    initialized = true;
                    callback(availableUsbChannel);
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
