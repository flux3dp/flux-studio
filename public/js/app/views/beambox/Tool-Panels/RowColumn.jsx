define([
    'jquery',
    'react',
    'reactPropTypes',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
], function($, React, PropTypes, UnitInput, i18n) {
    'use strict';

    const LANG = i18n.lang.beambox.tool_panels;
    
    return React.createClass({
        propTypes: {
            row: PropTypes.number.isRequired,
            column: PropTypes.number.isRequired,
            onValueChange: PropTypes.func,
            onColumnChange: PropTypes.func,
        },

        getInitialState: function() {
            return {
                row: this.props.row,
                column: this.props.column,
                onValueChange: this.props.onValueChange,
            };
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                row: nextProps.row,
                column: nextProps.column,
                onValueChange: nextProps.onValueChange,
            });
        },

        _update_row_handler: function(val) {
            this.setState({row: val});
            let rc = this.state;
            rc.row = val;
            this.props.onValueChange(rc);
        },

        _update_column_handler: function(val) {
            this.setState({column: val});
            let rc = this.state;
            rc.column = val;
            this.props.onValueChange(rc);
        },

        getValueCaption: function() {
            const row = this.state.row, 
                column = this.state.column;
            return `${row} X ${column}`;
        },
        render: function() {
            return (
                <div className="tool-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
                        <p className="caption">
                            {LANG.array_dimension}
                            <span className="value">{this.getValueCaption()}</span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="text-center header">{LANG.columns}</span>
                                <UnitInput
                                    min={1}
                                    unit=""
                                    decimal={0}
                                    defaultValue={this.state.column || 1}
                                    getValue={this._update_column_handler}
                                />
                            </div>
                            <div className="control">
                                <span className="text-center header">{LANG.rows}</span>
                                <UnitInput
                                    min={1}
                                    unit=""
                                    decimal={0}
                                    defaultValue={this.state.row || 1}
                                    getValue={this._update_row_handler}
                                />
                            </div>
                        </label>
                    </label>
                </div>
            );
        } 
    });
});
