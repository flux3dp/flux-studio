define([
    'react',
    'jquery',
    'jsx!widgets/Select',
    'jsx!widgets/List',
    'helpers/api/discover',
    'helpers/api/touch',
    'helpers/api/config'
], function(React, $, SelectView, ListView, discover, touch, config) {
    'use strict';

    var View = React.createClass({
        displayName: 'PrinterSelection',
        selected_printer: null,

        propTypes: {
            onClose: React.PropTypes.func,
            onGettingPrinter: React.PropTypes.func
        },

        getDefaultProps: function() {
            return {
                lang: React.PropTypes.object,
                className: React.PropTypes.string,
                onGettingPrinter: React.PropTypes.func,
                onClose: React.PropTypes.func
            };
        },

        getInitialState: function() {
            return {
                printOptions: [],
                authFailure: false,
                waiting: false,
                showPassword: false,
                loadFinished: false,
                discoverMethods: undefined
            };
        },

        _goBackToPrinterList: function() {
            this.setState({
                authFailure: false,
                showPassword: false
            });
        },

        _selectPrinter: function(e) {
            var self = this,
                $el = $(e.target.parentNode),
                meta = $el.data('meta'),
                onError = function() {
                    self.setState({
                        showPassword: true,
                        waiting: false
                    });
                },
                opts = {
                    onError: onError
                };

            self.selected_printer = meta;

            self._auth(meta.uuid, '', opts);
        },

        _submit: function(e) {
            e.preventDefault();

            var self = this,
                opts = {
                    onError: function(data) {
                        self.setState({
                            authFailure: true,
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

            touch_socket = self._auth(selected_printer.uuid, password, opts);
        },

        _auth: function(uuid, password, opts) {
            opts = opts || {};
            opts.onError = opts.onError || function() {};

            var self = this,
                _opts = {
                    onSuccess: function(data) {
                        self._returnSelectedPrinter();
                        self.setState({
                            showPassword: false,
                            waiting: false
                        });
                    },
                    onFail: function(data) {
                        opts.onError();
                    }
                },
                touch_socket;

            self.setState({
                waiting: true
            });

            touch_socket = touch(_opts).send(uuid, password);
        },

        _handleClose: function(e) {
            this.props.onClose();
        },

        // renders
        _renderPrinterSelection: function(lang) {
            var self = this,
                options = self.state.printOptions,
                content = (
                    <div className="device-wrapper">
                        <div className="device">
                            <div className="col device-name">{lang.device_selection.device_name}</div>
                            <div className="col module">{lang.device_selection.module}</div>
                            <div className="col status">{lang.device_selection.status}</div>
                        </div>
                        <ListView className="printer-list" items={options} ondblclick={self._selectPrinter}/>
                    </div>
                );

            return content;
        },

        _returnSelectedPrinter: function() {
            this.props.onGettingPrinter(this.selected_printer);
        },

        _renderAuthFailure: function(lang) {
            var lang = lang.select_printer;

            return (
                <div>
                    <p>{lang.auth_failure}</p>
                    <button className="btn btn-action btn-full-width sticky-bottom" onClick={this._goBackToPrinterList}>
                        {lang.retry}
                    </button>
                </div>
            );
        },

        _renderPrinterItem: function(printer) {
            var meta;

            try {
                meta = JSON.stringify(printer);
            }
            catch (ex) {
                console.log(ex, printer);
            }

            // TODO: convert st_id and head_module into plain text
            return (
                <label className="device printer-item" data-meta={meta}>
                    <input type="radio" name="printer-group" value={printer.uuid}/>
                    <div className="col device-name">{printer.name}</div>
                    <div className="col module">{printer.head_module || 'UNKNOWN'}</div>
                    <div className="col status">{printer.st_id || 'UNKNOWN'}</div>
                </label>
            );
        },

        _renderSpinner: function() {
            return (
                <div className="spinner-flip"/>
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

        render: function() {
            var self = this,
                lang = self.props.lang,
                showPassword = self.state.showPassword,
                cx = React.addons.classSet,
                wrapperClass = ['select-printer'],
                authFailure = self.state.authFailure,
                content = (
                    false === showPassword ?
                    self._renderPrinterSelection(lang) :
                    self._renderEnterPassword(lang)
                );

            if ('string' === typeof self.props.className) {
                wrapperClass.push(self.props.className);
            }

            wrapperClass = cx.apply(null, wrapperClass);

            if (true === authFailure) {
                content = self._renderAuthFailure(lang);
            }

            if (true === self.state.waiting) {
                content = self._renderSpinner();
            }

            return (
                <div className={wrapperClass}>
                    {content}
                    <svg className="arrow" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        width="36.8" height="20">
                        <polygon points="0,0 0,20 36.8,10"/>
                    </svg>
                </div>
            );
        },

        componentWillMount: function () {
            var self = this,
                options = [],
                refreshOption = function(options) {
                    options.forEach(function(el) {
                        el.label = self._renderPrinterItem(el);
                    });

                    self.setState({
                        printOptions: options,
                        loadFinished: true
                    });
                };

            self.setState({
                discoverMethods: discover(
                    'printer-selector',
                    function(printers) {
                        refreshOption(printers);
                    }
                )
            });
        },

        componentWillUnmount: function() {
            this.state.discoverMethods.removeListener('printer-selector');
        }
    });

    return View;
});
