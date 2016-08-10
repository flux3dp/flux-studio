define([
    'react',
    'app/constants/global-constants',
    'app/constants/device-constants',
    'app/constants/monitor-status',
    'helpers/duration-formatter'
], (
    React,
    GlobalConstants,
    DeviceConstants,
    MonitorStatus,
    FormatDuration
) => {

    'use strict';

    const findObjectContainsProperty = (infoArray = [], propertyName) => {
        return infoArray.filter((o) => Object.keys(o).some(n => n === propertyName));
    };

    let Monitor,
        Device;

    return React.createClass({
        contextTypes: {
            store: React.PropTypes.object,
            lang: React.PropTypes.object
        },

        componentWillMount: function() {
            const { store, lang } = this.context;
            MonitorStatus['setLang'](lang);

            this.lang = lang;
            this.unsubscribe = store.subscribe(() => {
                Monitor = this.context.store.getState().Monitor;
                Device = this.context.store.getState().Device;

                this.forceUpdate();
            });

            Monitor = this.context.store.getState().Monitor;
            Device = this.context.store.getState().Device;
        },

        componentWillUnmount: function() {
            clearInterval(this.timer);
            this.unsubscribe();
        },

        _isAbortedOrCompleted: function() {
            return (
                Device.status.st_id === DeviceConstants.status.ABORTED ||
                Device.status.st_id === DeviceConstants.status.COMPLETED
            );
        },

        _getHeadInfo: function() {
            return Device.status.module ? this.lang.monitor.device[Device.status.module] : '';
        },

        _getStatus: function() {
            if(Monitor.downloadProgress.size !== '') {
                return `${lang.monitor.processing} ${parseInt((Monitor.downloadProgress.size - Monitor.downloadProgress.left) / Monitor.downloadProgress.size * 100)}%`;
            }

            if(Device.status.st_label) {
                let { displayStatus } = MonitorStatus[Device.status.st_label]();
                return displayStatus;
            }
            else {
                return '';
            }
        },

        _getTemperature: function() {
            if(!Device.status || this._isAbortedOrCompleted()) {
                return '';
            }

            // rt = real temperature, tt = target temperature
            let { st_label, rt, tt } = Device.status,
                lang = this.lang.monitor;

            if(st_label === DeviceConstants.RUNNING) {
                return rt ? `${lang.temperature} ${parseInt(rt * 10) / 10} °C` : '';
            }
            else {
                return rt ? `${lang.temperature} ${parseInt(rt * 10) / 10} °C / ${tt} °C` : '';
            }
        },

        _getProgress: function() {
            if(Number.isInteger(Monitor.uploadProgress)) {
                return `${lang.monitor.processing} ${Monitor.uploadProgress}%`;
            }

            let o = findObjectContainsProperty(Device.jobInfo, 'TIME_COST');

            if(
                !Device.status ||
                !Device.jobInfo ||
                o.length === 0 ||
                Monitor.mode === GlobalConstants.FILE_PREVIEW ||
                this._isAbortedOrCompleted() ||
                Device.status.st_label === 'WAITING_HEAD' ||
                !Device.status.prog
            ) {
                return '';
            }

            let percentageDone = parseInt(Device.status.prog * 100),
            timeLeft = FormatDuration(o[0].TIME_COST * (1 - Device.status.prog));

            return `${percentageDone}%, ${timeLeft} ${this.lang.monitor.left}`;
        },

        render: function() {
            return (
                <div className="wrapper">
                    <div className="row">
                        <div className="head-info">
                            {this._getHeadInfo()}
                        </div>
                        <div className="status right">
                            {this._getStatus()}
                        </div>
                    </div>
                    <div className="row">
                        <div className="temperature">{this._getTemperature()}</div>
                        <div className="time-left right">{this._getProgress()}</div>
                    </div>
                </div>
            );
        }
    });

    return monitorInfo;
});
