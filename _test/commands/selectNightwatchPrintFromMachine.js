module.exports.command = function(callback) {

    this.click('.device-icon')
        .waitForElementVisible('.device-list', 10 * 1000)
        .waitForElementVisible('[data-test-key=FD1AC81713]', 30 * 1000)
        .click('[data-test-key=FD1AC81713]')
        .waitForElementVisible('.flux-monitor', 10 * 1000);

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
