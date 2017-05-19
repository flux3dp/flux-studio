module.exports.command = function(callback) {

    this.selectFromMenu('clear')
        .waitForElementVisible('.import-btn', 5000);

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
