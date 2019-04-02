define([
    'jquery',
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
    'app/actions/beambox/constant',
], function($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {
    'use strict';

    const LANG = i18n.lang.beambox.object_panels;
    
    return React.createClass({
        propTypes: {
            x1: PropTypes.number.isRequired,
            y1: PropTypes.number.isRequired,
            x2: PropTypes.number.isRequired,
            y2: PropTypes.number.isRequired
        },

        getInitialState: function() {
            return {
                x1: this.props.x1,
                y1: this.props.y1,
                x2: this.props.x2,
                y2: this.props.y2
            };
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                x1: nextProps.x1,
                y1: nextProps.y1,
                x2: nextProps.x2,
                y2: nextProps.y2
            });
        },

        _update_x1_handler: function(val) {
            FnWrapper.update_line_x1(val);
            this.setState({x1: val});
        },
        _update_y1_handler: function(val) {
            FnWrapper.update_line_y1(val);
            this.setState({y1: val});
        },
        _update_x2_handler: function(val) {
            FnWrapper.update_line_x2(val);
            this.setState({x2: val});
        },
        _update_y2_handler: function(val) {
            FnWrapper.update_line_y2(val);
            this.setState({y2: val});            
        },
        getValueCaption: function() {
            const x1 = this.state.x1, 
                y1 = this.state.y1,
                x2 = this.state.x2, 
                y2 = this.state.y2,
                units = localStorage.getItem('default-units', 'mm') ;
            if (units === 'inches') {
                return `A (${Number(x1/25.4).toFixed(2)}, ${Number(y1/25.4).toFixed(2)}), B (${Number(x2/25.4).toFixed(2)}, ${Number(y2/25.4).toFixed(2)})`;
            } else {
                return `A (${x}, ${y}), B (${x}, ${y})`;
            } 
        },
        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                    <input type="checkbox" className="accordion-switcher"/>
                    <p className="caption">
                        {LANG.points}
                        <span className="value">{this.getValueCaption()}</span>
                    </p>
                    <label className="accordion-body">
                        <div className="control">
                            <span className="text-center header">A</span>
                            <span>
                                <UnitInput
                                    min={0}
                                    max={Constant.dimension.width/Constant.dpmm}
                                    unit="mm"
                                    abbr={true}
                                    defaultValue={this.state.x1}
                                    getValue={this._update_x1_handler}
                                    className={{'input-halfsize': true}}
                                />
                                <UnitInput
                                    min={0}
                                    max={Constant.dimension.height/Constant.dpmm}
                                    unit="mm"
                                    abbr={true}
                                    defaultValue={this.state.y1}
                                    getValue={this._update_y1_handler}
                                    className={{'input-halfsize': true}}
                                />
                            </span>
                        </div>
                        <div className="control">
                            <span className="text-center header">B</span>
                            <span>
                                <UnitInput
                                    min={0}
                                    max={Constant.dimension.width/Constant.dpmm}
                                    unit="mm"
                                    abbr={true}
                                    defaultValue={this.state.x2}
                                    getValue={this._update_x2_handler}
                                    className={{'input-halfsize': true}}
                                />
                                <UnitInput
                                    min={0}
                                    max={Constant.dimension.height/Constant.dpmm}
                                    unit="mm"
                                    abbr={true}
                                    defaultValue={this.state.y2}
                                    getValue={this._update_y2_handler}
                                    className={{'input-halfsize': true}}
                                />
                            </span>
                        </div>
                    </label>
                </label>
            </div>
            );
        }
        
    });

});