module.exports.command = function(callback) {
    this.waitForElementVisible('div.modal-alert', 20000, false, function(result) {
            // Input password if needed
            if (result.value) {
                    this.waitForElementVisible('.modal-alert input', 30000)
                    .setValue('.modal-alert input', 'flux')
                    .click('button[data-ga-event=confirm]'); // Input default password
            } else {
                    // No password needed
            }
        });

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
