module.exports.command = function(callback) {

    this.switchEngine('cura')
        .testChangeSize()
        .testRotate()
        .testUndo()
        .testDuplicate()
        .testReset()
        .testClear();

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
