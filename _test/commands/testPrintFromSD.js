module.exports.command = function(callback) {
    this.log('testing print from SD')
        .selectNightwatchPrintFromMachine()
        .p(1)
        .click('[data-test-key=SD]')
        .keys(this.Keys.ENTER)
        .waitForElementVisible('[title="vulpix-sit.fc"]', 1 * 60 * 1000)
        .click('[title="vulpix-sit.fc"]')
        .keys(this.Keys.ENTER)
        .waitForElementVisible('.status-info', 2 * 60 * 1000)

        .waitForText('.status.right', 'Ready', 10)
        .click('.center')
        .waitForText('.status.right', 'Heating', 2 * 60 * 1000)
        .click('.left')
        .waitForText('.status.right', 'Aborted', 2 * 60)
        .waitForText('.status.right', 'Ready', 2 * 60)
        .click('.close');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
