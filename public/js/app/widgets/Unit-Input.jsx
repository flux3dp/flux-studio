define([
    'react',
    'helpers/unit-converter',
    'helpers/round'
], function(React, unitConverter, round) {
    'use strict';

    return React.createClass({
        operatorRegex: /(\+|-|\*|\/)/,

        getDefaultProps: function() {
            return {
                defaultValue: React.PropTypes.string,
                defaultUnit: unitConverter.defaultUnit,
                min: Number.MIN_SAFE_INTEGER,
                max: Number.MAX_SAFE_INTEGER,
                step: 1,
                dataAttrs: {},
                getValue: React.PropTypes.func,
                onChange: undefined
            };
        },

        // Public methods
        value: function(val) {
            if ('number' === typeof val) {
                this.refs.unitInput.getDOMNode().value = round(val, -2) + this.props.defaultUnit;
                return round(val, -2);
            }
            else {
                val = round(parseFloat(this.refs.unitInput.getDOMNode().value), -2);

                this.props.getValue({ currentTarget: this.refs.unitInput.getDOMNode() }, val);

                return val;
            }
        },

        // Private methods
        _parseValue: function(value) {
            var pattern = new RegExp('^(\\d+\\.?\\d{0,})(' + unitConverter.acceptableUnits.join('|') + ')?$'),
                matches = pattern.exec(value) || [],
                defaultUnit = this.props.defaultUnit,
                unit = matches[2] || defaultUnit,
                value;

            if (1 < matches.length) {
                value = matches[1];
                value = unitConverter.from(value, unit).to(defaultUnit);
            }
            else {
                value = parseFloat(value, 10) || 0;
            }

            return value;
        },

        _confirmValue: function(addValue) {
            addValue = parseFloat(addValue, 10) || 0;

            var el = this.refs.unitInput.getDOMNode(),
                values = el.value.split(this.operatorRegex),
                tempValue,
                value;

            if (3 <= values.length) {
                tempValue = this._parseValue(values[2]);
                value = this._parseValue(values[0]);

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

            this.value(this._parseValue(el.value) + addValue);

            if ('undefined' !== typeof values[3]) {
                el.value += values[3];
            }

            return this.value();
        },

        // UI Events
        _onChange: function(e) {
            if ('function' === typeof this.props.onChange) {
                this.props.onChange(e, this.value());
            }
        },

        _onBlur: function(e) {
            var value = this._confirmValue();

            this.props.getValue(e, value);
        },

        _onKeyUp: function(e) {
            var KEY_RETURN = 13,
                KEY_UP = 38,
                KEY_DOWN = 40,
                KEY_PLUS = 187,
                KEY_MINUS = 189,
                KEY_MULTIPLY = 56,
                KEY_DIVIDE = 191,
                addValue = undefined,
                operatorAmount = 0;

            switch (e.keyCode) {
            case KEY_RETURN:
                this._onBlur(e);
                break;
            case KEY_UP:
                addValue = Math.abs(this.props.step);
                break;
            case KEY_DOWN:
                addValue = -Math.abs(this.props.step);
                break;
            case KEY_PLUS:
            case KEY_MINUS:
            case KEY_MULTIPLY:
            case KEY_DIVIDE:
                operatorAmount = Math.floor(e.currentTarget.value.split(this.operatorRegex).length / 2);

                if (1 < operatorAmount) {
                    addValue = 0;
                }

                break;
            }

            if ('undefined' !== typeof addValue) {
                this._confirmValue(addValue);
                this._onChange(e);
            }
        },

        // Lifecycle
        render: function() {
            var self = this,
                props = self.props,
                state = self.state,
                displayValue = state.defaultValue + props.defaultUnit,
                attrs = {};

            for (var key in props.dataAttrs) {
                attrs['data-' + key] = props.dataAttrs[key];
            }

            return (
                <input
                    ref="unitInput"
                    type="text"
                    className="ui ui-control-unit-input"
                    defaultValue={displayValue}
                    onBlur={this._onBlur}
                    onKeyUp={this._onKeyUp}
                    {...attrs}
                />
            );
        },

        getInitialState: function() {
            return {
                defaultValue: this.props.defaultValue,
                operatorAmount: 0
            };
        },

        componentWillReceiveProps: function (nextProps) {
            this.value(nextProps.defaultValue);
        }
    });
});