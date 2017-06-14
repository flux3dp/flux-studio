module.exports.command = function(callback) {

    this.switchEngine('cura')
        .loadStlFile()
        .waitUntilSliceFinished()

        // raft off + support off = 1h12m
        .previewTimeShouldBe('1h14m')

        // raft on + support off = 1h24
        .toggleRaft('on')
        .previewTimeShouldBe('1h38m')

        // raft on + support on = 1h59m
        .toggleSupport('on')
        .previewTimeShouldBe('2h20m')

        // raft off + support on = 1h41m
        .toggleRaft('off')
        .previewTimeShouldBe('1h44m')
        .toggleSupport('off');

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
