define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/device-master',
    'helpers/device-list',
    'helpers/pad-string'
], function(
    $,
    React,
    i18n,
    DeviceMaster,
    DeviceList,
    PadString
) {
    'use strict';

    return React.createClass({

        lang: {},

        getInitialState: function() {
            return {};
        },

        componentWillMount: function() {
            // console.log(i18n.get());
            this.lang = i18n.get();
        },

        componentDidMount: function() {
            setInterval(() => {
                let deviceList = DeviceList(DeviceMaster.getDeviceList());
                // let list = DeviceMaster.getDeviceList();
                // let deviceNames = Object.keys(list).filter((k) => k !== '');
                // let deviceList = deviceNames.map((name) => list[name]);
                this.setState({ deviceList });
            }, 2000);
        },

        _handleCancel: function() {
            location.hash = '#/studio/print';
        },

        _handleBind: function() {
            location.hash = '#/studio/cloud/forgot-password';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud,
                deviceList;
            // console.log(this.lang);
            if(!this.state.deviceList) {
                deviceList = <option>{this.lang.device.please_wait}</option>;
            }
            else {
                deviceList = this.state.deviceList.map((d) => {
                    return (
                        <option dangerouslySetInnerHTML={{
                            __html: `${PadString(d.name, 20, false)} ${this.lang.machine_status[d.st_id]}`
                        }}></option>
                    )
                    // return (
                    //     <option>{`${PadString(d.name, 20, false)} ${this.lang.machine_status[d.st_id]}`}</option>
                    // );
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
                                <select size="8">
                                    {deviceList}
                                </select>
                            </div>
                            <div className="user-info">
                                <div className="name">Ryoko Hirosue</div>
                                <div className="email">ryoko@gmail.com</div>
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
                </div>
            );
        }

    });

});
