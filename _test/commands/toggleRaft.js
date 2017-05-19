module.exports.command = function(status, callback) {
    this
    .getText('.raft', (result) => {
        if(
            result.value === 'RAFT ON' && status === 'off' ||
            result.value === 'RAFT OFF' && status === 'on'
        ) {
            this.click('.raft');
        }
    })
    .p(2);

    if (typeof callback === 'function') {
        callback.call(this);
    }
    return this;
};
