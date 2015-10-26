define(['react'], function(React){
    'use strict';

    return React.createClass({

        render: function() {
            var buttons = this.props.buttons.map(function(opt, i) {
                var className = 'btn btn-default';

                if ('string' === typeof opt.className) {
                    className += ' ' + opt.className;
                }

                return (
                    <button className={className} onClick={opt.onClick}>{opt.label}</button>
                );
            }, this);

            return (<div className="button-group">{buttons}</div>);
        },

        getDefaultProps: function () {
            return {
                buttons: React.PropTypes.array
            };
        },
    });
});