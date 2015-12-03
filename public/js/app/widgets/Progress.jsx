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
        ProgressConstants.STEPPING
    ];

    return React.createClass({

        propTypes: {
            type       : React.PropTypes.oneOf(acceptableTypes),
            isOpen     : React.PropTypes.bool,
            lang       : React.PropTypes.object,
            caption    : React.PropTypes.string,
            message    : React.PropTypes.string,
            percentage : React.PropTypes.number,
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
                onFinished : function() {}
            };
        },

        render: function() {
            if (false === this.props.isOpen) {
                return <div/>
            }

            var buttons = [{
                    label: this.props.lang.alert.stop,
                    onClick: this.props.onFinished
                }],
                progressStyle = {
                    width: (this.props.percentage || 0) + '%'
                },
                progressIcon = (
                    ProgressConstants.WAITING === this.props.type ?
                    <div className="spinner-roller"/> :
                    <div className="progress-bar" data-percentage={this.props.percentage}>
                        <div className="current-progress" style={progressStyle}/>
                    </div>
                ),
                message = (
                    <div>
                        <p>{this.props.message}</p>
                        {progressIcon}
                    </div>
                ),
                content = (
                    <Alert
                        lang={this.props.lang}
                        caption={this.props.caption}
                        message={message}
                        buttons={buttons}
                    />
                ),
                className = {
                    'modal-progress': true
                };

            return (
                <Modal className={className} content={content} disabledEscapeOnBackground={false}/>
            );
        }
    });
});