/**
 * unit converter
 */
define(function() {
    'use strict';

    var defaultUnitType = 'length',
        defaultUnit,
        currentUnitType,
        unitGroup = {
            length: [
                'mm', 'cm', 'inch', '"'
            ],
            angle: [
                '°', '%'
            ],
            speed: [
                'mm/s', 'cm/s'
            ],
            percentage: [
                '%'
            ]
        },
        symbolMap = {
            length: {
                '"': 'inch'
            },
            angle: {
                '°': 'degree',
                '%': 'degree'
            },
            percentage: {
                '%': 'percentage'
            }
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
            },
            'mm/s': {
                from: 1,
                to: 1
            },
            'cm/s': {
                from: 10,
                to: 0.1
            },
            'percentage': {
                from: 1,
                to: 1
            }
        },
        checkUnitAcceptable = function(unitName, rates) {
            if (false === rates.hasOwnProperty(unitName)) {
                throw new Error('This unit name is not acceptable');
            }
        },
        initialize = function(unitType) {
            var acceptableUnits = unitGroup[unitType] || [];
            currentUnitType = unitType;
            defaultUnit = acceptableUnits[0];

            return {
                acceptableUnits: acceptableUnits,
                defaultUnit: defaultUnit
            };
        };

    initialize(defaultUnitType);

    return {
        defaultUnit: defaultUnit,

        setDefaultUnitType: function(unitType) {
            return initialize(unitType || defaultUnitType);
        },

        from: function(fromValue, fromUnitName) {
            fromUnitName = fromUnitName || defaultUnit;

            if (true === (symbolMap[currentUnitType] || {}).hasOwnProperty(fromUnitName)) {
                fromUnitName = symbolMap[currentUnitType][fromUnitName];
            }

            checkUnitAcceptable(fromUnitName, conversionRate);

            var fromRate = conversionRate[fromUnitName].from || 1;

            return {
                to: function(toUnitName) {
                    var toValue,
                        toRate,
                        setting;

                    if (true === (symbolMap[currentUnitType] || {}).hasOwnProperty(toUnitName)) {
                        toUnitName = symbolMap[currentUnitType][toUnitName];
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