module.exports.command = function(callback) {
    this.waitForText('.status', 'Starting', 10)
        .waitForText('.status', 'Heating', 10)
        .waitForText('.status', 'Calibrating', 2 * 60)
        .waitForText('.status', 'Working', 2 * 60);

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
