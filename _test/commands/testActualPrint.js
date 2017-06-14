module.exports.command = function(callback) {

    // load stl file, start printing, checking each status, stop and close
    // this.testBasicPrint();
    this.testPrintFromSD();

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
