define([], function(){
    return {
        dpmm: 10, //seem not to be used by all people QQ
        dimension: {
            width: 4000,//4200,
            height: 3750//3850
        },
        camera: {
            movementSpeed: (300 * 60), // mm/minutes
            waitTimeForMovementStop: 300, // ms wait for movement stop to make sure camera is not shaking and get nice enough picture
            imgWidth: 1280, //pixel
            imgHeight: 720, //pixel
            offsetX_ideal: 20,    //mm
            offsetY_ideal: 41.5,    //mm
            scaleRatio_ideal: (585 / 720), // pixel on studio / pixel on beambox machine; 與焦距成正比
            calibrationPicture: {
                centerX: 70, //mm
                centerY: 70, //mm
                size: 40 //mm
            }
        }
    };
});