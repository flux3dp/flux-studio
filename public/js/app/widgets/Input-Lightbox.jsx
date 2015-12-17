define([
    'react',
    'helpers/i18n',
    'app/constants/input-lightbox-constants',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert'
], function(React, i18n, Constants, Modal, Alert) {
    'use strict';

    var acceptableTypes = [
            Constants.TYPE_TEXT,
            Constants.TYPE_NUMBER
        ],
        View = React.createClass({

            propTypes: {
                isOpen       : React.PropTypes.bool,
                lang         : React.PropTypes.object,
                type         : React.PropTypes.oneOf(acceptableTypes),
                inputHeader  : React.PropTypes.string,
                defaultValue : React.PropTypes.string,
                confirmText  : React.PropTypes.string,
                onCustom     : React.PropTypes.func,
                onClose      : React.PropTypes.func
            },

            getDefaultProps: function() {
                return {
                    isOpen       : true,
                    lang         : i18n.get(),
                    type         : Constants.TYPE_TEXT,
                    inputHeader  : '',
                    defaultValue : '',
                    confirmText  : '',
                    onClose      : function() {},
                    onSubmit     : function() {}
                };
            },

            // button actions
            _onClose: function(e, reactid, from) {
                e.preventDefault();
                this.props.onClose.apply(null, [e, reactid, from]);
            },

            _onSubmit: function(e, reactid) {
                e.preventDefault();
                this.props.onSubmit(this.refs.inputField.getDOMNode().value);
                this._onClose.apply(null, [e, reactid, 'submit']);
            },

            _getButtons: function(lang) {
                var buttons = [];

                buttons.push({
                    label: lang.alert.cancel,
                    onClick: this._onClose
                });

                buttons.push({
                    label: this.props.confirmText || lang.alert.confirm,
                    onClick: this._onSubmit
                });

                return buttons;
            },

            _getMessage: function() {
                var typeMap = {},
                    type = 'text';

                typeMap[Constants.TYPE_TEXT] = 'text';
                typeMap[Constants.TYPE_NUMBER] = 'number';

                if ('string' === typeof typeMap[this.props.type]) {
                    type = typeMap[this.props.type];
                }

                return (
                    <label className="control">
                        <span className="inputHeader">{this.props.inputHeader}</span>
                        <input type={type} ref="inputField" defaultValue={this.props.defaultValue} autoFocus={true}/>
                    </label>
                );
            },

            render: function() {
                if(false === this.props.isOpen) {
                    return (<div/>);
                }

                var lang = this.props.lang,
                    buttons = this._getButtons(lang),
                    message = this._getMessage(),
                    content = (
                        <form className="form" onSubmit={this._onSubmit}>
                            <Alert
                                lang={lang}
                                caption={this.props.caption}
                                message={message}
                                buttons={buttons}
                            />
                        </form>
                    ),
                    className = {
                        'modal-input-lightbox': true
                    };

                return (
                    <Modal className={className} content={content} disabledEscapeOnBackground={false}/>
                );
            }

        });

    return View;
});
