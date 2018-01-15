define([
    'helpers/websocket'
], function(
    Websocket
) {
    let CHANNELS = {},
        TEST,
        interval = 3000,
        WS;

    // callback should receive opened usb channel, -1 if not available
    return function(callback) {

        let channelToOpen,
            notifyChange = false;

        const manageChannel = (availableChannels) => {
            let _channels = {};
            const channelHasChanged = Object.keys(CHANNELS).length !== Object.keys(_channels).length;
            const knownChannel = (c) => {
              return Object.keys(CHANNELS).indexOf(c) >= 0;
            };


            Object.keys(availableChannels).forEach(c => {
                if(knownChannel(c)) {
                    _channels[c] = CHANNELS[c];

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

            if(channelHasChanged) {
                notifyChange = true;
            }
            CHANNELS = _channels;
        };

        const nextUnopenedChannel = () => {
            let _channel = '';
            Object.keys(CHANNELS).forEach(c => {
                if(!CHANNELS[c].connected && !CHANNELS[c].hasError) {
                    _channel = c;
                }
            });

            return _channel;
        };

        const processResult = (response) => {
            const _handleList = () => {
                let _interval = interval;
                const DetectedUSBCable = Object.keys(response.h2h).length > 0;

                // record new channels, remove unavailable channels
                manageChannel(response.h2h);

                if( DetectedUSBCable ) {
                    channelToOpen = nextUnopenedChannel();
                    if(channelToOpen !== '') {
                      _interval = 2 * interval;
                      setTimeout(() => {
                        WS.send(`open ${channelToOpen}`);
                      }, interval);
                    }
                }
                setTimeout( () => { WS.send('list'); }, _interval);
            };

            const _handleOpen = () => {
                if(response.status === 'error') {
                    // if port has been opened
                    let error = response.error.join('');
                    console.log('error', error);

                    if(error === 'RESOURCE_BUSY') { // weird logic. need to fix
                        console.log('usb connected and opened!');
                        notifyChange = true;
                        CHANNELS[channelToOpen].connected = false;

                    } else if (error === 'TIMEOUT') {
                        console.log('usb connect timeout!');
                        notifyChange = true;
                        CHANNELS[channelToOpen].connected = false;
                    }
                }

                if(response.devopen) {
                    CHANNELS[response.devopen].connected = true;
                    CHANNELS[response.devopen].profile = response.profile;
                    CHANNELS[response.devopen].profile.source = 'h2h';
                    CHANNELS[response.devopen].profile.addr = response.devopen;
                    notifyChange = true;
                }

            };

            if(response.cmd === 'list') {
              _handleList();

            } else if(response.cmd === 'open') {
              _handleOpen();
            }


            if(notifyChange) {
               notifyChange = false;
               callback(CHANNELS);
            }
        };

        if(!WS) {
            WS = new Websocket({
                method: 'usb/interfaces',
                onMessage: processResult,
                onError: () => {},
                onFatal: () => {console.log('usb checker onFatal')}
            });
        }

        WS.send('list');
    };
});
