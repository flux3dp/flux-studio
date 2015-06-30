define([
    'jquery',
    'react',
    'plugins/classnames/index'
], function($, React, ClassNames) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onNavUp             : React.PropTypes.func,
                onNavRight          : React.PropTypes.func,
                onNavDown           : React.PropTypes.func,
                onNavLeft           : React.PropTypes.func,
                onNavHome           : React.PropTypes.func,
                onZoomIn            : React.PropTypes.func,
                onZoomOut           : React.PropTypes.func,
                onOperationChange   : React.PropTypes.func
            };
        },
        getInitialState: function() {
            return {
                operation: ''
            };
        },
        _handleNavUp: function(e) {
            this.props.onNavUp();
        },
        _handleNavRight: function(e) {
            this.props.onNavRight();
        },
        _handleNavDown: function(e) {
            this.props.onNavDown();
        },
        _handleNavLeft: function(e) {
            this.props.onNavLeft();
        },
        _handleNavHome: function(e) {
            this.props.onNavHome();
        },
        _handleZoomIn: function(e) {
            this.props.onZoomIn();
        },
        _handleZoomOut: function(e) {
            this.props.onZoomOut();
        },
        _handleOperation: function (operation, e) {
            this.props.onOperationChange(operation);
            this.setState({ operation: this.state.operation == operation ? '' : operation });
        },
        render: function() {
            var lang = this.props.lang,
                scaleClass = ClassNames('btn', 'scale', {'active': this.state.operation === 'scale'}),
                rotateClass = ClassNames('btn', 'rotate', {'active': this.state.operation === 'rotate'});

            return (
                <div id="operating-panel" className="operating-panel">
                    <div className="panel">
                        <div className="operation up" onClick={this._handleNavUp}><img src="/img/icon-3d-arrow-up.png" /></div>
                        <div className="operation right" onClick={this._handleNavRight}><img src="/img/icon-3d-arrow-right.png" /></div>
                        <div className="operation down" onClick={this._handleNavDown}><img src="/img/icon-3d-arrow-down.png" /></div>
                        <div className="operation left" onClick={this._handleNavLeft}><img src="/img/icon-3d-arrow-left.png" /></div>
                        <div className="operation home" onClick={this._handleNavHome}><img src="/img/icon-home-s.png" /></div>
                        <div className="operation command">
                            <div>
                                <button className={scaleClass} data-tip={lang.print.scale} onClick={this._handleOperation.bind(null, 'scale')}></button>
                            </div>
                            <div>
                                <button className={rotateClass} data-tip={lang.print.rotate} onClick={this._handleOperation.bind(null, 'rotate')}></button>
                            </div>
                            <div>
                                <button className="btn center" data-tip={lang.print.align_center} onClick={this._handleOperation.bind(null, 'center')}></button>
                            </div>
                            <div>
                                <button className="btn delete" data-tip={lang.print.delete} onClick={this._handleOperation.bind(null, 'delete')}></button>
                            </div>
                        </div>
                    </div>
                    <div className="panel">
                        <div className="zoom">
                            <div className="out" onClick={this._handleZoomOut}><img src="/img/icon-zoomout.png" /></div>
                            <div className="divider"></div>
                            <div className="in" onClick={this._handleZoomIn}><img src="/img/icon-zoomin.png" /></div>
                        </div>
                    </div>
                </div>
            );
        }

    });
});