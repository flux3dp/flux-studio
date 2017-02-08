define([
    'helpers/websocket'
], function(
    Websocket
) {
    let initialized = false,
        usbConnected = false,
        hasError = false,
        availableUsbChannel,
        interval = 2000;

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
                        callback(availableUsbChannel);
                    }
                    else if(!hasError) {
                        hasError = true;
                    }
                }

                if(response.devopen) {
                    availableUsbChannel = response.devopen;
                    usbConnected = true;
                    initialize = true;
                    callback(availableUsbChannel);
                }
            }
        };

        let ws = new Websocket({
            method: 'usb/interfaces',
            onMessage: processResult,
            onError: processResult,
            onFatal: processResult
        });

        ws.send('list');
        setInterval(() => { ws.send('list'); }, interval);
    };
});
