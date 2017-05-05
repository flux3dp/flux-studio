module.exports.command = function(callback) {
    this
    .waitForElementNotPresent('.slicingProgressBarInner', 30 * 1000)
    .waitForElementVisible('.preview-time-cost', 30 * 1000);

    if (typeof callback === 'function') {
        callback.call(this);
    }
    // console.log(this);
    return this;
};
