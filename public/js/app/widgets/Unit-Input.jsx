define([
    'react',
    'helpers/unit-converter',
    'helpers/round'
], function(React, unitConverter, round) {
    'use strict';

    return React.createClass({

        // Public methods
        value: function(val) {
            if ('number' === typeof val) {
                this.refs.unitInput.getDOMNode().value = round(val, -2) + this.props.defaultUnit;
            }
            else {
                return round(parseFloat(this.refs.unitInput.getDOMNode().value), -2);
            }
        },

        // Private methods
        _parseValue: function(el) {
            var pattern = new RegExp('^(\\d+\\.?\\d{0,})(' + unitConverter.acceptableUnits.join('|') + ')?$'),
                matches = pattern.exec(el.value) || [],
                defaultUnit = this.props.defaultUnit,
                unit = matches[2] || defaultUnit,
                value;

            if (1 < matches.length) {
                value = matches[1];
                value = unitConverter.from(value, unit).to(defaultUnit);
            }
            else {
                value = parseFloat(el.value) || this.props.defaultValue;
            }

            return value;
        },

        _confirmValue: function(addValue) {
            addValue = parseFloat(addValue, 10) || 0;

            var el = this.refs.unitInput.getDOMNode(),
                value = this._parseValue(el);

            this.value(value + addValue);

            return this.value();
        },

        // UI Events
        _onChange: function(e) {
            if ('function' === typeof this.props.onChange) {
                var value = this._parseValue(this.refs.unitInput.getDOMNode());
                this.props.onChange(e, value);
            }
        },

        _onBlur: function(e) {
            var value = this._confirmValue();

            this.props.getValue(e, value);
        },

        _onKeyDown: function(e) {
            var KEY_RETURN = 13,
                KEY_UP = 38,
                KEY_DOWN = 40,
                addValue = 0;

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
            }

            if (0 !== addValue) {
                this._confirmValue(addValue);
                this._onChange(e);

            }
        },

        // Lifecycle
        render: function() {
            var self = this,
                props = self.props,
                displayValue = props.defaultValue + props.defaultUnit,
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
                    onKeyDown={this._onKeyDown}
                    {...attrs}
                />
            );
        },

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

        componentWillReceiveProps: function (nextProps) {
            this.value(nextProps.defaultValue);
        }
    });
});