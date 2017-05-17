module.exports.command = function(callback) {

    // load stl file, start printing, checking each status, stop and close
    this.testBasicPrint();

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
