module.exports.command = function(time, callback) {
    this
    .p(1)
    .assert.containsText('.preview-time-cost', time);

    if (typeof callback === 'function') {
        callback.call(this);
    }
    return this;
};
