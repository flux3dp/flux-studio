module.exports.command = function(callback) {
    this.log('starting basic print')
        .loadStlFile('cube')
        .selectNightwatchPrintFromStart()
        .p(0.5)
        .waitForText('.status', 'Ready', 5)
        .click('.controls.center')
        .waitUntilPrinting()

        .click('.left') // click stop
        .waitForText('.status', 'Aborted', 2 * 60)
        .waitForText('.status', 'Ready', 2 * 60)
        .click('.close');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
