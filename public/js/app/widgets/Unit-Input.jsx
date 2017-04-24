define([
    'react',
    'helpers/unit-converter',
    'app/constants/keycode-constants',
    'helpers/round',
    'plugins/classnames/index'
], function(React, unitConverter, keyCodeConstants, round, ClassNames) {
    'use strict';

    return React.createClass({
        operatorRegex: /(\+|-|\*|\/)/,

        getDefaultProps: function() {
            return {
                className: {},
                defaultValue: '',
                defaultUnit: unitConverter.defaultUnit,
                defaultUnitType: unitConverter.defaultUnitType,
                operators: ['+', '-', '*', '/'],
                handleNumberFormat: function(value) {
                    return round(value, -2);
                },
                min: Number.MIN_SAFE_INTEGER,
                max: Number.MAX_SAFE_INTEGER,
                step: 1,
                dataAttrs: {},
                getValue: function() {}
            };
        },

        getInitialState: function() {
            return {
                defaultValue: this.props.defaultValue,
                operatorAmount: 0
            };
        },

        componentWillReceiveProps: function (nextProps) {
            this.value(nextProps.defaultValue);
        },

        // Public methods
        value: function(val) {
            if (false === this.isMounted()) {
                return 0;
            }

            if ('number' === typeof val) {
                val = this.props.handleNumberFormat(val);
                this.refs.unitInput.getDOMNode().value = val + this.props.defaultUnit;

                return val;
            }
            else {
                val = round(parseFloat(this.refs.unitInput.getDOMNode().value), -2);

                return val;
            }
        },

        // Private methods
        _parseValue: function(value) {
            var unitConfig = unitConverter.setDefaultUnitType(this.props.defaultUnitType),
                acceptableUnits = unitConfig.acceptableUnits,
                pattern = new RegExp('^(-?\\d+\\.?\\d{0,})(' + acceptableUnits.join('|') + ')?$'),
                matches = pattern.exec(value) || [],
                defaultUnit = this.props.defaultUnit,
                unit = matches[2] || defaultUnit,
                parsedValue = value;

            if (1 < matches.length) {
                parsedValue = matches[1];

                try {
                    parsedValue = unitConverter.from(parsedValue, unit).to(defaultUnit);
                }
                catch (ex) {
                    console.error(ex);
                }

            }
            else {
                parsedValue = parseFloat(parsedValue, 10) || 0;
            }

            return parsedValue;
        },

        _confirmValue: function(addValue) {
            addValue = parseFloat(addValue, 10) || 0;

            var el = this.refs.unitInput.getDOMNode(),
                value = el.value.replace(/\s+/g, ''),
                value = el.value.replace('/s', 's'),
                isNegative = /^-.*/.test(value),
                values,
                tempValue;

            if (true === isNegative) {
                value = value.replace(/^-(.*)/, '$1');
            }

            values = value.split(this.operatorRegex);

            if (3 <= values.length && -1 < this.props.operators.indexOf(values[1])) {
                tempValue = this._parseValue(values[2]);
                value = this._parseValue(values[0] || 0);

                value = value * (true === isNegative ? -1 : 1);

                switch (values[1]) {
                case '+':
                    el.value = value + tempValue;
                    break;
                case '-':
                    el.value = value - tempValue;
                    break;
                case '*':
                    el.value = value * tempValue;
                    break;
                case '/':
                    el.value = value / tempValue;
                    break;
                }
            }

            value = this.value(this._parseValue(el.value) + addValue);

            // check value boundary
            if (value > this.props.max) {
                value = this.value(this.props.max);
            }

            if (value < this.props.min) {
                value = this.value(this.props.min);
            }

            if ('undefined' !== typeof values[3]) {
                el.value += values[3];
            }

            return this.value();
        },

        // UI Events
        _onBlur: function(e) {
            e.preventDefault();
            let textboxValue = this.refs.unitInput.getDOMNode().value;
            var value = this._confirmValue();
            if(textboxValue === '') {
                this.refs.unitInput.getDOMNode().value = this.props.defaultValue + this.props.defaultUnit;
            }
            else {
                this.props.getValue(e, value);
            }
        },

        _onKeyUp: function(e) {
            e.preventDefault();

            var addValue = undefined,
                operatorAmount = 0,
                value;

            switch (e.keyCode) {
            case keyCodeConstants.KEY_BACK:
                return;
            case keyCodeConstants.KEY_RETURN:
                this._onBlur(e);
                break;
            case keyCodeConstants.KEY_UP:
                addValue = Math.abs(this.props.step);
                break;
            case keyCodeConstants.KEY_DOWN:
                addValue = -Math.abs(this.props.step);
                break;
            case keyCodeConstants.KEY_ESC:
                this._onBlur(e);
                break;
            case keyCodeConstants.KEY_PLUS:
            case keyCodeConstants.KEY_MINUS:
            case keyCodeConstants.KEY_MULTIPLY:
            case keyCodeConstants.KEY_DIVIDE:
                operatorAmount = Math.floor(e.currentTarget.value.split(this.operatorRegex).length / 2);

                // check negative number
                if (true === /^-(.*)/.test(e.currentTarget.value)) {
                    operatorAmount = operatorAmount - 1;
                }

                if (1 < operatorAmount) {
                    addValue = 0;
                }

                break;
            }

            if ('number' === typeof addValue) {
                value = this._confirmValue(addValue);
                this.props.getValue(e, value);
            }
        },

        // Lifecycle
        render: function() {
            var self = this,
                props = self.props,
                state = self.state,
                displayValue = state.defaultValue + props.defaultUnit,
                attrs = {},
                className = props.className || {};

            className['ui ui-control-unit-input'] = true;

            for (var key in props.dataAttrs) {
                if (false === attrs.hasOwnProperty(key)) {
                    attrs['data-' + key] = props.dataAttrs[key];
                }
            }

            return (
                <input
                    ref="unitInput"
                    type="text"
                    className={ClassNames(className)}
                    defaultValue={displayValue}
                    onBlur={this._onBlur}
                    onKeyUp={this._onKeyUp}
                    onFocus={this.props.onFocus}
                    {...attrs}
                />
            );
        }
    });
});
