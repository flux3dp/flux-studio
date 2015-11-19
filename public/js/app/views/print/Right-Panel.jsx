define([
    'jquery',
    'react',
    'app/actions/perspective-camera',
    'app/actions/Alert-Actions',
    'app/stores/Alert-Store'
], function($, React, objectController, AlertActions, AlertStore) {
    'use strict';

    return React.createClass({
        propTypes: {
            lang: React.PropTypes.object,
            onPreviewClick: React.PropTypes.func,
            onDownloadGCode: React.PropTypes.func,
            onDownloadFCode: React.PropTypes.func,
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
            AlertStore.onRetry(this._handleRetry);
        },

        componentWillReceiveProps: function(nextProps) {
            objectController.setCameraPosition(nextProps.camera);
        },

        _handleRetry: function(id) {
            console.log('sending retry with ID:' + id);
        },

        _handleGetFCode: function() {
            this.props.onDownloadFCode();
        },

        _handleGo: function(e) {
            e.preventDefault();
            this.props.onPrintClick();
        },

        _handleGetGCode: function() {
            this.props.onDownloadGCode();
        },

        _handleTest: function(e) {
            e.preventDefault();
            AlertActions.showError('fatal error 123');
            AlertActions.showInfo('some info');
            AlertActions.showWarning('some warning');
        },

        _showInfo: function() {
            AlertActions.showPopupInfo('a1','核子廢料的處理是各國共同關注的問題');
        },

        _showWarning: function() {
            AlertActions.showPopupWarning('b2', '政府昨天核發核子廢料地下存放庫的建照，將花10億歐元');
        },

        _showError: function() {
            AlertActions.showPopupError('c3', '核子廢料將地下存放庫，將花353億元台幣預計2023年啟用。');
        },

        _updateCamera: function(position, rotation) {
            this.props.onCameraPositionChange(position, rotation);
        },

        render: function() {
            var lang = this.props.lang.print.right_panel;
            return (
                <div className='rightPanel'>
                    <a className="btn" onClick={this._handleGetGCode}>Gcode</a><p/>
                    <a className="btn" onClick={this._handleTest}>Notify</a>
                    <a className="btn" onClick={this._showInfo}>Info</a>
                    <a className="btn" onClick={this._showWarning}>Warning</a>
                    <a className="btn" onClick={this._showError}>Error</a>

                    <div id="cameraViewController" className="cameraViewController"></div>
                    <svg viewBox="-70 0 400 370">

                        <g onClick={this._handleGetFCode}>
                            <path className="btn get-gcode" d="M86.602,0 l86.602,50 l0,100 l-86.602,50 l-86.602,-50, l0,-100z" fill="#999"></path>
                            <text className="txt-get-gcode" x="0" y="0" fill="#EEE">
                                <tspan x="55" y="85">{lang.get}</tspan>
                                <tspan x="25" y="130">FCode</tspan>
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
