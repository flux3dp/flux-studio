module.exports.command = function(callback) {

    this.selectFromMenu('reset')
        .waitUntilSliceFinished()
        .p(0.5)
        .previewTimeShouldBe('1h24m');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
