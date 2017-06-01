module.exports.command = function(callback) {
    this.log('testing pause and stop')
        .loadStlFile('cube')
        .selectNightwatchPrintFromStart()
        .p(0.5)
        .waitForText('.status', 'Ready', 5) // waitForText uses second, NOT millisec
        .click('.controls.center')
        .waitForText('.status', 'Starting', 10)
        .waitForText('.status', 'Heating', 10)
        .waitForText('.status', 'Calibrating', 2 * 60)
        .waitForText('.status', 'Working', 2 * 60)

        .waitForElementVisible('.btn-pause', 2 * 1000)
        .click('.btn-pause') // click pause
        .waitForText('.status', 'Paused', 2 * 60)
        .click('.center')
        .waitForText('.status', 'Working', 4 * 60)

        // check for camera
        .click('.right')
        .waitForElementVisible('.camera-image', 2 * 60)
        .p(2)

        .click('.left')
        .waitForText('.status', 'Ready', 4 * 60)
        .click('.close');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
