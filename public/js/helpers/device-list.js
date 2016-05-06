define(function() {

    return function(deviceListObject) {
        return Object.keys(deviceListObject).map((p) => deviceListObject[p]);
    };
});
