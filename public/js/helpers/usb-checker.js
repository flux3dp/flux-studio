define([
    'helpers/websocket'
], function(
    Websocket
) {
    let channels = {},
        interval = 3000,
        ws;

    // callback should receive opened usb channel, -1 if not available
    return function(callback) {

        let channelToOpen,
            notifyChange = false;

        const manageChannel = (availableChannels) => {
            let _channels = {};

            Object.keys(availableChannels).forEach(c => {
                if(Object.keys(channels).indexOf(c) >= 0) {
                    _channels[c] = channels[c];
                } else {
                    _channels[c] = availableChannels[c];
                    _channels[c].connected = true;
                }
                if (!availableChannels[c]) {
                    _channels[c] = {
                      connected: false
                    };
                }
            });

            if(Object.keys(channels).length !== Object.keys(_channels).length) {
                notifyChange = true;
            }
            channels = _channels;
        };

        const nextUnopenedChannel = () => {
            let _channel = '';
            Object.keys(channels).forEach(c => {
                if(!channels[c].connected && !channels[c].hasError) {
                    _channel = c;
                }
            });

            return _channel;
        };

        const processResult = (response) => {
            if(response.cmd === 'list') {
                // record new channels, remove unavailable channels
                manageChannel(response.h2h);

                if(Object.keys(response.h2h).length > 0) {
                    channelToOpen = nextUnopenedChannel();
                    if(channelToOpen !== '') {
                      clearInterval(this.t);
                      setTimeout(() => {
                        ws.send(`open ${channelToOpen}`);
                        this.t = setInterval(() => { ws.send('list'); }, interval);
                      }, interval);
                    }
                }

            } else if(response.cmd === 'open') {
                if(response.status === 'error') {
                    // if port has been opened
                    let error = response.error.join('');
                    console.log('error', error);

                    if(error === 'RESOURCE_BUSY') { // weird logic. need to fix
                        console.log('usb connected and opened!');
                        notifyChange = true;
                        channels[channelToOpen].connected = false;

                    } else if (error === 'TIMEOUT') {
                        console.log('usb connect timeout!');
                        notifyChange = true;
                        channels[channelToOpen].connected = false;
                    }
                }

                if(response.devopen) {
                    channels[response.devopen].connected = true;
                    channels[response.devopen].profile = response.profile;
                    channels[response.devopen].profile.source = 'h2h';
                    channels[response.devopen].profile.addr = response.devopen;
                    notifyChange = true;
                }

                channelToOpen = nextUnopenedChannel();
                if(channelToOpen !== '') {
                    ws.send(`open ${channelToOpen}`);
                }
            }

            if(notifyChange) {
               notifyChange = false;
               console.log('Change ', response, channels);
               callback(channels);
            }
        };

        if(!ws) {
            ws = new Websocket({
                method: 'usb/interfaces',
                onMessage: processResult,
                onError: () => {},
                onFatal: () => {console.log('usb checker onFatal')}
            });
        }

        clearInterval(this.t);
        //immediately require of 'list' command when FS start.
        ws.send('list');
        this.t = setInterval(() => { ws.send('list'); }, interval);
    };
});
