module.exports.command = function(callback) {

    // cura seciton ==================
    this.testCuraEngine()
        .testCura2Engine();    

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
