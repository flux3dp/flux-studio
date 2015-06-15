define([
    'jquery',
    'react',
], function($, React) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onReset: React.PropTypes.func
            };
        },
        componentDidMount: function() {
            $('.knob').knob({
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
            });
        },
        _handleResetRotation: function () {
            $('.knob').val(0).trigger('change');
            this.props.onReset();
        },
        render: function() {
            var lang = this.props.lang;

            return (
                <div className="control-bottom">
                    <div className="panel">
                        <div className="container verticle-middle">
                            <div className="controls">
                                <label>X</label>
                                <input type="text" className="knob" />
                            </div>
                            <div className="controls">
                                <label>Y</label>
                                <input type="text" className="knob" />
                            </div>
                            <div className="controls">
                                <label>Z</label>
                                <input type="text" className="knob" />
                            </div>
                            <div className="controls pull-right">
                                <a className="btn" onClick={this._handleResetRotation}>{lang.print.reset}</a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

    });
});