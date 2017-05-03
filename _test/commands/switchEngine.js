module.exports.command = function(engineName, callback) {
    this
    .click('.advanced')
    .p(0.5)
    .click('.' + engineName)
    .p(0.5)
    .click('button[data-ga-event=apply-preset]');

    if (typeof callback === 'function') {
        callback.call(this);
    }
    return this;
};
