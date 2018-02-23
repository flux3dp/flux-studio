define([
    'jquery',
    'react',
    'reactDOM',
    'reactPropTypes',
    'reactClassset',
    'helpers/shortcuts',
    'reactCreateReactClass'
], function($, React, ReactDOM, PropTypes, ReactCx, shortcuts) {

    var View = React.createClass({

        propTypes: {
            onOpen      : PropTypes.func,
            onClose     : PropTypes.func,
            content     : PropTypes.element,
            className   : PropTypes.object
        },

        getDefaultProps: function() {
            return {
                onOpen: function() {},
                onClose: function() {},
                content: <div/>,
                disabledEscapeOnBackground: false,
                className: {}
            };
        },

        componentDidMount: function() {
            var self = this;

            self.onOpen();

            shortcuts.on(
                ['esc'],
                function(e) {
                    if (false === self.props.disabledEscapeOnBackground) {
                        self.props.onClose(e);
                    }
                }
            );
        },

        componentWillUnmount: function() {
            shortcuts.off(['esc']);
        },

        onOpen: function() {
            if(this.props.onOpen) {
                this.props.onOpen(this);
            }
        },

        _onClose: function(e) {
            ReactDOM.unmountComponentAtNode(View);
            this.props.onClose(e);
        },

        _onEscapeOnBackground: function(e) {
            var self = this;

            if (false === self.props.disabledEscapeOnBackground) {
                self.props.onClose(e);
            }
        },

        render: function() {
            var backgroundClass;

            this.props.className['modal-window'] = true;
            backgroundClass = ReactCx.cx(this.props.className);

            return (
                <div className={backgroundClass}>
                    <div className="modal-background" onClick={this._onEscapeOnBackground}/>
                    <div className="modal-body">{this.props.content}</div>
                </div>
            );
        }
    });

    return View;
});
