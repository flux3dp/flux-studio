var util = require('util');
var events = require('events');

function WaitForText() {
  events.EventEmitter.call(this);
}

util.inherits(WaitForText, events.EventEmitter);

WaitForText.prototype.command = function(selector, expectedText, timeoutInSec, callback) {
    let self = this,
        timeoutRetryInMilliseconds = 100,
        startTimeInMilliseconds = new Date().getTime();

    if(!timeoutInSec) { return this; }

    const checker = (_selector, _expectedText, _timeoutInMilliseconds) => {
        this.client.api.getText(selector, result => {
            let now = new Date().getTime();
            if(result.status === 0 && expectedText === result.value) {
                self.client.api.assert.containsText(selector, expectedText);
                if (typeof callback === 'function') {
                    callback.call(this);
                }
                self.emit('complete');
            }
            else if(now - startTimeInMilliseconds < _timeoutInMilliseconds) {
                setTimeout(() => {
                    checker(_selector, _expectedText, _timeoutInMilliseconds);
                }, timeoutRetryInMilliseconds);
            }
            else {
                self.emit('error', `expect ${_expectedText} but got ${result.value}`);
            }
        });
    };

    checker(selector, expectedText, timeoutInSec * 1000);

};

module.exports = WaitForText;
