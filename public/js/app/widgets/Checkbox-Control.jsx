define([
    'react',
    'plugins/classnames/index'
], function(React, ClassNames) {
    'use strict';

    return React.createClass({

        propTypes: {
            id: React.PropTypes.string,
            label: React.PropTypes.string,
            default: React.PropTypes.array,
            options: React.PropTypes.array.isRequired,
            onChange: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            let selected = this.props.default;
            return { selected };
        },

        componentWillReceiveProps: function(nextProps) {
            let _new = JSON.stringify(nextProps.default),
                _old = JSON.stringify(this.state.selected);

            if(_new !== _old) { this.setState({ selected: nextProps.default }); }
        },

        _handleToggleChange: function(id) {
            let { selected } = this.state;
            if(selected.indexOf(id) === -1) {
                selected.push(id);
            }
            else {
                let i = selected.indexOf(id);
                selected = selected.slice(0, i).concat(selected.slice(i + 1));
            }

            this.props.onChange(this.props.id, selected, id);
        },

        render: function() {
            var _options = this.props.options.map(function(option) {
                var checkboxClass = ClassNames(
                    { 'selected': this.state.selected.indexOf(option.id) !== -1 }
                );
                return (
                    <div className="checkbox" onClick={this._handleToggleChange.bind(null, option.id)}>
                        <div className={checkboxClass}></div>
                        <span>{option.name}</span>
                    </div>
                );
            }.bind(this));

            return (
                <div className="controls">
                    <div className="label">{this.props.label}</div>
                    <div className="control">
                        {_options}
                    </div>
                </div>
            );
        }

    });
});
