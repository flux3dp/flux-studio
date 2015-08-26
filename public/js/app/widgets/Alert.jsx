define(['react'], function(React){
    'use strict';

    return React.createClass({
        _onClose: function(e) {
            console.log('close', this.props);
            this.props.handleClose(e);
        },

        render: function() {
            return (
                <div className="modal-alert">
                    <p>{this.props.message}</p>
                    <button className="btn btn-warning" onClick={this._onClose}>OK</button>
                </div>
            );
        },

        getDefaultProps: function () {
            return {
                message: React.PropTypes.string,
                handleClose: React.PropTypes.func
            };
        },
    });
});