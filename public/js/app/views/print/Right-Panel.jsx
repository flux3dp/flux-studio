define([
    'jquery',
    'react',
    'app/actions/object-control'
], function($, React, objectController) {
    'use strict';

    return React.createClass({
        propTypes: {
            lang: React.PropTypes.object,
            onPreviewClick: React.PropTypes.func,
            onDownloadGCode: React.PropTypes.func,
            onPrintClick: React.PropTypes.func,
            onCameraPositionChange: React.PropTypes.func
        },
        getInitialState: function() {
            return {
                previewOn: false
            };
        },
        componentDidMount: function() {
            objectController.init(this);
        },
        componentWillReceiveProps: function(nextProps) {
            objectController.setCameraPosition(nextProps.camera);
        },
        _handlePreviewClick: function(e) {
            e.preventDefault();
            this.setState({ previewOn: !this.state.previewOn });
            this.props.onPreviewClick(!this.state.previewOn);
        },
        _handleGetGCode: function() {
            this.props.onDownloadGCode();
        },
        _handleGo: function(e) {
            e.preventDefault();
            this.props.onPrintClick();
        },
        _updateCamera: function(position, rotation) {
            this.props.onCameraPositionChange(position, rotation);
        },
        render: function() {
            var lang = this.props.lang.print.right_panel;
            return (
                <div className='rightPanel'>
                    <a className="btn" onClick={this._handlePreviewClick}>{lang.preview}</a>
                    <div id="cameraViewController" className="cameraViewController"></div>
                    <svg viewBox="-70 0 400 370">
                        <g onClick={this._handleGetGCode}>
                            <path className="btn get-gcode" d="M86.602,0 l86.602,50 l0,100 l-86.602,50 l-86.602,-50, l0,-100z" fill="#999"></path>
                            <text className="txt-get-gcode" x="0" y="0" fill="#EEE">
                                <tspan x="55" y="85">{lang.get}</tspan>
                                <tspan x="25" y="130">GCode</tspan>
                            </text>
                        </g>

                        <g onClick={this._handleGo}>
                            <path className="btn go" d="M180.602,160 l86.602,50 l0,100 l-86.602,50 l-86.602,-50, l0,-100z" fill="#555"></path>
                            <text className="txt-go" x="0" y="0" fill="#EEE">
                                <tspan className="go" x="140" y="280">{lang.go}</tspan>
                            </text>
                        </g>
                    </svg>
                </div>
            );
        }
    });
});
