define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    var rotation = { x:0, y:0, z:0 },
        setup = {
            'min': 0,
            'max': 359,
            'step': 1,
            'thickness': 0.2,
            'width': 50,
            'fgColor': '#777',
            'bgcolor': '#AAAAAA',
            'format' : function (value) {
                 return value;
            },
            height: 50,
        };

    return React.createClass({
        getDefaultProps: function() {
            return {
                onReset: React.PropTypes.func,
                onRotate: React.PropTypes.func
            };
        },
        componentDidMount: function() {
            var thisModule = this;
            $('.x-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { thisModule._handleXChange(v); }}}));
            $('.y-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { thisModule._handleYChange(v); }}}));
            $('.z-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { thisModule._handleZChange(v); }}}));
        },
        componentDidUpdate: function(prevProp, prevState) {
            $('.x-axis').trigger('change');
            $('.y-axis').trigger('change');
            $('.z-axis').trigger('change');
        },
        _rotateModel: function() {
            this.props.onRotate(rotation);
        },
        _handleResetRotation: function () {
            $('.knob').val(0).trigger('change');
            this.props.onReset();
        },
        _handleXChange: function(v) {
            rotation.x = Math.round(v) || 0;
            this._rotateModel();
        },
        _handleYChange: function(v) {
            rotation.y = Math.round(v) || 0;
            this._rotateModel();
        },
        _handleZChange: function(v) {
            rotation.z = Math.round(v) || 0;
            this._rotateModel();
        },
        render: function() {
            var lang = this.props.lang,
                selected = this.props.selected;

            rotation.x = selected.rotation.enteredX;
            rotation.y = selected.rotation.enteredY;
            rotation.z = selected.rotation.enteredZ;

            return (
                <div className="control-bottom">
                    <div className="panel">
                        <div className="container vertical-middle">
                            <div className="controls">
                                <label>X</label>
                                <input type="text" className="knob x-axis" value={selected.rotation.enteredX} onChange={this._handleXChange} />
                            </div>
                            <div className="controls">
                                <label>Y</label>
                                <input type="text" className="knob y-axis" value={selected.rotation.enteredY} onChange={this._handleYChange} />
                            </div>
                            <div className="controls">
                                <label>Z</label>
                                <input type="text" className="knob z-axis" value={selected.rotation.enteredZ} onChange={this._handleZChange} />
                            </div>
                            <div className="controls pull-right">
                                <a className="btn btn-default" onClick={this._handleResetRotation}>{lang.print.reset}</a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

    });
});
