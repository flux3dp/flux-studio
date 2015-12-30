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
                props = this.props,
                buttons = props.buttons.map(function(opt, i) {
                    className = 'btn';
                    opt.type = opt.type || 'button';

                    var content = '',
                        attrs = {};

                    for (var key in opt.dataAttrs) {
                        if (false === attrs.hasOwnProperty(key)) {
                            attrs['data-' + key] = opt.dataAttrs[key];
                        }
                    }

                    if ('string' === typeof opt.className && '' !== opt.className) {
                        className += ' ' + opt.className;
                    }
                    else {
                        className += ' btn-default';
                    }

                    if ('link' === opt.type) {
                        content = (
                            <a className={className} href={opt.href} {...attrs} onClick={opt.onClick} >{opt.label}</a>
                        );
                    }
                    else if ('icon' === opt.type) {
                        content = (
                            <button
                                title={opt.title}
                                className={className}
                                type="button"
                                onClick={opt.onClick}
                                {...attrs} >
                                {opt.label}
                            </button>
                        );
                    }
                    else {
                        content = (
                            <button
                                title={opt.title}
                                className={className}
                                type={opt.type || 'button'}
                                onClick={opt.onClick}
                                dangerouslySetInnerHTML={{__html: opt.label}}
                                {...attrs} ></button>
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
