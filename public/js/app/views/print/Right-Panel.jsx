define([
    'jquery',
    'react',
    'app/actions/perspective-camera',
    'jsx!widgets/Button-Group',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'helpers/duration-formatter'
], function($, React, PerspectiveCamera, ButtonGroup, AlertActions, AlertStore, DurationFormatter) {
    'use strict';

    return React.createClass({
        propTypes: {
            lang                    : React.PropTypes.object,
            hasObject               : React.PropTypes.bool,
            hasOutOfBoundsObject    : React.PropTypes.bool,
            onPreviewClick          : React.PropTypes.func,
            onDownloadGCode         : React.PropTypes.func,
            onDownloadFCode         : React.PropTypes.func,
            onGoClick               : React.PropTypes.func,
            onCameraPositionChange  : React.PropTypes.func,
        },

        getInitialState: function() {
            return {
                previewOn: false
            };
        },

        componentDidMount: function() {
            PerspectiveCamera.init(this);
        },

        componentWillReceiveProps: function(nextProps) {
            if(nextProps.updateCamera === true) {
                PerspectiveCamera.setCameraPosition(nextProps.camera);
            }
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

        _updateCamera: function(position, rotation) {
            this.props.onCameraPositionChange(position, rotation);
        },

        _renderActionButtons: function(lang) {
            let { hasObject, hasOutOfBoundsObject, disableGoButtons } = this.props,
                cx = React.addons.classSet,
                buttons = [{
                        label: lang.monitor.start,
                        className: cx({
                            'btn-disabled': !hasObject || hasOutOfBoundsObject || disableGoButtons,
                            'btn-default': true,
                            'btn-hexagon': true,
                            'btn-go': true
                        }),
                        title: lang.print.goTitle,
                        dataAttrs: {
                            'ga-event': 'print-goto-monitor'
                        },
                        onClick: this._handleGo
                    }
                ];

            return (
                <ButtonGroup buttons={buttons} className="beehive-buttons action-buttons"/>
            );
        },

        _renderTimeAndCost: function(lang) {
            let { slicingStatus, slicingPercentage, hasObject, hasOutOfBoundsObject } = this.props;
            if(slicingStatus && hasObject && !hasOutOfBoundsObject && slicingPercentage === 1) {
                if(!slicingStatus.filament_length) {
                    return '';
                }
                else {
                    return (
                        <div className="preview-time-cost">
                            {Math.round(slicingStatus.filament_length * 0.03) /10}
                            {lang.print.gram} / {DurationFormatter(slicingStatus.time).split(' ').join('')}
                        </div>
                    );
                }
            }
            else {
                return '';
            }
        },

        render: function() {
            var lang            = this.props.lang,
                actionButtons   = this._renderActionButtons(lang),
                previewTimeAndCost = this._renderTimeAndCost(lang);

            return (
                <div className='rightPanel'>
                    <div id="cameraViewController" className="cameraViewController"></div>
                    {previewTimeAndCost}
                    {actionButtons}
                </div>
            );
        }
    });
});
