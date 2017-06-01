module.exports.command = function(callback) {

    // assuming using cura engine
    this.reduce50Percent()
        .clearValue('[data-id=sx]')
        .setValue('[data-id=sx]', 50)
        .keys(this.Keys.ENTER)
        .waitUntilSliceFinished()
        .previewTimeShouldBe('12m32s');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
