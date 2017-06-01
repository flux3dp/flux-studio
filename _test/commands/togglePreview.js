module.exports.command = function(status, callback) {
    this
    .getText('.layer-count', (result) => {
        if(
            result.value === '' && status === 'on' ||
            result.value !== '' && status === 'off'
        ) {
            this.click('.preview');
        }
    })
    .p(1);


    if (typeof callback === 'function') {
        callback.call(this);
    }
    // console.log(this);
    return this;
};
