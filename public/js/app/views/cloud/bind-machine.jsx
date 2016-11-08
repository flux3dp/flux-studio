define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/device-master',
    'helpers/device-list',
    'helpers/pad-string',
    'plugins/classnames/index',
    'helpers/api/cloud'
], function(
    $,
    React,
    i18n,
    DeviceMaster,
    DeviceList,
    PadString,
    ClassNames,
    CloudApi
) {
    'use strict';

    return React.createClass({

        lang: {},

        getInitialState: function() {
            return {
                selectedDevice: {},
                bindingInProgress: false,
                me: {}
            };
        },

        componentWillMount: function() {
            this.lang = i18n.get();
        },

        componentDidMount: function() {
            let lang = this.props.lang.settings.flux_cloud;
            let getList = () => {
                let deviceList = DeviceList(DeviceMaster.getDeviceList());
                this.setState({ deviceList });
            }

            getList();

            setInterval(() => {
                getList();
            }, 2000);

            CloudApi.getMe().then(response => {
                if(response.ok) {
                    response.json().then(content => {
                        this.setState({ me: content });
                        if(content.needPasswordReset) {
                            location.hash = '#/studio/cloud/change-password';
                        }
                    });
                }
            });
        },

        _handleSelectDevice: function(device) {
            // console.log(device);
            this.setState({ selectedDevice: device});
        },

        _handleCancel: function() {
            location.hash = '#/studio/print';
        },

        _handleCancelBinding: function() {
            this.setState({ bindingInProgress: false });
        },

        _handleBind: function() {
            this.setState({ bindingInProgress: true });
            DeviceMaster.selectDevice(this.state.selectedDevice).then((status) => {
                // console.log(status);
                if(status === 'TIMEOUT') {
                    location.hash = '#/studio/cloud/bind-fail';
                }
                else {
                    return DeviceMaster.getCloudValidationCode();
                }
            }).then((response) => {
                // console.log(response);
                let { token, signature } = response.code,
                    { uuid } = this.state.selectedDevice,
                    accessId = response.code.access_id;

                signature = encodeURIComponent(signature);

                DeviceMaster.enableCloud().then(function(r) {
                    if(r.status === 'ok') {
                        CloudApi.bindDevice(uuid, token, accessId, signature).then(r => {
                            if(r.ok) {
                                this.setState({ bindingInProgress: false });
                                location.hash = '#/studio/cloud/bind-success';
                            }
                            else {
                                location.hash = '#/studio/cloud/bind-fail';
                            }
                        });
                    }
                    else {
                        location.hash = '#/studio/cloud/bind-fail';
                    }
                });
            });
        },

        _renderBindingWindow: function() {
            let lang = this.props.lang.settings.flux_cloud,
                bindingWindow;

            bindingWindow = (
                <div className="binding-window">
                    <h1>{lang.binding}</h1>
                    <div className="spinner-roller absolute-center"></div>
                    <div className="footer">
                        <a onClick={this._handleCancelBinding}>{lang.cancel}</a>
                    </div>
                </div>
            )

            return this.state.bindingInProgress ? bindingWindow : '';
        },

        _renderBlind: function() {
            let blind = (
                <div className="blind"></div>
            );

            return this.state.bindingInProgress ? blind : '';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud,
                deviceList,
                bindingWindow,
                blind;

            bindingWindow = this._renderBindingWindow();
            blind = this._renderBlind();

            if(!this.state.deviceList) {
                deviceList = <div>{this.lang.device.please_wait}</div>;
            }
            else {
                deviceList = this.state.deviceList.map((d) => {
                    let { me } = this.state,
                        rowClass, linkedClass;

                    rowClass = ClassNames(
                        'device',
                        {'selected': this.state.selectedDevice.name === d.name}
                    );

                    linkedClass = ClassNames({
                        'linked': Object.keys(me.devices).indexOf(d.uuid) !== -1
                    });

                    return (
                        <div className={rowClass} onClick={this._handleSelectDevice.bind(null, d)}>
                            <div className="name">{d.name}</div>
                            <div className="status">{this.lang.machine_status[d.st_id]}</div>
                            <div className={linkedClass}></div>
                        </div>
                    );
                });
            }

            return(
                <div className="cloud">
                    <div className="container bind-machine">
                        <div className="title">
                            <h3>{lang.select_to_bind}</h3>
                        </div>
                        <div className="controls">
                            <div className="select">
                                {deviceList}
                                {/* <select size="8">
                                    {deviceList}
                                </select> */}
                            </div>
                            <div className="user-info">
                                <div className="name">{this.state.me.nickname}</div>
                                <div className="email">{this.state.me.email}</div>
                                <div className="change-password-link">
                                    <a href="#/studio/cloud/change-password">{lang.change_password.toLowerCase()}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={this._handleCancel}>{lang.cancel}</button>
                            <button className="btn btn-default" onClick={this._handleBind}>{lang.bind}</button>
                        </div>
                    </div>
                    {bindingWindow}
                    {blind}
                </div>
            );
        }

    });

});
