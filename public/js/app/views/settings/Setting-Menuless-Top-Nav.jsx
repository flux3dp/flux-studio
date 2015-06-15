define(['react'], function(React) {
    'use strict';

    return React.createClass({
        _renderBack: function() {
            return (
                <div className="back">
                    <img src="http://placehold.it/40x40" />
                </div>
            );
        },
        _renderCancel: function() {
            return (
                <div className="cancel">
                    <a className="btn btn-default-light">{this.props.lang.settings.cancel}</a>
                </div>
            );
        },
        render : function() {
            var back    = this._renderBack(),
                cancel  = this._renderCancel();

            return (
                <div className="top-nav">
                    {this.props.hideBack ? '' : back}
                    {this.props.hideCancel ? '' : cancel}
                </div>
            );
        }

    });
});