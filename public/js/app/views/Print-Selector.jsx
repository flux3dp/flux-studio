define([
    'react',
    'jquery',
    'jsx!widgets/Select',
    'jsx!widgets/List',
    'helpers/api/discover',
    'helpers/api/touch'
], function(React, $, SelectView, ListView, discover, touch) {
    'use strict';

    return React.createClass({
        timer: null,
        discover_socket: null,
        selected_printer: null,

        _renderPrinterSelection: function(lang) {
            var self = this,
                lang = lang.select_printer,
                options = self.state.printer_options,
                content = (<ListView className="printer-list" items={options} ondblclick={self._selectPrinter}/>);

            if (0 === options.length) {
                content = (<div className="spinner-flip"/>);
            }

            return (
                <div>
                    <p className="text-center">{lang.choose_printer}</p>

                    {content}

                </div>
            );
        },

        _renderEnterPassword: function(lang) {
            var lang = lang.select_printer;

            return (
                <form className="form" onSubmit={this._submit}>
                    <p className="text-center">{lang.notification}</p>
                    <input
                        type="password"
                        ref="password"
                        className="span12"
                        defaultValue=""
                        placeholder={lang.please_enter_password}
                        autoFocus
                    />
                    <button className="btn btn-action btn-full-width sticky-bottom">{lang.submit}</button>
                </form>
            );
        },

        _goBackToPrinterList: function() {
            this.setState({
                auth_failure: null,
                show_password: false
            });
        },

        _renderAuthFailure: function() {
            var lang = args.state.lang.select_printer;

            return (
                <div>
                    <p>{lang.auth_failure}</p>
                    <button className="btn btn-action btn-full-width sticky-bottom" onClick={this._goBackToPrinterList}>
                        {lang.retry}
                    </button>
                </div>
            );
        },

        _selectPrinter: function(e) {
            var self = this,
                $el = $(e.target),
                meta = $el.data('meta'),
                opts = {
                    onError: function(data) {
                        self.setState({
                            show_password: true,
                            waiting: false
                        });
                    }
                };

            self.selected_printer = meta;

            if (true === meta.password) {
                self._auth(meta.serial, '', opts);
            }
            else {
                self._returnSelectedPrinter();
            }
        },

        _returnSelectedPrinter: function() {
            this.props.onGettingPrinter(this.selected_printer);
        },

        _renderPrinterItem: function(printer) {
            var class_name = 'printer-item fa ' + (true === printer.password ? 'fa-lock' : 'fa-unlock-alt'),
                meta = JSON.stringify(printer);

            return (
                <label className={class_name} data-meta={meta}>
                    <input type="radio" name="printer-group" value={printer.serial}/>
                    <span className="print-name">{printer.name}</span>
                </label>
            );
        },

        _renderSpinner: function() {
            return (
                <div className="spinner-flip"/>
            );
        },

        _submit: function(e) {
            e.preventDefault();

            var self = this,
                opts = {
                    onError: function(data) {
                        self.setState({
                            auth_failure: true,
                            show_password: false,
                            waiting: false
                        });
                    }
                },
                selected_printer = self.selected_printer,
                password, touch_socket;

            self.setState({
                waiting: true
            });

            password = self.refs.password.getDOMNode().value;

            touch_socket = self._auth(selected_printer.serial, password, opts);
        },

        _auth: function(serial, password, opts) {
            opts = opts || {};
            opts.onError = opts.onError || React.PropTypes.func;

            var self = this,
                _opts = {
                    onSuccess: function(data) {
                        self._returnSelectedPrinter();
                        self.setState({
                            waiting: false
                        });
                    },
                    onError: function(data) {
                        opts.onError();
                    }
                },
                touch_socket;

            self.setState({
                waiting: true
            });

            touch_socket = touch(_opts).send(serial, password);
        },

        render : function() {
            var self = this,
                lang = this.props.lang,
                show_password = self.state.show_password,
                auth_failure = self.state.auth_failure,
                content = (
                    false === show_password ?
                    self._renderPrinterSelection(lang) :
                    self._renderEnterPassword(lang)
                );

            if (true === auth_failure) {
                content = self._renderAuthFailure();
            }

            if (true === self.state.waiting) {
                content = self._renderSpinner();
            }

            return (
                <div className="select-printer">
                    <div className="select-printer-content">
                        {content}
                    </div>
                </div>
            );
        },

        getInitialState: function() {
            var self = this,
                options = [];

            self.discover_socket = discover(function(printers) {
                options = [];

                printers.forEach(function(el) {
                    var printer_item = self._renderPrinterItem(el);

                    options.push({
                        value: el.serial,
                        label: {printer_item}
                    });
                });
            });

            self.timer = setInterval(function() {
                self.setState({
                    printer_options: options
                });
            }, 1000);

            return {
                printer_options: [],
                show_password: false,
                waiting: false
            };
        },

        getDefaultProps: function() {
            return {
                lang: React.PropTypes.object,
                onGettingPrinter: React.PropTypes.func
            };
        },

        componentWillUnmount: function() {
            this.discover_socket.connection.close();
            clearInterval(this.timer);
        }

    });
});