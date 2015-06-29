define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    var rotation = { x:0, y:0, z:0 },
        setup = {
            'min': 0,
            'max': 359,
            'thickness': 0.2,
            'width': 50,
            'fgColor': '#777',
            'bgcolor': '#AAAAAA',
            'format' : function (value) {
                 return value || 0;
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
            $('.x-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { console.log(v); rotation.x = parseInt(v); thisModule._rotateModel(); }}}));
            $('.y-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { rotation.y = parseInt(v); thisModule._rotateModel(); }}}));
            $('.z-axis').knob(React.addons.update(setup, {$merge:{change: function(v) { rotation.z = parseInt(v); thisModule._rotateModel(); }}}));
        },
        _rotateModel: function() {
            this.props.onRotate(rotation);
        },
        _handleResetRotation: function () {
            $('.knob').val(0).trigger('change');
            this.props.onReset();
        },
        _handleXChange: function(e) {
            e.preventDefault();
            rotation.x = parseInt(e.target.value) || 0;
            $('.x-axis').trigger('change');
            this._rotateModel();
        },
        _handleYChange: function(e) {
            e.preventDefault();
            rotation.y = parseInt(e.target.value) || 0;
            $('.y-axis').trigger('change');
            this._rotateModel();
        },
        _handleZChange: function(e) {
            e.preventDefault();
            rotation.z = parseInt(e.target.value) || 0;
            $('.z-axis').trigger('change');
            this._rotateModel();
        },
        render: function() {
            var lang = this.props.lang;

            return (
                <div className="control-bottom">
                    <div className="panel">
                        <div className="container vertical-middle">
                            <div className="controls">
                                <label>X</label>
                                <input type="text" className="knob x-axis" onChange={this._handleXChange} />
                            </div>
                            <div className="controls">
                                <label>Y</label>
                                <input type="text" className="knob y-axis" onChange={this._handleYChange} />
                            </div>
                            <div className="controls">
                                <label>Z</label>
                                <input type="text" className="knob z-axis" onChange={this._handleZChange} />
                            </div>
                            <div className="controls pull-right">
                                <a className="btn btn-default-light" onClick={this._handleResetRotation}>{lang.print.reset}</a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

    });
});