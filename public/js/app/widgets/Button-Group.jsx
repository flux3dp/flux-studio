define(['react'], function(React){
    'use strict';

    return React.createClass({

        render: function() {
            var className,
                buttons = this.props.buttons.map(function(opt, i) {
                    className = 'btn btn-default';

                    if ('string' === typeof opt.className) {
                        className += ' ' + opt.className;
                    }

                    return (
                        <button className={className} onClick={opt.onClick}>{opt.label}</button>
                    );
                }, this);

            className = 'button-group';

            if ('string' === typeof this.props.className) {
                className += ' ' + this.props.className;
            }

            return (<div className={className}>{buttons}</div>);
        },

        getDefaultProps: function () {
            return {
                buttons: React.PropTypes.array,
                className: React.PropTypes.string
            };
        },
    });
});