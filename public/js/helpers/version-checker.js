define(function() {
    'use strict';

    // version format example: 1.5b12
    // major version: 1.5
    // minor version: b
    // sub version: 12
    return function(sourceVersion) {

        let vRegex = /([\d.]+)(a|b)?(\d*)?/g,
            has = vRegex.exec(sourceVersion);


        const isLetter = (str) => {
            return str.length === 1 && str.match(/[a-z]/ig);
        };

        const isWholeNumber = (str) => {
            return str.indexOf('.') === -1 && parseFloat(str) % 1 === 0;
        };

        let compareArray = (array_need, array_has) => {

            for (let i = 0; i < array_has.length; i++) {

                if (!Boolean(array_need[i])) {
                    return true;
                }

                let n = parseInt(array_need[i]),
                    h = parseInt(array_has[i]);

                // if everything is the same and at the last comparer
                if (i === array_has.length - 1) {
                    if (n === h) {
                        return array_need.length <= array_has.length;
                    } else {
                        return n <= h;
                    }
                }
                else if (n !== h) {
                    return n <= h;
                }
            }
        };

        const _meetVersion = (_need = '', _has = '') => {

            if(!_need && !_has) { return true; }

            if (isLetter(_need) && isLetter(_has)) {
                return _need.charCodeAt(0) <= _has.charCodeAt(0);
            }
            else if (isWholeNumber(_need) && isWholeNumber(_has)) {
                return parseInt(_need) <= parseInt(_has);
            }
            else if (Boolean(_need) && Boolean(_has)) {
                _need = _need.split('.');
                _has = _has.split('.');
                return compareArray(_need, _has);
            }
            else {
                return Boolean(_has);
            }
        };

        const meetVersion = (neededVersion) => {
            let regex = vRegex = /([\d.]+)(a|b)?(\d*)?/g;
            let need = regex.exec(neededVersion).splice(1, 3);

            for (let i = 0; i < need.length; i++) {

                let met = _meetVersion(need[i], has[i]);

                if (!met) { return false; }

                if (i === need.length - 1) {
                    return _meetVersion(need[i], has[i]);
                }
            }
        };

        return {
            meetVersion
        };
    };
});
