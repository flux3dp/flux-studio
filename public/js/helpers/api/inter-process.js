/**
 * API image tracer
 * Ref: none
 */
define([
    'helpers/websocket',
    'app/actions/beambox',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!app/actions/beambox/Laser-Panel-Controller'
], function(
    Websocket,
    BeamboxActions,
    FnWrapper,
    LaserPanelController
) {
    'use strict';

    return function() {
        var ws = new Websocket({
                method: 'push-studio',
                onMessage: (data) => {
                    events.onMessage(data);
                },
                onError: (response) => {
                    events.onError(response);
                },
                onFatal: (response) => {
                    events.onFatal(response);
                }
            }),
            events = {
                onMessage   : (data) => {
                    if(data.svg) {
                        FnWrapper.insertSvg(data.svg, 'layer');
                    }

                    setTimeout(() => {
                        if (data.layerData) {
                            const layerDataJSON = JSON.parse(data.layerData);

                            for (let layerName in layerDataJSON) {
                                const {
                                    name,
                                    speed,
                                    power
                                } = layerDataJSON[layerName];

                                LaserPanelController.funcs.writeSpeed(name, parseInt(speed));
                                LaserPanelController.funcs.writeStrength(name, parseInt(power));
                            }

                            BeamboxActions.updateLaserPanel();
                        }
                    }, 50);
                },
                onError     : () => { console.log('IP_ERROR'); },
                onFatal     : () => { console.log('FATAL'); },
                onOpen      : () => { console.log('Open interprocess socket! '); }
            };

        return {
            connection: ws,
        };
    };
});
