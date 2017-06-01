module.exports.command = function(callback) {

    this.selectFromMenu('duplicate')
        .waitUntilSliceFinished()
        .p(0.5)
        .previewTimeShouldBe('27m3s');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
