module.exports.command = function(callback) {
    this
    .waitForElementVisible('body', 6000)
    .waitForElementVisible('div.modal-alert', 10000)
    .waitForElementVisible('button.btn.btn-default', 8000)
    .click('button.btn.btn-default') // Warning popout from not running from Application folder
    .waitForElementVisible('a.btn.btn-action.btn-large', 500)
    .click('a.btn.btn-action.btn-large') // Next
    .waitForElementVisible('a[data-ga-event=skip]', 500)
    .click('a[data-ga-event=skip]') // Skip setting
    .waitForElementVisible('button[data-ga-event=start]', 500)
    .click('button[data-ga-event=start]') // Start creating
    .waitForElementVisible('div.modal-alert', 8000)
    .waitForElementNotPresent('div.modal-alert .spinner-roller', 8000) // Wait slicing service loaded
    .click('button[data-ga-event=yes]');

    if (typeof callback === 'function') {
        callback.call(this);
    }
    return this;
};
