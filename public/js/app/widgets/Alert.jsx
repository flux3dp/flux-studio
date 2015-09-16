define(['react'], function(React){
    'use strict';

    return React.createClass({

        _renderButtonGroup: function() {
            var buttons = this.props.buttons.map(function(opt, i) {
                return (
                    <button className="btn btn-default" onClick={opt.onClick}>{opt.label}</button>
                );
            }, this);

            return (<div className="button-group">{buttons}</div>);
        },

        render: function() {
            var buttonsGroup = this._renderButtonGroup();

            return (
                <div className="modal-alert">
                    <h2 className="caption">{this.props.caption}</h2>
                    <p className="message">{this.props.message}</p>
                    {buttonsGroup}
                </div>
            );
        },

        getDefaultProps: function () {
            return {
                lang: {},
                caption: React.PropTypes.string,
                message: React.PropTypes.string,
                buttons: React.PropTypes.array
            };
        },
    });
});