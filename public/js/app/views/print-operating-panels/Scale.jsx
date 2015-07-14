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
        getInitialState: function() {
            console.log('is locked', this.props.selected.locked);
            return {
                locked  : this.props.selected.locked || true,
                x       : 1,
                y       : 1,
                z       : 1
            };
        },
        _submitScaleChange: function() {
            this.props.onScaleChange({
                locked  : this.state.locked,
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


            // if(this.state.locked) {
            //     this.setState({
            //         x: newValue,
            //         y: newValue,
            //         z: newValue
            //     }, function() {
            //         this._submitScaleChange();
            //     });
            // }
            // else {
            //     switch(e.target.id) {
            //         case 'scaleX':
            //             this.setState({ x: newValue }, function() { this._submitScaleChange(); });
            //             break;
            //         case 'scaleY':
            //             this.setState({ y: newValue }, function() { this._submitScaleChange(); });
            //             break;
            //         case 'scaleZ':
            //             this.setState({ z: newValue }, function() { this._submitScaleChange(); });
            //             break;
            //     };
            // }
        },
        _handleToggleLock: function (e) {
            this.props.onToggleLock(!this.state.locked);
            this.setState({ locked: !this.state.locked });
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
            var lang        = this.props.lang,
                lockClass   = this.state.locked ? 'lock' : 'unlock';

            var selected = this.props.selected;
            console.log(selected.scale);
            if(selected) {
                scaleX = this.props.selected.scale.enteredX;
                scaleY = this.props.selected.scale.enteredY;
                scaleZ = this.props.selected.scale.enteredZ;
            }

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
                                <a className="btn btn-default" onClick={this._handleReset}>{lang.print.reset}</a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });
});
