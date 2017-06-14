module.exports.command = function(callback) {

    this.selectFromMenu('undo')
        .waitUntilSliceFinished()
        .p(0.5)
        .previewTimeShouldBe('12m46s');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
