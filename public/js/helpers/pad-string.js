define(function() {
    return function pad(str, length, left) {
        let spacer = '';
        for (let i = 0; i < length; i++) { spacer += ' '; }
        let newStr = left ? (spacer + str).slice(-length) : (str + spacer).slice(0, length);
        return newStr.split('').map(c => c === ' ' ? '&nbsp;' : c).join('');
    };
});
