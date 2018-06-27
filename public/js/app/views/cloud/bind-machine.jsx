define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/device-master',
    'helpers/device-list',
    'plugins/classnames/index',
    'app/actions/film-cutter/film-cutter-cloud',
    'app/actions/film-cutter/record-manager',
    'app/actions/alert-actions',
], function(
    $,
    React,
    i18n,
    DeviceMaster,
    DeviceList,
    ClassNames,
    FilmCutterCloud,
    RecordManager,
    AlertActions
) {
    const LANG = i18n.lang.settings.flux_cloud;
    return class BindMachine extends React.Component {
        constructor() {
            super();
            this.state = {
                deviceList: [],
                selectedDevice: {}
            };
            this.timer = undefined;
        }
        componentDidMount() {
            const getList = () => {
                const deviceList = DeviceList(DeviceMaster.getDeviceList());
                this.setState({ deviceList });
            };

            getList();
            this.timer = setInterval(() => {
                getList();
            }, 2000);
        }
        componentWillUnmount() {
            clearInterval(this.timer);
        }
        handleDeviceSelected(device) {
            this.setState({
                selectedDevice: device
            });
        }
        handleCancelClick() {
            location.hash = '#/studio/cloud/my-account';
        }
        async handleBindClick() {
            const d = this.state.selectedDevice;
            const uuid = d.source === 'h2h' ? d.h2h_uuid : d.uuid;
            try {
                await FilmCutterCloud.bindMachine(uuid, uuid, d.model);
                RecordManager.write('machine_pi_serial_number', uuid);
                location.hash = '#/studio/cloud/my-account';
            } catch (error) {
                AlertActions.showPopupError('bind-machine', error.message || error.toString());
            }
        }
        renderDeviceList() {
            if(!this.state.deviceList.length) {
                return (<div><br/>{'請稍待...'}</div>);
            }

            return this.state.deviceList.map(d => {
                const rowClass = ClassNames(
                    'device',
                    {'selected': this.state.selectedDevice.name === d.name}
                );

                return (
                    <div className={rowClass} onClick={() => this.handleDeviceSelected(d)}>
                        <div className='name'>{d.name}</div>
                        <div className='status'>{i18n.lang.machine_status[d.st_id]}</div>
                    </div>
                );
            });
        }
        render() {
            return (
                <div className="cloud">
                    <div className="container bind-machine">
                        <div className="title">
                            <h3>{LANG.select_to_bind}</h3>
                        </div>
                        <div className="controls">
                            <div className="select">
                                {this.renderDeviceList()}
                            </div>

                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={() => this.handleCancelClick()}>{LANG.back}</button>
                            <button className="btn btn-default" onClick={() => this.handleBindClick()}>{LANG.bind}</button>
                        </div>
                    </div>
                </div>
            );
        }
    };
});
