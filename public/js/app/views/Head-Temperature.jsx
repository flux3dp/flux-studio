define([
    'react',
    'reactDOM',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/alert-actions'
], function(
    React,
    ReactDOM,
    i18n,
    Modal,
    Alert,
    DeviceMaster,
    DeviceConstants,
    AlertActions
) {
    'use strict';

    var lang = i18n.get(),
        view;

    view = React.createClass({

        getInitialState: function() {
            return {
                currentTemperature  : 0,
                enteredTemperature  : '',
                targetTemperature   : ''
            };
        },

        componentDidMount: function() {
            const checkToolhead = () => {
                DeviceMaster.headInfo().then((info) => {
                    if(info.TYPE === DeviceConstants.EXTRUDER) {
                        this._startReport();
                    }
                    else {
                        let message = lang.head_temperature.incorrect_toolhead;

                        if(info.head_module === null) {
                            message = lang.head_temperature.attach_toolhead;
                        }

                        AlertActions.showPopupError(
                            'HEAD-ERROR',
                            message
                        );
                        this.props.onClose();
                    }
                });
            };

            DeviceMaster.getReport().then(report => {
                this.operateDuringPause = report.st_id === 48;

                if(this.operateDuringPause) {
                    DeviceMaster.startToolheadOperation().then(() => {
                        this._startReport();
                    });
                }
                else {
                    DeviceMaster.enterMaintainMode().then(() => {
                        checkToolhead();
                    });
                }
            });
        },

        componentWillUnmount: function() {
            if(this.operateDuringPause) {
                DeviceMaster.endToolheadOperation();
            }
            else {
                DeviceMaster.quitTask();
            }
            clearInterval(this.report);
        },



        _startReport: function() {
            this.report = setInterval(() => {
                const getStatus = () => {
                    return this.operateDuringPause ? DeviceMaster.getReport() : DeviceMaster.getHeadStatus();
                };

                getStatus().then(status => {
                    if(status.rt) {
                        this.setState({ currentTemperature: Math.round(status.rt[0]) });
                    }
                });
            }, 1500);
        },

        _handleChangeTemperature: function(e) {
            this.setState({ enteredTemperature: e.target.value });
        },

        _handleSetTemperature: function(e) {
            e.preventDefault();
            let t = parseInt(this.state.enteredTemperature);

            if(t > 230) {
                t = 230;
            }
            else if(t < 60) {
                t = 60;
            }

            this.setState({ targetTemperature: t });
            ReactDOM.findDOMNode(this.refs.temperature).value = t;

            if(this.operateDuringPause) {
                DeviceMaster.setHeadTemperatureDuringPause(t);
            }
            else {
                DeviceMaster.setHeadTemperature(t);
            }
        },

        render: function() {
            let { currentTemperature, targetTemperature } = this.state,
                temperature, buttons, content, className;

            buttons = [
                {
                    label: lang.head_temperature.done,
                    className: 'btn-default btn-alone-right',
                    onClick: this.props.onClose
                }
            ];

            temperature = currentTemperature + (targetTemperature ? ` / ${targetTemperature}` : '');
            temperature += ' °C';

            content = (
                <div className="info">
                    <div className="section">
                        <div className="title">
                            <label>{lang.head_temperature.target_temperature}</label>
                        </div>
                        <div>
                            <input
                                type="number"
                                ref="temperature"
                                onChange={this._handleChangeTemperature}
                            />
                            <button className="btn-default" onClick={this._handleSetTemperature}>
                                {lang.head_temperature.set}
                            </button>
                        </div>
                    </div>
                    <div className="section">
                        <div className="title">
                            <label>{lang.head_temperature.current_temperature}</label>
                        </div>
                        <div>
                            <label className="temperature">
                                {temperature}
                            </label>
                        </div>
                    </div>
                </div>
            );

            content = (
                <Alert
                    lang={lang}
                    caption={lang.head_temperature.title}
                    message={content}
                    buttons={buttons}
                />
            );

            className = {
                'modal-change-filament': true,
                'shadow-modal': true,
                'head-temperature': true
            };

            return (
                <div className="always-top head-temperature" ref="modal">
                    <Modal
                        className={className}
                        content={content}
                        disabledEscapeOnBackground={false}
                    />
                </div>
            );
        }

    });

    return view;
});
