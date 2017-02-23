define([
    'jquery',
    'react',
    'helpers/shortcuts',
    'app/constants/alert-constants',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert'
], function($, React, shortcuts, AlertConstants, Modal, Alert) {
    'use strict';

    var lang,
        acceptableTypes = [
            AlertConstants.INFO,
            AlertConstants.WARNING,
            AlertConstants.ERROR,
            AlertConstants.YES_NO,
            AlertConstants.RETRY_CANCEL,
            AlertConstants.RETRY_ABORT_CANCEL,
            AlertConstants.CUSTOM_CANCEL
        ],
        View = React.createClass({

            propTypes: {
                open        : React.PropTypes.bool,
                lang        : React.PropTypes.object,
                type        : React.PropTypes.oneOf(acceptableTypes),
                customText  : React.PropTypes.string,
                escapable   : React.PropTypes.bool,
                caption     : React.PropTypes.string,
                message     : React.PropTypes.string,
                onRetry     : React.PropTypes.func,
                onAbort     : React.PropTypes.func,
                onYes       : React.PropTypes.func,
                onNo       : React.PropTypes.func,
                onCustom    : React.PropTypes.func,
                onClose     : React.PropTypes.func,
                displayImages   : React.PropTypes.bool,
                images   : React.PropTypes.array
            },

            getDefaultProps: function() {
                return {
                    type      : AlertConstants.INFO,
                    escapable : false,
                    open      : true,
                    caption   : '',
                    message   : '',
                    onRetry   : function() {},
                    onAbort   : function() {},
                    onYes     : function() {},
                    onNo      : function() {},
                    onCustom  : function() {},
                    onClose   : function() {},
                    displayImages: false,
                    images: []
                };
            },

            componentWillMount: function() {
                lang = this.props.lang.alert;
            },

            componentDidMount: function() {
                var self = this;

                shortcuts.on(['esc'], function(e) {
                    self.props.onClose(e);
                });
            },

            componentWillUnmount: function() {
                shortcuts.off(['esc']);
            },

            // button actions
            _onClose: function(e, reactid, from) {
                this.props.onClose.apply(null, [e, reactid, from]);
            },

            _onYes: function(e, reactid) {
                this.props.onYes(e);
                this._onClose.apply(null, [e, reactid, 'yes']);
            },

            _onNo: function(e, reactid) {
                this.props.onNo(e);
                this._onClose.apply(null, [e, reactid, 'no']);
            },

            _onRetry: function(e, reactid) {
                this.props.onRetry(e);
                this._onClose.apply(null, [e, reactid, 'retry']);
            },

            _onAbort: function(e, reactid) {
                this.props.onAbort(e);
                this._onClose.apply(null, [e, reactid, 'abort']);
            },

            _onCustom: function(e, reactid) {
                this.props.onCustom(e);
                this._onClose.apply(null, [e, reactid, 'custom']);
            },

            _getTypeTitle: function() {
                var types = {};
                types[AlertConstants.INFO]               = lang.info;
                types[AlertConstants.WARNING]            = lang.warning;
                types[AlertConstants.ERROR]              = lang.error;
                types[AlertConstants.RETRY_CANCEL]       = lang.error;
                types[AlertConstants.RETRY_ABORT_CANCEL] = lang.error;
                types[AlertConstants.CUSTOM_CANCEL]      = lang.error;

                return this.props.caption || types[this.props.type] || '';
            },

            _getCloseButtonCaption: function() {
                var caption = lang.cancel;

                switch (this.props.type) {
                case AlertConstants.YES_NO:
                    caption = lang.no;
                    break;
                case AlertConstants.INFO:
                case AlertConstants.WARNING:
                case AlertConstants.ERROR:
                    caption = lang.ok;
                    break;
                case AlertConstants.CUSTOM_CANCEL:
                    caption = lang.close;
                    break;
                case AlertConstants.FINISH:
                    caption = lang.finish;
                    break;
                }

                return caption;
            },

            _getButtons: function() {
                var buttons = [];
                var onclose_bind_with_on_no = function() {
                    if(this._onNo){
                        this._onNo();
                    }
                    this.props.onClose();
                };
                buttons.push({
                    label: this._getCloseButtonCaption(),
                    onClick: onclose_bind_with_on_no.bind(this)
                });

                switch (this.props.type) {
                case AlertConstants.YES_NO:
                    buttons.push({
                        label: lang.yes,
                        dataAttrs: {
                            'ga-event': 'yes'
                        },
                        onClick: this._onYes
                    });
                    break;
                case AlertConstants.RETRY_CANCEL:
                    buttons.push({
                        label: lang.retry,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this._onRetry
                    });
                    break;
                case AlertConstants.RETRY_ABORT_CANCEL:
                    buttons.push({
                        label: lang.abort,
                        dataAttrs: {
                            'ga-event': 'abort'
                        },
                        onClick: this._onAbort
                    });
                    buttons.push({
                        label: lang.retry,
                        dataAttrs: {
                            'ga-event': 'retry'
                        },
                        onClick: this._onRetry
                    });
                    break;
                case AlertConstants.CUSTOM:
                    buttons = [{
                        label: this.props.customText,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this._onCustom
                    }];
                    break;
                case AlertConstants.CUSTOM_CANCEL:
                    buttons.push({
                        label: this.props.customText,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this._onCustom
                    });
                    break;
                }

                return buttons;
            },

            render: function() {
                if(!this.props.open) {
                    return (<div/>);
                }

                var typeTitle = this._getTypeTitle(),
                    buttons = this._getButtons(),
                    content = (
                        <Alert
                            lang={lang}
                            caption={typeTitle}
                            message={this.props.message}
                            buttons={buttons}
                            imgClass={this.props.imgClass}
                            images={this.props.images}
                            displayImages={this.props.displayImages}
                            onClose={this.props.onClose}
                        />
                    ),
                    className = {
                        'shadow-modal': true
                    };

                return (
                    <Modal className={className} content={content} disabledEscapeOnBackground={this.props.escapable}/>
                );
            }

        });

    return View;
});
