define(['react'], function(React){
    'use strict';

    return React.createClass({

        getDefaultProps: function () {
            return {
                buttons: [],
                className: ''
            };
        },

        render: function() {
            var className,
                buttons = this.props.buttons.map(function(opt, i) {
                    className = 'btn';
                    opt.type = opt.type || 'button';

                    var content = '';

                    if ('string' === typeof opt.className && '' !== opt.className) {
                        className += ' ' + opt.className;
                    }
                    else {
                        className += ' btn-default';
                    }

                    if ('link' === opt.type) {
                        content = (
                            <a className={className} href={opt.href} onClick={opt.onClick}>{opt.label}</a>
                        );
                    }
                    else {
                        content = (
                            <button title={opt.title} className={className} type={opt.type || 'button'} onClick={opt.onClick}>{opt.label}</button>
                        );
                    }

                    return content;
                }, this);

            className = 'button-group';

            if ('string' === typeof this.props.className && '' !== this.props.className) {
                className += ' ' + this.props.className;
            }
            else {
                className += ' btn-h-group';
            }

            return (
                0 < this.props.buttons.length ?
                <div className={className}>{buttons}</div> :
                <span/>
            );
        }
    });
});
