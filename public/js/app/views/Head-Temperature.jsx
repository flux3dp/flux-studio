define([
    'react',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'helpers/device-master',
    'app/constants/device-constants',
    'helpers/check-device-status',
    'app/actions/alert-actions'
], function(
    React,
    i18n,
    Modal,
    Alert,
    DeviceMaster,
    DeviceConstants,
    CheckDeviceStatus,
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
                        AlertActions.showPopupError(
                            'HEAD-ERROR',
                            lang.head_temperature.incorrect_toolhead
                        );
                        this.props.onClose();
                    }
                });
            };

            CheckDeviceStatus(this.props.device).then((status, stId) => {
                this.stId = stId;
                if(stId !== 48) {
                    DeviceMaster.enterMaintainMode().then(() => {
                        checkToolhead();
                    });
                }
                else {
                    checkToolhead();
                }
            });
        },

        componentWillUnmount: function() {
            if(this.stId !== 48) {
                DeviceMaster.quitTask();
            }
            clearInterval(this.report);
        },

        _startReport: function() {
            this.report = setInterval(() => {
                DeviceMaster.getHeadStatus().then((status) => {
                    if(status.rt) {
                        this.setState({ currentTemperature: parseInt(status.rt[0]) });
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
            this.refs.temperature.getDOMNode().value = t;

            if(this.stId === 48) {
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
