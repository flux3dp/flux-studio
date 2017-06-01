module.exports.command = function(callback) {

    this.selectFromMenu('rotate')
        .clearValue('[id=y]')
        .setValue('[id=y]', 45)
        .toggleSupport('on')
        .waitUntilSliceFinished()
        .previewTimeShouldBe('20m21s')
        .toggleSupport('off');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
