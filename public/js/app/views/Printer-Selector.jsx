define([
    'react',
    'reactPropTypes',
    'reactClassset',
    'jquery',
    'jsx!widgets/List',
    'helpers/api/discover',
    'helpers/device-master',
    'helpers/i18n',
    'helpers/api/touch',
    'app/constants/device-constants',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/initialize-machine',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants',
    'helpers/sprintf',
    'helpers/check-device-status',
    'helpers/device-list'
], function(
    React,
    PropTypes,
    ReactCx,
    $,
    ListView,
    Discover,
    DeviceMaster,
    i18n,
    Touch,
    DeviceConstants,
    AlertActions,
    AlertStore,
    InitializeMachine,
    ProgressActions,
    ProgressConstants,
    InputLightboxActions,
    InputLightboxConstants,
    sprintf,
    CheckDeviceStatus,
    DeviceList
) {
    'use strict';
    const lang = i18n.lang;
    var View = React.createClass({
        displayName: 'PrinterSelection',
        selected_printer: null,

        propTypes: {
            showExport: PropTypes.bool,
            modelFilter: PropTypes.string,
            onClose: PropTypes.func,
            onGettingPrinter: PropTypes.func
        },

        getDefaultProps: function() {
            return {
                uniqleId: '',
                className: '',
                modelFilter: '',
                forceAuth: false,
                onGettingPrinter: function() {},
                onUnmount: function() {},
                onClose: function() {},
                arrowDirection: 'right' //'left'
            };
        },

        getInitialState: function() {
            let modelFilter = this.props.modelFilter.split(','),
                hasDefaultPrinter = InitializeMachine.defaultPrinter.exist() && !this.props.bypassDefaultPrinter;


            const defaultPrinter = InitializeMachine.defaultPrinter.get();
            
            if (modelFilter.length > 0 && defaultPrinter.model) {
                // If the model of defaultPrinter is not in the whitelist
                if (modelFilter.indexOf(defaultPrinter.model) <= 0) {
                    hasDefaultPrinter = false;
                }
            }

            return {
                discoverId          : 'printer-selector-' + (this.props.uniqleId || ''),
                devices             : [],
                loadFinished        : false,
                modelFilter         : modelFilter,
                hasDefaultPrinter   : hasDefaultPrinter,
                discoverMethods     : {},
                componentReady      : false
            };
        },

        componentDidMount: function() {
            var selectedPrinter = InitializeMachine.defaultPrinter.get(),
                self = this,
                currentPrinter,
                _options = [],
                refreshOption = function(options) {
                    _options = [];

                    options.forEach(function(el) {
                        _options.push({
                            label: self._renderPrinterItem(el)
                        });

                        if (
                            true === self.hasDefaultPrinter &&
                            el.uuid === selectedPrinter.uuid &&
                            this.props.bypassDefaultPrinter !== true
                        ) {
                            // update device stat
                            InitializeMachine.defaultPrinter.set({
                                name: el.name,
                                serial: el.serial,
                                uuid: el.uuid
                            });
                        }
                    });

                    if (self.props.showExport) {
                        _options.push({
                            label: self._renderExportItem()
                        });
                    }

                    self.setState({
                        devices: _options,
                        loadFinished: true
                    }, function() {
                        self._openAlertWithnoPrinters();
                    });
                };

            AlertStore.onCancel(self._onCancel);

            const existWifiAndUsbConnection = (serial) => {
                let devices = DeviceMaster.getAvailableDevices(),
                    num = 0;

                devices.map(device => {
                    if(device.serial === serial) {
                        num++;
                    }
                });

                return num >= 2;
            };

            const next = (status, preferredDevice) => {
                console.trace("Calling Printer-Selector Next");
                if(preferredDevice) {
                    selectedPrinter = preferredDevice;
                }
                self.setState({
                    discoverMethods: Discover(
                        self.state.discoverId,
                        function(printers) {
                            printers = DeviceList(printers);
                            refreshOption(printers);
                        }
                    )
                }, function() {
                    var timer,
                        tryTimes = 20,
                        selectDefaultDevice = function() {
                            if (self.state.hasDefaultPrinter) {
                                if (currentPrinter) {
                                    self._selectPrinter(selectedPrinter);
                                    clearInterval(timer);
                                }
                                else {
                                    tryTimes--;
                                }
                            }

                            if (0 > tryTimes) {
                                clearInterval(timer);
                                if(self.state.devices.length === 0) {
                                    AlertActions.showPopupError('device-not-found', lang.message.device_not_found.message, lang.message.device_not_found.caption);
                                }
                                else {
                                    self.setState({
                                        loadFinished: false,
                                        hasDefaultPrinter: false
                                    });
                                }
                            }
                        };

                    currentPrinter = self.state.discoverMethods.getLatestPrinter(selectedPrinter);

                    timer = setInterval(selectDefaultDevice, 100);
                });

                self._waitForPrinters();
            };

            //check for default printer availablity
            let defaultDeviceExists = DeviceMaster.existDevice(selectedPrinter.serial);

            const noDefaultPrinter = () => {
                self.setState({
                    loadFinished: false,
                    hasDefaultPrinter: false
                }, next);
            };

            if (defaultDeviceExists && 
                (this.state.modelFilter.length === 0 || 
                 this.state.modelFilter.indexOf(selectedPrinter.model) >= 0)) {
                let existBothConnection = existWifiAndUsbConnection(selectedPrinter.serial);
                if (existBothConnection) {
                    noDefaultPrinter();
                } else {
                    DeviceMaster.selectDevice(selectedPrinter)
                    .then(next)
                    .fail(noDefaultPrinter);
                }
            } else {
                noDefaultPrinter();
            }
        },

        componentWillUnmount: function() {
            if ('function' === typeof this.state.discoverMethods.removeListener) {
                this.state.discoverMethods.removeListener(this.state.discoverId);
            }

            AlertStore.removeCancelListener(this._onCancel);
            if(this.props.onUnmount) {
                this.props.onUnmount();
            }

            clearTimeout(this._noPrinterAlertTimeout);
        },

        _onCancel: function(id) {
            this.setState({ processing: false });
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
            this.setState({ processing: true });
            var self = this,
                onError;

            ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.initialize.connecting);
            onError = function() {
                ProgressActions.close();
                if(self.selected_printer.plaintext_password) {
                    //Skip if user entered password for the first time.
                    self._returnSelectedPrinter();
                }
                else {
                    InputLightboxActions.open('auth-device', {
                        type         : InputLightboxConstants.TYPE_PASSWORD,
                        caption      : sprintf(lang.select_printer.notification, printer.name),
                        inputHeader  : lang.select_printer.please_enter_password,
                        confirmText  : lang.select_printer.submit,
                        onSubmit     : function(password) {
                            printer.plaintext_password = password;
                            ProgressActions.open(ProgressConstants.NONSTOP);

                            self._auth(printer.uuid, password, {
                                onError: function(response) {
                                    var message = (
                                        false === response.reachable ?
                                        lang.select_printer.unable_to_connect :
                                        lang.select_printer.auth_failure
                                    );

                                    ProgressActions.close();

                                    AlertActions.showPopupError('device-auth-fail', message);
                                }
                            });
                        }
                    });
                }
            };

            printer = DeviceMaster.usbDefaultDeviceCheck(printer);
            self.selected_printer = printer;

            if ('00000000000000000000000000000000' === self.selected_printer.uuid) {
                self._returnSelectedPrinter();
            }
            else {
                DeviceMaster.selectDevice(self.selected_printer).done((status) => {
                    if (status === DeviceConstants.CONNECTED) {
                        printer = self.selected_printer;
                        ProgressActions.open(ProgressConstants.NONSTOP);

                        const next = () => {
                            ProgressActions.close();
                            if (true === self.props.forceAuth && true === printer.password) {
                                onError();
                                return;
                            }

                            self._returnSelectedPrinter();
                        };

                        if(this.props.bypassCheck === true) {
                            next();
                        }
                        else {
                            CheckDeviceStatus(printer).done(next);
                        }
                    }
                    else if (status === DeviceConstants.TIMEOUT) {
                        // TODO: Check default printer
                        if (self.state.hasDefaultPrinter) {
                            AlertActions.showPopupError(
                                'printer-connection-timeout',
                                sprintf(lang.message.device_not_found.message, self.selected_printer.name),
                                lang.message.device_not_found.caption
                            );
                        }
                        else {
                            AlertActions.showPopupError('printer-connection-timeout', lang.message.connectionTimeout, lang.caption.connectionTimeout);
                        }
                    }
                }).always(() => {
                    ProgressActions.close();
                }).fail((status) => {
                    AlertActions.showPopupError('fatal-occurred', status);
                });
            }
        },

        _auth: function(uuid, password, opts) {
            ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.initialize.connecting);
            opts = opts || {};
            opts.onError = opts.onError || function() {};

            var self = this,
                _opts;

            _opts = {
                onSuccess: function(data) {
                    ProgressActions.close();
                    self._returnSelectedPrinter();
                },
                onFail: function(data) {
                    ProgressActions.close();
                    opts.onError(data);
                },
                checkPassword: self.props.forceAuth
            };

            Touch(_opts).send(uuid, password);
        },

        _handleClose: function(e) {
            this.props.onClose();
        },

        // renders
        _renderPrinterSelection: function() {
            let devices = this.state.devices;
            if (this.state.modelFilter.length > 0) {
                devices = devices.filter((v) => this.state.modelFilter.indexOf(v.label.props['data-model'])>=0);
            }
            let options = (0 < devices.length ? devices : [{
                    label: (
                        <div className="spinner-roller spinner-roller-reverse"/>
                    )
                }]),
                content = (
                    <div className="device-wrapper">
                        <ListView className="printer-list" items={options}/>
                    </div>
                );
            if(this.state.processing) {
                content = (
                    <div className="spinner-roller invert"/>
                );
            }

            return content;
        },

        _returnSelectedPrinter: function() {
            var self = this;

            self.props.onGettingPrinter(self.selected_printer);
        },

        _waitForPrinters: function() {
            this._noPrinterAlertTimeout = setTimeout(this._openAlertWithnoPrinters, 5000);
        },

        _openAlertWithnoPrinters: function() {
            var self = this;

            AlertStore.removeRetryListener(self._waitForPrinters);

            // if (self.state.devices.length === 0 && !self.state.hasDefaultPrinter) {
            //     AlertActions.showPopupRetry('no-printer', lang.device_selection.no_printers);
            //     AlertStore.onRetry(self._waitForPrinters);
            // }
        },

        _renderPrinterItem: function(printer) {
            var meta,
                status = lang.machine_status,
                headModule = lang.head_module,
                statusId = 'st' + printer.st_id,
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

            let img = `img/icon_${printer.source === 'h2h' ? 'usb' : 'wifi' }.svg`;

            return (
                <div className="device printer-item" id={printer.name} data-model={printer.model} data-status={statusId} data-meta={meta} onClick={this._selectPrinter.bind(null, printer)}>
                    <div className="col device-name" id={printer.name}>{printer.name}</div>
                    <div className="col module">{headText}</div>
                    <div className="col status">{statusText}</div>
                    <div className="col connection-type">
                        <img src={img} />
                    </div>
                </div>
            );
        },

        _renderExportItem: function(printer) {

            return (
                <div className="device printer-item" id={"export-item"} data-status={0} data-meta={0} onClick={() => {this.props.onGettingPrinter("export_fcode")} }>
                    <div className="col device-name" id={"export-item-name"}><i className="fa fa-save"></i>&nbsp;&nbsp;{lang.laser.export_fcode}</div>
                    <div className="col module"></div>
                    <div className="col status"></div>
                    <div className="col connection-type">
                    </div>
                </div>
            );
        },

        render: function() {
            var self = this,
                showPassword = self.state.showPassword,
                wrapperClass = {'select-printer': true},
                wrapperStyle = self.props.WindowStyle,
                content = self._renderPrinterSelection(lang),
                hasDefaultPrinter = self.state.hasDefaultPrinter;

            if (self.props.className) {
                wrapperClass[self.props.className] = true;
            }
            wrapperClass = ReactCx.cx(wrapperClass);

            const arrowClass = `arrow arrow-${this.props.arrowDirection}`;

            return (
                true === hasDefaultPrinter ?
                <span/> :
                <div className={wrapperClass} style={wrapperStyle}>
                    {content}
                    <div className={arrowClass}/>
                </div>
            );
        }

    });

    View.BEAMBOX_FILTER = "laser-b1,laser-b2,fbb1b,fbb1p";
    View.DELTA_FILTER = "delta-1,delta-1p";
    return View;
});
