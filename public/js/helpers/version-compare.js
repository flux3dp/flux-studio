define(function () {
    const padArrayWithZero = (arr, length) => {
        while(arr.length < length) {
            arr.push('0');
        }
        return arr;
    };

    return function (currVer, promoteVer) {
        currVer = currVer || '0.0.0';
        promoteVer = promoteVer || '0.0.0';

        if (currVer === promoteVer) {
            return false;
        }

        let currVerArr = currVer.split('.');
        let promoteVerArr = promoteVer.split('.');

        let len = Math.max(currVerArr.length, promoteVerArr.length);

        currVerArr = padArrayWithZero(currVerArr, len);
        promoteVerArr = padArrayWithZero(promoteVerArr, len);

        for (let i = 0; i < len; i++) {
            let proVal = parseFloat(promoteVerArr[i]),
                curVal = parseFloat(currVerArr[i]);
            if (proVal < curVal) {
                return false;
            } else if (proVal > curVal) {
                return true;
            }
        }
        return false;
    };
});
