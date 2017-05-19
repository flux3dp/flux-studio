module.exports.command = function(status, callback) {
    this
    .getText('.support', (result) => {
        if(
            result.value === 'SUPPORT ON' && status === 'off' ||
            result.value === 'SUPPORT OFF' && status === 'on'
        ) {
            this.click('.support');
        }
    })
    .p(2);

    if (typeof callback === 'function') {
        callback.call(this);
    }
    return this;
};
