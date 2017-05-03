module.exports.command = function(callback) {
    this
    .click('.advanced')
    .p(0.5)
    .click('.tab-support')
    .p(0.5)
    .click('[name=support_material] input');

    if (typeof callback === 'function') {
        callback.call(this);
    }
    console.log(this);
    return this;
};
