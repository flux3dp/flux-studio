module.exports.command = function(callback) {

    this.loadStlFile('cube')
        .click('[data-test-key=start]')
        .waitForElementVisible('.select-printer', 10 * 1000)
        .waitForElementVisible('#nightwatch-print', 30 * 1000)
        .click('#nightwatch-print')
        .enterDefaultPassword()
        .waitForElementVisible('.flux-monitor', 10 * 1000)
        .click('.close')
        .selectFromMenu('clear');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
