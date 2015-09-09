define([
    'jquery',
    'react',
], function($, React) {
    'use strict';

    var scaleX = 1,
        scaleY = 1,
        scaleZ = 1,
        locked = true;

    return React.createClass({
        getDefaultProps: function() {
            return {
                onToggleLock    : React.PropTypes.func,
                onScaleChange   : React.PropTypes.func,
                onReset         : React.PropTypes.func
            };
        },
        _submitScaleChange: function() {
            this.props.onScaleChange({
                locked  : locked,
                x       : scaleX,
                y       : scaleY,
                z       : scaleZ
            });
        },
        _handleScaleChange: function(e) {
            var newValue = e.target.value;
            if(locked) {
                scaleX = newValue;
                scaleY = newValue;
                scaleZ = newValue;
            }
            else {
                switch(e.target.id) {
                    case 'scaleX':
                        scaleX = newValue;
                        break;
                    case 'scaleY':
                        scaleY = newValue;
                        break;
                    case 'scaleZ':
                        scaleZ = newValue;
                        break;
                };
            }

            this._submitScaleChange();
        },
        _handleToggleLock: function (e) {
            locked = !locked;
            this._submitScaleChange();
        },
        _handleReset: function(e) {
            this.props.onReset();
            this.setState({
                x:1,
                y:1,
                z:1
            });
        },
        render: function() {
            var selected = this.props.selected;
            if(selected) {
                scaleX = selected.scale.enteredX;
                scaleY = selected.scale.enteredY;
                scaleZ = selected.scale.enteredZ;
                locked = selected.scale.locked;
            }

            var lang        = this.props.lang,
                lockClass   = locked ? 'lock' : 'unlock';

            return (
                <div className="control-bottom">
                    <div className="panel">
                        <div className="container vertical-middle">
                            <div className="controls">
                                <label>X</label>
                                <input id="scaleX" type="text" value={scaleX} onChange={this._handleScaleChange} />
                            </div>
                            <div className="controls">
                                <label>Y</label>
                                <input id="scaleY" type="text" value={scaleY} onChange={this._handleScaleChange} />
                            </div>
                            <div className="controls">
                                <label>Z</label>
                                <input id="scaleZ" type="text" value={scaleZ} onChange={this._handleScaleChange} />
                            </div>
                            <div className="controls lock-container" onClick={this._handleToggleLock}>
                                <div className={lockClass}></div>
                            </div>
                            {
                                /* temporary remove
                                <div className="controls">
                                    <label>{lang.print.scale}</label>
                                    <input type="text" />
                                </div>*/
                            }
                            <div clasName="controls">
                                <a data-ga-event="print-reset-scale" className="btn btn-default" onClick={this._handleReset}>{lang.print.reset}</a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });
});
