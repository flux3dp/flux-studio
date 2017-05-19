module.exports.command = function(engineName, callback) {
    this
    .p(1)
    .click('.advanced')
    .p(1)
    .click('.' + engineName)
    .click('button[data-ga-event=apply-preset]')
    .p(1);

    if (typeof callback === 'function') {
        callback.call(this);
    }
    return this;
};
