define([
    'jquery',
    'react',
    'css!cssHome/pages/wifi'
], function($, React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({

            getInitialState: function() {
                return args.state;
            },

            componentDidMount: function() {
            },

            _handleSetPrinter: function(e) {
                e.preventDefault();

                // TODO: do validation?
                var $me = $(e.target),
                    $required_fields = $('.required'),
                    is_vaild = true;

                $('.error').removeClass('error');

                $required_fields.each(function(k, el) {
                    var $el = $(el);

                    if ('' === $el.val()) {
                        $el.addClass('error');
                        is_vaild = false;
                    }
                });

                if (true === is_vaild) {
                    localStorage.set('printer-is-ready', true);
                    //location.href = '#studio/print';
                    location.href='#initialize/wifi/setup-complete'
                }
            },

            render : function() {
                var lang = this.state.lang,
                    cx = React.addons.classSet;

                return (
                    <div className="wifi initialization absolute-center">
                        <h1>{lang.brand_name}</h1>
                        <div>
                            <h2>{lang.wifi.set_printer.caption}</h2>
                            <div className="form">
                                <p>
                                    <label>
                                        {lang.wifi.set_printer.printer_name}
                                        <input type="text" className="required" name="printer-name"
                                        placeholder={lang.wifi.set_printer.printer_name_placeholder}/>
                                    </label>
                                </p>
                                <p>
                                    <label>
                                        {lang.wifi.set_printer.password}
                                        <input type="password" name="printer-password"
                                        placeholder={lang.wifi.set_printer.password_placeholder}/>
                                    </label>
                                </p>
                                <p>
                                {lang.wifi.set_printer.notice}
                                </p>
                            </div>
                            <div>
                                <a href="#initialize/wifi/setup-complete" className="btn" id="btn-next" onClick={this._handleSetPrinter}>{lang.wifi.set_printer.next}</a>
                            </div>
                        </div>
                    </div>
                );
            }

        });

        return Page;
    };
});