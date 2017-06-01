module.exports.command = function(text, callback) {

    this.execute(() => {
        return;
    }, [], () => {
        console.log('');
        console.log(`============== ${text} ==============`);
        console.log('');
    });

    if (typeof callback === 'function') {
        callback.call(this);
    }

    return this;
};
