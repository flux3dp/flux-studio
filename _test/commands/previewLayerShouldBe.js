module.exports.command = function(time, callback) {
    this .assert.containsText('.preview-time-cost', time);

    if (typeof callback === 'function') {
        callback.call(this);
    }
    return this;
};
