define([
    'jquery',
    'react',
    'app/actions/perspective-camera',
    'jsx!widgets/Button-Group',
    'app/actions/alert-actions',
    'app/stores/alert-store'
], function($, React, PerspectiveCamera, ButtonGroup, AlertActions, AlertStore) {
    'use strict';

    return React.createClass({
        propTypes: {
            lang                    : React.PropTypes.object,
            hasObject               : React.PropTypes.bool,
            onPreviewClick          : React.PropTypes.func,
            onDownloadGCode         : React.PropTypes.func,
            onDownloadFCode         : React.PropTypes.func,
            onGoClick               : React.PropTypes.func,
            onCameraPositionChange  : React.PropTypes.func
        },

        getInitialState: function() {
            return {
                previewOn: false
            };
        },

        componentDidMount: function() {
            PerspectiveCamera.init(this);
            // AlertStore.onRetry(this._handleRetry);
            // AlertStore.onAnswer(this._handleAnswer);
            // AlertStore.onAbort(this._handleGeneric);
            // AlertStore.onCancel(this._handleGeneric);
            // AlertStore.onRetry(this._handleGeneric);
        },

        componentWillReceiveProps: function(nextProps) {
            PerspectiveCamera.setCameraPosition(nextProps.camera);
        },

        _handleTest: function() {
            AlertActions.showInfo('hello');
            AlertActions.showWarning('warning');
            AlertActions.showError('error');
        },

        _handleRetry: function(id) {
            console.log('sending retry with ID:' + id);
        },

        _handleAnswer: function(id, isYes) {
            console.log(id, isYes);
        },

        _handleGeneric: function(id, message) {
            console.log(id, message);
        },

        _handleGetFCode: function() {
            this.props.onDownloadFCode();
        },

        _handleGo: function(e) {
            e.preventDefault();
            this.props.onGoClick();
        },

        _handleGetGCode: function() {
            this.props.onDownloadGCode();
        },

        _showInfo: function() {
            // AlertActions.showPopupRetryAbort('a1','核子廢料的處理是各國共同關注的問題');
            AlertActions.showPopupRetry('abc', '123');
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

        _renderActionButtons: function(lang) {
            var cx = React.addons.classSet,
                buttons = [{
                    label: lang.laser.get_fcode,
                    className: cx({
                        'btn-disabled': !this.props.hasObject,
                        'btn-default': true,
                        'btn-hexagon': true,
                        'btn-get-fcode': true
                    }),
                    title: lang.print.getFcodeTitle,
                    onClick: this._handleGetFCode
                }, {
                    label: lang.laser.go,
                    className: cx({
                        'btn-disabled': !this.props.hasObject,
                        'btn-default': true,
                        'btn-hexagon': true,
                        'btn-go': true
                    }),
                    title: lang.print.goTitle,
                    onClick: this._handleGo
                }];

            return (
                <ButtonGroup buttons={buttons} className="beehive-buttons action-buttons"/>
            );
        },

        render: function() {
            var lang            = this.props.lang,
                actionButtons   = this._renderActionButtons(lang);

            return (
                <div className='rightPanel'>
                    <div id="cameraViewController" className="cameraViewController"></div>
                    {actionButtons}
                </div>
            );
        }
    });
});
