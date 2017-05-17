module.exports.command = function(callback) {

    this.click('[data-test-key=start]')
        .waitForElementVisible('.select-printer', 10 * 1000)
        .waitForElementVisible('#nightwatch-print', 30 * 1000)
        .click('#nightwatch-print')
        .waitForElementVisible('.flux-monitor', 10 * 1000);

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
