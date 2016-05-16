define([
    'react',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'app/constants/progress-constants'
],
function(React, Modal, Alert, ProgressConstants) {
    'use strict';

    var acceptableTypes = [
        ProgressConstants.WAITING,
        ProgressConstants.STEPPING,
        ProgressConstants.NONSTOP
    ];

    return React.createClass({

        propTypes: {
            type       : React.PropTypes.oneOf(acceptableTypes),
            isOpen     : React.PropTypes.bool,
            lang       : React.PropTypes.object,
            caption    : React.PropTypes.string,
            message    : React.PropTypes.string,
            percentage : React.PropTypes.number,
            hasStop    : React.PropTypes.object,
            onStop     : React.PropTypes.func,
            onFinished : React.PropTypes.func
        },

        getDefaultProps: function () {
            return {
                lang       : {},
                isOpen     : true,
                caption    : '',
                message    : '',
                type       : ProgressConstants.WAITING,
                percentage : 0,
                hasStop    : true,
                onStop     : function() {},
                onFinished : function() {}
            };
        },

        getInitialState: function() {
            return {
                percentage: this.props.percentage
            };
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({
                percentage: nextProps.percentage
            });
        },

        _getButton: function() {
            var buttons = [];

            switch (this.props.type) {
            case ProgressConstants.WAITING:
            case ProgressConstants.STEPPING:
                buttons.push({
                    label: this.props.lang.alert.stop,
                    dataAttrs: {
                        'ga-event': 'stop'
                    },
                    onClick: this.props.onStop
                });
                break;
            case ProgressConstants.NONSTOP:
                // No button
                break;
            }

            if (false === this.props.hasStop) {
                // clear button
                buttons = [];
            }

            return buttons;
        },

        _renderMessage: function() {
            var message,
                progressIcon = this._renderIcon();

            switch (this.props.type) {
            case ProgressConstants.WAITING:
            case ProgressConstants.STEPPING:
                message = (
                    <div>
                        <p>{this.props.message}</p>
                        {progressIcon}
                    </div>
                );
                break;
            case ProgressConstants.NONSTOP:
            case ProgressConstants.NONSTOP_WITH_MESSAGE:
                message = progressIcon;
                break;
            }

            return message;
        },

        _renderIcon: function() {
            var icon,
                progressStyle = {
                    width: (this.state.percentage || 0) + '%'
                };

            switch (this.props.type) {
            case ProgressConstants.WAITING:
            case ProgressConstants.NONSTOP:
            case ProgressConstants.NONSTOP_WITH_MESSAGE:
                icon = (
                    <div className="spinner-roller spinner-roller-reverse"/>
                );
                break;
            case ProgressConstants.STEPPING:
                icon = (
                    <div className="progress-bar" data-percentage={this.props.percentage}>
                        <div className="current-progress" style={progressStyle}/>
                    </div>
                );
                break;
            }

            return icon;

        },

        render: function() {
            if (false === this.props.isOpen) {
                return <div/>
            }

            var buttons = this._getButton(),
                progressIcon = this._renderIcon(),
                message = this._renderMessage(),
                content = (
                    <Alert
                        lang={this.props.lang}
                        caption={this.props.caption}
                        message={message}
                        buttons={buttons}
                    />
                ),
                className = {
                    'shadow-modal': true,
                    'waiting': ProgressConstants.WAITING === this.props.type,
                    'modal-progress': true,
                    'modal-progress-nonstop': ProgressConstants.NONSTOP === this.props.type,
                    'modal-progress-nonstop-with-message': ProgressConstants.NONSTOP_WITH_MESSAGE === this.props.type
                };

            return (
                <Modal className={className} content={content} disabledEscapeOnBackground={false}/>
            );
        }
    });
});
