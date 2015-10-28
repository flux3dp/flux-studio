define([
    'react',
    'helpers/unit-converter'
], function(React, unitConverter) {
    'use strict';

    return React.createClass({
        // Public methods
        value: function() {
            return this.refs.unitInput.getDOMNode().dataset.value;
        },

        // UI Events
        _onBlur: function(e) {
            var el = this.refs.unitInput.getDOMNode(),
                pattern = new RegExp('^(\\d+\\.?\\d+)(' + unitConverter.acceptableUnits.join('|') + ')?$'),
                matches = pattern.exec(e.currentTarget.value) || [],
                unit = matches[2] || unitConverter.defaultUnit,
                value;

            if (0 < matches.length) {
                value = matches[1];
                value = unitConverter.from(value, unit).to(this.props.defaultUnit);
                e.currentTarget.dataset.value = value;
            }
            else {
                value = parseFloat(e.currentTarget.value) || '0';
            }

            e.currentTarget.value = value + this.props.defaultUnit;

            this.props.getValue(value);
        },

        _onKeyDown: function(e) {
            if (13 === e.keyCode) {
                this._onBlur(e);
            }
        },

        // Lifecycle
        render: function() {
            var props = this.props,
                displayValue = props.defaultValue + props.defaultUnit;

            return (
                <label className="ui ui-control-unit-input">
                    <input
                        ref="unitInput"
                        type="text"
                        defaultValue={displayValue}
                        onBlur={this._onBlur}
                        onKeyDown={this._onKeyDown}
                    />
                </label>
            );
        },

        getDefaultProps: function() {
            return {
                defaultValue: React.PropTypes.string,
                defaultUnit: React.PropTypes.oneOf(unitConverter.acceptableUnits),
                getValue: React.PropTypes.func
            };
        }
    });
});