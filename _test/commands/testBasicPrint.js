module.exports.command = function(callback) {
    this.log('starting basic print')
        .loadStlFile('cube')
        .selectNightwatchPrint()
        .p(0.5)
        .waitForText('.status', 'Ready', 5)
        .click('.controls.center')
        .waitForText('.status', 'Starting', 10)
        .waitForText('.status', 'Heating', 10)
        .waitForText('.status', 'Calibrating', 2 * 60)
        .waitForText('.status', 'Working', 2 * 60)

        .click('.left') // click stop
        .waitForText('.status', 'Aborted', 2 * 60)
        .waitForText('.status', 'Ready', 2 * 60)
        .click('.close');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
