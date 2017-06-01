module.exports.command = function(callback) {
    const stl = require('path').resolve(__dirname + '/../example_files/cube.stl');
    const fcode = require('path').resolve(__dirname + '/../example_files/vulpix-sit.fc');
    const obj = require('path').resolve(__dirname + '/../example_files/bb8.obj');
    const scene = require('path').resolve(__dirname + '/../example_files/vulpix-sit.fsc');

    this.log('testing different file type import')
        .setValue('.arrowBox input[type=file]', stl)
        .waitUntilSliceFinished()
        .selectFromMenu('clear')

        .setValue('.arrowBox input[type=file]', fcode)
        .waitForElementVisible('.preview-panel', 10 * 1000)
        .click('.preview')
        .waitForElementVisible('[data-ga-event=yes]', 10 * 1000)
        .click('[data-ga-event=yes]')

        .setValue('.arrowBox input[type=file]', obj)
        .waitUntilSliceFinished()
        .selectFromMenu('clear')

        .setValue('.arrowBox input[type=file]', scene)
        .waitUntilSliceFinished()
        .selectFromMenu('clear');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
