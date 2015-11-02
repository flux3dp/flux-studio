/**
 * unit converter
 */
define(function() {
    'use strict';

    var defaultUnit = 'mm',
        acceptableUnits = [
            'mm', 'cm', 'inch'
        ],
        conversionRate = {
            'mm': {
                from: 1,
                to: 1
            },
            'cm': {
                from: 10,
                to: 0.1
            },
            'inch': {
                from: 25.4,
                to: 0.03937
            }
        },
        checkUnitAcceptable = function(unitName, rates) {
            if (false === rates.hasOwnProperty(unitName)) {
                throw new Error('This unit name is not acceptable');
            }
        };

    return {
        defaultUnit: defaultUnit,
        acceptableUnits: acceptableUnits,

        from: function(fromValue, fromUnitName) {
            fromUnitName = fromUnitName || defaultUnit;
            checkUnitAcceptable(fromUnitName, conversionRate);

            var fromRate = conversionRate[fromUnitName].from;

            return {
                to: function(toUnitName) {
                    var toValue,
                        toRate;

                    checkUnitAcceptable(toUnitName, conversionRate);

                    toRate = conversionRate[toUnitName].to;
                    // convert to mm
                    toValue = fromValue * fromRate;
                    toValue = toValue * toRate;

                    return toValue;
                }
            };
        }
    };
});