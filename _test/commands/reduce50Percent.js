module.exports.command = function(callback) {

    this.clearValue('[data-id=sx]')
        .setValue('[data-id=sx]', 50)
        .keys(this.Keys.ENTER);

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
