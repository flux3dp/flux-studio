define([
    'react',
    'jquery',
    'jsx!widgets/Select',
    'jsx!widgets/List',
    'helpers/api/discover',
    'helpers/device-master',
    'helpers/i18n',
    'helpers/api/touch',
    'helpers/api/config',
    'app/constants/device-constants',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/initialize-machine',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants'
], function(
    React,
    $,
    SelectView,
    ListView,
    discover,
    DeviceMaster,
    i18n,
    touch,
    config,
    DeviceConstants,
    AlertActions,
    AlertStore,
    initializeMachine,
    ProgressActions,
    ProgressConstants,
    InputLightboxActions,
    InputLightboxConstants
) {
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
                uniqleId: '',
                lang: i18n.get(),
                className: '',
                onGettingPrinter: function() {},
                onClose: function() {}
            };
        },

        getInitialState: function() {
            return {
                discoverId: 'printer-selector-' + (this.props.uniqleId || ''),
                printOptions: [],
                loadFinished: false,
                hadDefaultPrinter: ('string' === typeof initializeMachine.defaultPrinter.get().uuid),
                discoverMethods: {}
            };
        },

        componentDidMount: function() {
            var selectedPrinter = initializeMachine.defaultPrinter.get(),
                self = this,
                lang = self.props.lang,
                _options = [],
                refreshOption = function(options) {
                    _options = [];
                    window.printers = options;

                    options.forEach(function(el) {
                        _options.push({
                            label: self._renderPrinterItem(el)
                        });

                        if (true === self.hadDefaultPrinter && el.uuid === selectedPrinter.uuid) {
                            // update device stat
                            initializeMachine.defaultPrinter.set({
                                serial: el.serial,
                                uuid: el.uuid
                            });
                        }
                    });

                    self.setState({
                        printOptions: _options,
                        loadFinished: true
                    }, function() {
                        self._openAlertWithnoPrinters();
                    });
                };

            if (true === this.state.hadDefaultPrinter) {
                this._selectPrinter(selectedPrinter);
            }

            AlertStore.onRetry(this._waitForPrinters);
            AlertStore.onYes(this._onYes);
            AlertStore.onCancel(this._onCancel);

            self.setState({
                discoverMethods: discover(
                    self.state.discoverId,
                    function(printers) {
                        refreshOption(printers);
                    }
                )
            });

            self._waitForPrinters();
        },

        componentWillUnmount: function() {
            if ('function' === typeof this.state.discoverMethods.removeListener) {
                this.state.discoverMethods.removeListener(this.state.discoverId);
            }

            AlertStore.removeRetryListener(this._waitForPrinters);
            AlertStore.removeYesListener(this._onYes);
            AlertStore.removeCancelListener(this._onCancel);
        },

        _onYes: function(id) {
            var self = this;

            switch (id) {
            case 'kick':
                DeviceMaster.kick().done(function() {
                    self._returnSelectedPrinter();
                });
                break;
            case 'abort':
                DeviceMaster.stop().done(function() {
                    self._returnSelectedPrinter();
                });
                break;
            }
        },

        _onCancel: function(id) {
            switch (id) {
            case 'no-printer':
            case 'printer-connection-timeout':
                this._handleClose();
                break;
            default:
                break;
            }
        },

        _selectPrinter: function(printer, e) {
            var self = this,
                lang = self.props.lang,
                onError = function() {
                    ProgressActions.close();
                    InputLightboxActions.open('auth-device', {
                        type         : InputLightboxConstants.TYPE_PASSWORD,
                        caption      : lang.select_printer.notification,
                        inputHeader  : lang.select_printer.please_enter_password,
                        confirmText  : lang.select_printer.submit,
                        onSubmit     : function(password) {
                            ProgressActions.open(ProgressConstants.NONSTOP);

                            self._auth(printer.uuid, password, {
                                onError: function() {
                                    AlertActions.showPopupError('device-auth-fail', lang.select_printer.auth_failure);
                                }
                            });
                        }
                    });
                },
                opts = {
                    onError: onError
                };

            self.selected_printer = printer;

            switch (printer.st_id) {
            // null for simulate
            case null:
            // null for not found default device
            case undefined:
            case DeviceConstants.status.IDLE:
                // no problem
                self._auth(printer.uuid, '', opts);
                break;
            case DeviceConstants.status.SCAN:
            case DeviceConstants.status.MAINTAIN:
                // ask kick?
                AlertActions.showPopupYesNo('kick', lang.message.device_is_used);
                break;
            case DeviceConstants.status.COMPLETED:
            case DeviceConstants.status.ABORTED:
                // quit
                DeviceMaster.selectDevice(self.selected_printer).then(function() {
                    DeviceMaster.quit().done(function() {
                        self._returnSelectedPrinter();
                    });
                });
                break;
            case DeviceConstants.status.RUNNING:
            case DeviceConstants.status.PAUSED:
            case DeviceConstants.status.PAUSED_FROM_STARTING:
            case DeviceConstants.status.PAUSED_FROM_RUNNING:
                // ask for abort
                AlertActions.showPopupYesNo('abort', lang.message.device_is_used);
                break;
            default:
                // device busy
                AlertActions.showDeviceBusyPopup('on-select-printer');
                break;
            }
        },

        _auth: function(uuid, password, opts) {
            ProgressActions.open(ProgressConstants.NONSTOP);
            opts = opts || {};
            opts.onError = opts.onError || function() {};

            var self = this,
                _opts = {
                    onSuccess: function(data) {
                        ProgressActions.close();
                        self._returnSelectedPrinter();
                    },
                    onFail: function(data) {
                        ProgressActions.close();
                        opts.onError();
                    }
                },
                touch_socket;

            touch_socket = touch(_opts).send(uuid, password);
        },

        _handleClose: function(e) {
            this.props.onClose();
        },

        // renders
        _renderPrinterSelection: function(lang) {
            var self = this,
                printOptions = self.state.printOptions,
                options = (0 < printOptions.length ? printOptions : [{
                    label: (
                        <div className="spinner-roller spinner-roller-reverse"/>
                    )
                }]),
                content = (
                    <div className="device-wrapper">
                        <ListView className="printer-list" items={options}/>
                    </div>
                );

            return content;
        },

        _returnSelectedPrinter: function() {
            var self = this,
                lang = this.props.lang;

            if ('00000000000000000000000000000000' === self.selected_printer.uuid) {
                self.props.onGettingPrinter(self.selected_printer);
            }
            else {
                DeviceMaster.selectDevice(self.selected_printer).done(function(status) {
                    if (status === DeviceConstants.CONNECTED) {
                        self.props.onGettingPrinter(self.selected_printer);
                    }
                    else if (status === DeviceConstants.TIMEOUT) {
                        AlertActions.showPopupError('printer-connection-timeout', lang.message.connectionTimeout);
                    }
                });
            }

        },

        _renderPrinterItem: function(printer) {
            var meta,
                lang = this.props.lang,
                status = lang.machine_status,
                headModule = lang.head_module,
                statusText = status[printer.st_id] || status.UNKNOWN,
                headText = headModule[printer.head_module] || headModule.UNKNOWN;

            if (DeviceConstants.status.RUNNING === printer.st_id && 'number' === typeof printer.st_prog) {
                statusText += ' - ' + (parseInt(printer.st_prog * 1000) * 0.1).toFixed(1) + '%';
            }

            try {
                meta = JSON.stringify(printer);
            }
            catch (ex) {
                console.log(ex, printer);
            }

            return (
                <div className="device printer-item" data-meta={meta} onClick={this._selectPrinter.bind(null, printer)}>
                    <div className="col device-name">{printer.name}</div>
                    <div className="col module">{headText}</div>
                    <div className="col status">{statusText}</div>
                </div>
            );
        },

        render: function() {
            var self = this,
                lang = self.props.lang,
                showPassword = self.state.showPassword,
                cx = React.addons.classSet,
                wrapperClass = ['select-printer'],
                content = self._renderPrinterSelection(lang),
                hadDefaultPrinter = self.state.hadDefaultPrinter;

            if ('string' === typeof self.props.className) {
                wrapperClass.push(self.props.className);
            }

            wrapperClass = cx.apply(null, wrapperClass);

            return (
                true === hadDefaultPrinter ?
                <span/> :
                <div className={wrapperClass}>
                    {content}
                    <div className="arrow arrow-right"/>
                </div>
            );
        },

        _waitForPrinters: function() {
            setTimeout(this._openAlertWithnoPrinters, 5000);
        },

        _openAlertWithnoPrinters: function() {
            var lang = this.props.lang;

            if (0 === this.state.printOptions.length && false === this.state.hadDefaultPrinter) {
                AlertActions.showPopupRetry('no-printer', lang.device_selection.no_printers);
            }
        }
    });

    return View;
});
