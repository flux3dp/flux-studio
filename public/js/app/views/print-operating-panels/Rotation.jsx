define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    var rotation = { x:0, y:0, z:0 },
        setup = {
            'min': 0,
            'max': 360,
            'step': 5,
            'thickness': 0.2,
            'width': 50,
            'fgColor': '#777',
            'bgcolor': '#AAAAAA',
            height: 50,
        };

    return React.createClass({
        getDefaultProps: function() {
            return {
                onReset: React.PropTypes.func,
                onRotate: React.PropTypes.func
            };
        },
        getInitialState: function() {
            return {
                x: 10
            };
        },
        componentDidMount: function() {
            var thisModule = this;
            $('.x-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { thisModule._handleXChange(v); }}}));
            $('.y-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { thisModule._handleYChange(v); }}}));
            $('.z-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { thisModule._handleZChange(v); }}}));


            this._updateDial();
        },
        componentDidUpdate: function(prevProp, prevState) {
            this._updateDial();
        },
        _updateDial: function() {
            $('.x-axis').val(this.props.selected.rotation.enteredX);
            $('.y-axis').val(this.props.selected.rotation.enteredY);
            $('.z-axis').val(this.props.selected.rotation.enteredZ);

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
            rotation.x = v || '';
            this._rotateModel();
        },
        _handleYChange: function(v) {
            rotation.y = v || '';
            this._rotateModel();
        },
        _handleZChange: function(v) {
            rotation.z = v || '';
            this._rotateModel();
        },
        _temp: function(e) {
            this.setState({x:e.target.value});
            console.log('here');
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
                                <input type="text" className="knob x-axis" />
                            </div>
                            <div className="controls">
                                <label>Y</label>
                                <input type="text" className="knob y-axis" />
                            </div>
                            <div className="controls">
                                <label>Z</label>
                                <input type="text" className="knob z-axis" />
                            </div>
                            <div className="controls pull-right">
                                <a data-ga-event="print-reset-rotation" className="btn btn-default" onClick={this._handleResetRotation}>{lang.print.reset}</a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

    });
});
