define([
    'jquery',
    'react',
    'app/actions/wifi-set-printer',
    'css!cssHome/pages/wifi'
], function($, React, actions) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
                render : function() {
                    var lang = this.state.lang;

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
                                    <a href="#" className="btn" id="btn-next">{lang.wifi.set_printer.next}</a>
                                </div>
                            </div>
                        </div>
                    )
                },
                getInitialState: function() {
                    return args.state;
                },
                componentDidMount: function() {
                    actions();
                }

            });

        return Page;
    };
});