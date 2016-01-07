define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/shortcuts',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/alert-actions',
    'app/stores/alert-store'
], function(
    $,
    React,
    i18n,
    shortcuts,
    Modal,
    Alert,
    DeviceMaster,
    DeviceConstants,
    AlertActions,
    AlertStore
) {
    'use strict';

    var lang = i18n.get(),
        steps = {
            HOME      : 'HOME',
            GUIDE     : 'GUIDE',
            HEATING   : 'HEATING',
            EMERGING  : 'EMERGING',
            UNLOADING : 'UNLOADING',
            COMPLETED : 'COMPLETED'
        },
        View = React.createClass({

            propTypes: {
                open    : React.PropTypes.bool,
                device  : React.PropTypes.object,
                src     : React.PropTypes.string,
                onClose : React.PropTypes.func
            },

            getDefaultProps: function() {
                return {
                    open    : false,
                    device  : {},
                    onClose : function() {}
                };
            },

            getInitialState: function() {
                return {
                    type: this.props.src === 'TUTORIAL' ? DeviceConstants.LOAD_FILAMENT : '',
                    currentStep: this.props.src === 'TUTORIAL' ? steps.GUIDE : steps.HOME,
                    temperature: 20
                };
            },

            componentWillUpdate: function(nextProps, nextState) {
                if (true === nextProps.open && false === this.props.open) {
                    this.setState(this.getInitialState());
                }
            },

            componentDidMount: function() {
                if (true === this.props.open) {
                    DeviceMaster.selectDevice(this.props.device).then(function(status) {
                        if (status !== DeviceConstants.CONNECTED) {
                            // alert and close
                            AlertActions.showPopupError('change-filament', status);
                        }
                    });

                    AlertStore.onCancel(this._onCancel);
                }
            },

            componentWillUnmount: function() {
                DeviceMaster.quitTask();
                AlertStore.removeCancelListener(this._onCancel);
            },

            shouldComponentUpdate: function(nextProps, nextState) {
                if (steps.HEATING === nextState.currentStep && steps.HEATING !== this.state.currentStep) {
                    this._goMaintain(nextState.type);
                }

                return true;
            },

            _onCancel: function(id) {
                if(id !== 'change-filament-device-error' && id !== 'change-filament-zombie') {
                    this._onClose();
                }
            },

            _goMaintain: function(type) {
                var self = this,
                    nextStep = (self.state.type === DeviceConstants.LOAD_FILAMENT ? steps.EMERGING : steps.UNLOADING),
                    progress = function(response) {
                        switch (response.nav) {
                        case 'WAITTING':
                        case 'WAITING':
                        case 'LOADING':
                            self._next(steps.EMERGING);
                            break;
                        case 'UNLOADING':
                            self._next(steps.UNLOADING);
                            break;
                        default:
                            // update temperature
                            self.setState({
                                temperature: parseFloat(response.nav.replace('HEATING ', ''), 10)
                            });
                            break;
                        }
                    },
                    done = function(response) {
                        DeviceMaster.quitTask().done(function() {
                            self._next(steps.COMPLETED);
                        });
                    };

                DeviceMaster.selectDevice(this.props.device).then(function() {
                    DeviceMaster.maintain(type).progress(progress).done(done).fail(function(response) {
                        if ('RESOURCE_BUSY' === response.error) {
                            AlertActions.showDeviceBusyPopup('change-filament-device-busy');
                        }
                        else if (response.info === 'TYPE_ERROR') {
                            AlertActions.showPopupError('change-filament-device-error', lang.change_filament.maintain_head_type_error);
                            DeviceMaster.quitTask().then(function() {
                                self.setState({ currentStep: steps.GUIDE });
                            });
                        }
                        else if ('UNKNOWN_COMMAND' === response.error) {
                            AlertActions.showDeviceBusyPopup('change-filament-zombie', lang.change_filament.maintain_zombie);
                        }
                        else {
                            AlertActions.showPopupError('change-filament-device-error', response.error);
                        }
                    });
                });
            },

            _onClose: function(e) {
                this.props.onClose(e);
                React.unmountComponentAtNode(this.refs.modal.getDOMNode().parentNode);
            },

            _next: function(nextStep, type) {
                if(nextStep !== this.state.currentStep) {
                    this.setState({
                        type: type || this.state.type,
                        currentStep: nextStep
                    });
                }
            },

            _makeCaption: function(caption) {
                if ('undefined' === typeof caption) {
                    caption = (
                        DeviceConstants.LOAD_FILAMENT === this.state.type ?
                        lang.change_filament.load_filament :
                        lang.change_filament.unload_filament
                    );
                }

                return caption + ' - ' + (this.props.device.name || '');
            },

            // sections
            _sectionHome: function() {
                return {
                    caption: lang.change_filament.home_caption,
                    message: (
                        <div className="way-to-go">
                            <button
                                className="btn btn-default"
                                data-ga-event="load-filament"
                                onClick={this._next.bind(null, steps.GUIDE, DeviceConstants.LOAD_FILAMENT)}
                            >
                                {lang.change_filament.load_filament_caption}
                            </button>
                            <button
                                className="btn btn-default"
                                data-ga-event="unload-filament"
                                onClick={this._next.bind(null, steps.HEATING, DeviceConstants.UNLOAD_FILAMENT)}
                            >
                                {lang.change_filament.unload_filament_caption}
                            </button>
                        </div>
                    ),
                    buttons: [{
                        label: lang.change_filament.cancel,
                        className: 'btn-default btn-alone-left',
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this.props.onClose
                    }]
                };
            },

            _sectionGuide: function() {
                var activeLang = i18n.getActiveLang(),
                    imageSrc = (
                        'en' === activeLang ?
                        '/img/insert-filament-en.png' :
                        '/img/insert-filament-zh-tw.png'
                    );

                return {
                    message: (
                        <img className="guide-image" src={imageSrc}/>
                    ),
                    buttons: [{
                        label: lang.change_filament.cancel,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this.props.onClose
                    },
                    {
                        label: lang.change_filament.next,
                        dataAttrs: {
                            'ga-event': 'heatup'
                        },
                        onClick: this._next.bind(null, steps.HEATING, '')
                    }]
                };
            },

            _sectionHeating: function() {
                var self = this,
                    temperature = this.state.temperature + '°C';

                return {
                    message: (
                        <div className="message-container">
                            <p className="temperature">
                                <span>{lang.change_filament.heating_nozzle}</span>
                                <span>{temperature} / 220°C</span>
                            </p>
                            <div className="spinner-roller spinner-roller-reverse"/>
                        </div>
                    ),
                    buttons: []
                };
            },

            _sectionEmerging: function() {
                var self = this,
                    activeLang = i18n.getActiveLang(),
                    imageSrc;

                imageSrc = (
                    'en' === activeLang ?
                    '/img/press-to-accelerate-en.png' :
                    '/img/press-to-accelerate-zh-tw.png'
                );

                return {
                    message: (
                        <div className="message-container">
                            <img className="guide-image" src={imageSrc}/>
                        </div>
                    ),
                    buttons: [{
                        label: 'ok',
                        className: 'btn-default btn-alone-right',
                        onClick: function(e) {
                            self.setState({
                                type: type || this.state.type,
                                currentStep: steps.COMPLETED
                            });
                        }
                    },
                    {
                        label: [
                            <span className="auto-emerging">{lang.change_filament.auto_emerging}</span>,
                            <div className="spinner-roller spinner-roller-reverse"/>
                        ],
                        type: 'icon',
                        className: 'btn-icon',
                        onClick: function(e) {
                            e.preventDefault();
                        }
                    }]
                };
            },

            _sectionUnloading: function() {
                var self = this;

                return {
                    message: (
                        <div className="message-container">
                            <p>{lang.change_filament.unloading}</p>
                            <div className="spinner-roller spinner-roller-reverse"/>
                        </div>
                    ),
                    buttons: []
                };
            },

            _sectionCompleted: function() {
                var messageText = (
                    DeviceConstants.LOAD_FILAMENT === this.state.type ?
                    lang.change_filament.loaded :
                    lang.change_filament.unloaded
                );

                return {
                    message: (
                        <div className="message-container">{messageText}</div>
                    ),
                    buttons: [{
                        label: lang.change_filament.ok,
                        className: 'btn-default btn-alone-right',
                        dataAttrs: {
                            'ga-event': 'completed'
                        },
                        onClick: this.props.onClose
                    }]
                };
            },

            _sectionFactory: function() {
                var self = this,
                    renderFunc,
                    renderName = this.state.currentStep.toLowerCase().split('');

                renderName[0] = renderName[0].toUpperCase();
                renderName = '_section' + renderName.join('').replace('_', '');

                if (true === self.hasOwnProperty(renderName)) {
                    renderFunc = self[renderName];
                }
                else {
                    renderFunc = function() {
                        return {
                            buttons: [{
                                label: lang.change_filament.cancel,
                                className: 'btn-default btn-alone-left',
                                dataAttrs: {
                                    'ga-event': 'cancel'
                                },
                                onClick: self.props.onClose
                            }]
                        };
                    }
                }

                return renderFunc();
            },

            render: function() {
                if(false === this.props.open) {
                    return (<div/>);
                }

                var section = this._sectionFactory(),
                    content = (
                        <Alert
                            lang={lang}
                            caption={this._makeCaption(section.caption)}
                            message={section.message}
                            buttons={section.buttons}
                        />
                    ),
                    className = {
                        'modal-change-filament': true,
                        'shadow-modal': true
                    };

                return (
                    <div className="always-top" ref="modal">
                        <Modal className={className} content={content} disabledEscapeOnBackground={false}/>
                    </div>
                );
            }

        });

    return View;
});
