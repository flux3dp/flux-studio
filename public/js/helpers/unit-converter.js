/**
 * unit converter
 */
define(function() {
    'use strict';

    var defaultUnitType = 'length',
        acceptableUnits,
        defaultUnit,
        unitGroup = {
            length: [
                'mm', 'cm', 'inch', '"'
            ],
            angle: [
                '°', '%'
            ]
        },
        symbolMap = {
            '"': 'inch',
            '°': 'degree',
            '%': 'degree'
        },
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
            },
            'degree': {
                from: 1,
                to: 1,
                max: 360,
                onOutOfBoundary: function(currentValue) {
                    return currentValue % this.max;
                }
            }
        },
        checkUnitAcceptable = function(unitName, rates) {
            if (false === rates.hasOwnProperty(unitName)) {
                throw new Error('This unit name is not acceptable');
            }
        },
        initialize = function(unitType) {
            acceptableUnits = unitGroup[unitType];
            defaultUnit = acceptableUnits[0];
        };

    initialize(defaultUnitType);

    return {
        defaultUnit: defaultUnit,
        acceptableUnits: acceptableUnits,

        setDefaultUnitType: function(unitType) {
            initialize(defaultUnitType);

            return this;
        },

        from: function(fromValue, fromUnitName) {
            fromUnitName = fromUnitName || defaultUnit;

            if (true === symbolMap.hasOwnProperty(fromUnitName)) {
                fromUnitName = symbolMap[fromUnitName];
            }

            checkUnitAcceptable(fromUnitName, conversionRate);

            var fromRate = conversionRate[fromUnitName].from || 1;

            return {
                to: function(toUnitName) {
                    var toValue,
                        toRate,
                        setting;

                    if (true === symbolMap.hasOwnProperty(toUnitName)) {
                        toUnitName = symbolMap[toUnitName];
                    }

                    checkUnitAcceptable(toUnitName, conversionRate);

                    setting = conversionRate[toUnitName];

                    toRate = setting.to || 1;

                    // convert to base unit
                    toValue = fromValue * fromRate;
                    toValue = toValue * toRate;

                    // check boundary
                    if (setting.max < toValue && 'function' === typeof setting.onOutOfBoundary) {
                        toValue = setting.onOutOfBoundary(toValue);
                    }

                    return toValue;
                }
            };
        }
    };
});