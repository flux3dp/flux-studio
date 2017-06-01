module.exports.command = function(type, callback) {
    const defaultStl = require('path').resolve(__dirname + '/../example_files/print.stl');
    const cubeStl = require('path').resolve(__dirname + '/../example_files/cube.stl');

    this.setValue('.arrowBox input[type=file]', type === 'cube' ? cubeStl : defaultStl)
        .waitUntilSliceFinished();

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
