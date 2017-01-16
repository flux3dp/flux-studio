define([
    'react',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'helpers/device-master',
], function(
    React,
    i18n,
    Modal,
    Alert,
    DeviceMaster
) {
    'use strict';

    var lang = i18n.get(),
        view;

    view = React.createClass({

        getInitialState: function() {
            return {
                currentTemperature  : 0,
                targetTemperature   : lang.head_temperature.target_temperature
            };
        },

        componentDidMount: function() {
            DeviceMaster.selectDevice(this.props.device).then(() => {
                DeviceMaster.enterMaintainMode();
                this._getDeviceStatus();
            });
        },

        componentWillUnmount: function() {
            DeviceMaster.quitTask();
            clearInterval(this.report);
        },

        _getDeviceStatus: function() {
            this.report = setInterval(() => {
                DeviceMaster.getHeadStatus().then((status) => {
                    if(status.rt) {
                        this.setState({ currentTemperature: parseInt(status.rt[0]) });
                    }
                });
            }, 1500);
        },

        _handleChangeTemperature: function(e) {
            let targetTemperature = e.target.value
            clearTimeout(this.setTemperature);
            this.setTemperature = setTimeout(() => {
                this.setState({
                    targetTemperature
                });
                DeviceMaster.setHeadTemperature(targetTemperature);
            }, 1500);
        },

        render: function() {
            var { currentTemperature, targetTemperature } = this.state,
                buttons, content, className,
                status = '';

            buttons = [
                {
                    label: lang.head_temperature.done,
                    className: 'btn-default btn-alone-right',
                    onClick: this.props.onClose
                }
            ];

            if(parseInt(currentTemperature) && parseInt(targetTemperature)) {
                console.log(currentTemperature, targetTemperature);
                status = currentTemperature == targetTemperature ?
                    ''
                    :
                    `(${lang.head_temperature.working})`;
            };

            content = (
                <div className="info">
                    <div className="section">
                        <div className="title">
                            <label>{lang.head_temperature.target_temperature}</label>
                        </div>
                        <div>
                            <input
                                type="number"
                                onChange={this._handleChangeTemperature}
                            />
                        </div>
                    </div>
                    <div className="section">
                        <div className="title">
                            <label>{lang.head_temperature.current_temperature}</label>
                        </div>
                        <div>
                            <label className="temperature">
                                {`${currentTemperature} / ${targetTemperature} ${status}`}
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
