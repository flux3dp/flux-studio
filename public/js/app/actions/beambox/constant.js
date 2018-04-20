define([
    'helpers/api/config',
    'app/actions/beambox/default-config',
], function(
    Config,
    DefaultConfig
){
    const workareaMap = new Map();
    workareaMap.set('fbb1b', [4000, 3750]);
    workareaMap.set('fbb1p', [6000, 3750]);

    const workarea = (function(){
        if (Config().read('beambox-preference') && workareaMap.get(Config().read('beambox-preference')['model'])) {
            //pass
        } else {
            Config().update('beambox-preference', 'model', DefaultConfig.model);
        }
        return workareaMap.get(Config().read('beambox-preference')['model']);
    })();
    return {
        dpmm: 10, //seem not to be used by all people QQ
        dimension: {
            width: workarea[0],
            height: workarea[1]
        },
        camera: {
            movementSpeed: (300 * 60), // mm/minutes
            waitTimeForMovementStop: 100, // ms wait for movement stop to make sure camera is not shaking and get nice enough picture, this value need optimized
            imgWidth: 1280, //pixel
            imgHeight: 720, //pixel
            offsetX_ideal: 20,    //mm
            offsetY_ideal: 38,    //mm
            scaleRatio_ideal: (585 / 720), // pixel on studio / pixel on beambox machine; 與焦距成正比
            calibrationPicture: {
                centerX: 70, //mm
                centerY: 70, //mm
                size: 40 //mm
            }
        }
    };
});
