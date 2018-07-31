define([
    'helpers/api/config',
    'app/actions/beambox/beambox-preference',
], function(
    Config,
    BeamboxPreference
){
    const workareaMap = new Map();

    workareaMap.set('mozu1', [2650, 1800]);
    workareaMap.set('fbb1b', [4000, 3750]);
    workareaMap.set('fbb1p', [6000, 3750]);

    const workarea = workareaMap.get(BeamboxPreference.read('model'));

    return {
        dpmm: 10, //seem not to be used by all people QQ
        dimension: {
            width: workarea[0],
            height: workarea[1]
        },
        camera: {
            movementSpeed: {
                // limited by firmware
                x: 300 * 60, // mm per minutes
                y: 100 * 60 // mm per minutes
            },
            imgWidth: 640, //pixel
            imgHeight: 280, //pixel
            offsetX_ideal: 20,    //mm
            offsetY_ideal: 30,    //mm
            scaleRatio_ideal: (585 / 720) * 2, // pixel on studio / pixel on beambox machine; 與焦距成正比
            calibrationPicture: {
                centerX: 70, //mm
                centerY: 70, //mm
                size: 25 //mm
            }
        }
    };
});
