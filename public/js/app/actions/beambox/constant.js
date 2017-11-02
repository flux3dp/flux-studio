define([], function(){
    return {
        dpmm: 10, //seem not to be used by all people QQ
        dimension: {
            width: 4000,
            height: 3800
        },
        camera: {
            movementSpeed: (200 * 60), // mm/minutes
            offsetX: 20,    //mm
            offsetY: 40,    //mm
            imgWidth: 1280, //pixel
            imgHeight: 720, //pixel
            scaleRatio: (600 / 720), // pixel on studio / pixel on beambox machine; 與焦距成正比
        }
    };
});