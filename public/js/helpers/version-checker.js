define(function() {
    'use strict';

    // version format example: 1.5b12
    // major version: 1.5
    // minor version: b
    // sub version: 12
    return function(sourceVersion) {

        const vRegex = /([\d]+)[.]([\d]+)((a|b)(\d+))?[.]?([\d]+)?/g;
        let has = vRegex.exec(sourceVersion);

        has = [
            ...has.slice(1, 3),
            ...has.slice(4)
        ];

        const result = {
            UNSURE: 'UNSURE',
            OK: 'OK',
            YES: 'YES'
        };
        const isLetter = (str) => {
            return str.length === 1 && str.match(/[a-z]/ig);
        };

        const isWholeNumber = (str) => {
            return str.indexOf('.') === -1 && parseFloat(str) % 1 === 0;
        };

        const met = (need, has) => {
            // if both missing
            if((!need && !has) || (need === has)) { return result.UNSURE; }

            // if one is missing
            else if(!need || !has) {
                // if has need and don't have
                if(need && !has) { return result.NO; }
                if(!need && has) { return result.YES; }
            }

            if(isLetter(need) && isLetter(has)) {
                if(need.toLowerCase() === 'a') { return result.YES; }
                else { return result.NO; }
            }
            else if(isWholeNumber(need) && isWholeNumber(has)) {
                if(parseInt(need) < parseInt(has)) { return result.YES; }
                else { return result.NO; }
            }

        };

        const meetVersion = (neededVersion) => {
            let regex = /([\d]+)[.]([\d]+)((a|b)(\d+))?[.]?([\d]+)?/g;
            let need = regex.exec(neededVersion);
            need = [
                ...need.slice(1, 3),
                ...need.slice(4)
            ];

            for (let i = 0; i < need.length; i++) {

                let r = met(need[i], has[i]);

                if(r !== result.UNSURE) {
                    return r === result.YES;
                }
            }
        };

        return {
            meetVersion
        };
    };
});
