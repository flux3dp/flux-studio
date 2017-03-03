define(function() {
    'use strict';

    // version format example: 1.5b12
    // major version: 1.5
    // minor version: b
    // sub version: 12
    return function(sourceVersion) {

        const vRegex = /([\d]+)[.]([\d]+)?(a|b|.)(\d+)?[.]?([\d]+)?/g;
        let has = vRegex.exec(sourceVersion);
        has = [
            ...has.slice(1, 5)
        ];

        const result = {
            UNSURE: 'UNSURE',
            OK: 'OK',
            YES: 'YES'
        };
        const isLetter = (str = '') => {
            return str.length === 1 && str.match(/[a-z]/ig);
        };

        const isWholeNumber = (str = 0) => {
            str = str || '';
            return str.indexOf('.') === -1 && parseFloat(str) % 1 === 0;
        };

        const met = (need, has) => {
            // if both missing
            if((!need && !has) || (need === has)) { return result.UNSURE; }
            else if(need === '.' || has === '.') {
                return has === '.' ? result.YES : result.NO;
            }

            if(isLetter(need) && isLetter(has)) {
                if(!need || !has) {
                    // if has need and don't have
                    if(need && !has) { return result.YES; }
                    if(!need && has) { return result.NO; }
                }
                else if(need.toLowerCase() === 'a') { return result.YES; }
                else { return result.NO; }
            }
            else if(isWholeNumber(need) && isWholeNumber(has)) {
                if(!need || !has) {
                    // if has need and don't have
                    if(need && !has) { return result.NO; }
                    if(!need && has) { return result.YES; }
                }
                else if(parseInt(need) < parseInt(has)) { return result.YES; }
                else { return result.NO; }
            }

        };

        const meetVersion = (neededVersion) => {
            let regex = /([\d]+)[.]([\d]+)?(a|b|.)(\d+)?[.]?([\d]+)?/g;
            let need = regex.exec(neededVersion);
            need = [
                ...need.slice(1, 5)
            ];

            for (let i = 0; i < need.length; i++) {
                let r = met(need[i], has[i]);

                if(r !== result.UNSURE) {
                    return r === result.YES;
                }
            }

            // if they're the same
            return true;
        };

        return {
            meetVersion
        };
    };
});
