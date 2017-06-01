module.exports.command = function(callback) {

    this.switchEngine('cura2')
        .waitUntilSliceFinished()

        // raft off + support off = 1h12m
        .previewTimeShouldBe('55m14s')

        // raft on + support off = 1h24
        .toggleRaft('on')
        .previewTimeShouldBe('1h7m')

        // raft on + support on = 1h59m
        .toggleSupport('on')
        .previewTimeShouldBe('1h35m')

        // raft off + support on = 1h41m
        .toggleRaft('off')
        .previewTimeShouldBe('1h18m')
        .toggleSupport('off');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
