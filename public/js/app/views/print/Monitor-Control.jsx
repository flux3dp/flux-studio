define([
    'react',
    'app/constants/global-constants',
    'app/constants/device-constants',
    'plugins/classnames/index',
], (
    React,
    GlobalConstants,
    DeviceConstants,
    ClassNames
) => {

    'use strict';

    const findObjectContainsProperty = (infoArray = [], propertyName) => {
        return infoArray.filter((o) => Object.keys(o).some(n => n === propertyName));
    };

    const type = { FILE: 'FILE', FOLDER: 'FOLDER' };

    return React.createClass({
        PropTypes: {

        },

        contextTypes: {
            store: React.PropTypes.object,
            lang: React.PropTypes.object
        },

        componentWillMount: function() {
            let { store } = this.context;

            this.unsubscribe = store.subscribe(() => {
                this.forceUpdate();
            });
        },

        componentWillUpdate: function() {
            return false;
        },

        componentWillUnmount: function() {
            this.unsubscribe();
        },

        _operation: function() {
            let { Monitor, Device } = this.context.store.getState();
            let { lang } = this.context;

            let cameraClass = ClassNames('btn-camera btn-control', { 'on': Monitor.mode === GlobalConstants.CAMERA }),
                cameraDescriptionClass = ClassNames('description', { 'on': Monitor.mode === GlobalConstants.CAMERA }),
                className;

            return {

                go: (enable) => {
                    className = ClassNames('controls center', {'disabled': !enable});
                    return (
                        <div className={className} onClick={this.props.onGo}>
                            <div className="btn-go btn-control"></div>
                            <div className="description">{lang.monitor.go}</div>
                        </div>
                    );
                },

                pause: (enable) => {
                    className = ClassNames('controls center', {'disabled': !enable});
                    return (
                        <div className={className} onClick={this.props.onPause}>
                            <div className="btn-pause btn-control"></div>
                            <div className="description">{lang.monitor.pause}</div>
                        </div>
                    );
                },

                stop: (enable) => {
                    className = ClassNames('controls left', {'disabled': !enable});
                    return (
                        <div className={className} onClick={this.props.onStop}>
                            <div className="btn-stop btn-control"></div>
                            <div className="description">{lang.monitor.stop}</div>
                        </div>
                    );
                },

                upload: (enable) => {
                    className = ClassNames('controls left', {'disabled': !enable});
                    return (
                        <div className={className} onClick={this.props.onUpload}>
                            <div className="btn-upload btn-control"></div>
                            <input className="upload-control" type="file" accept=".fc, .gcode" onChange={this.props.onUpload} />
                            <div className="description">{lang.monitor.upload}</div>
                        </div>
                    );
                },

                download: (enable) => {
                    className = ClassNames('controls center', {'disabled': !enable});
                    return (
                        <div className={className} onClick={this.props.onDownload}>
                            <div className="btn-download btn-control"></div>
                            <div className="description">{lang.monitor.download}</div>
                        </div>
                    );
                },

                camera: (enable) => {
                    className = ClassNames('controls right', {'disabled': !enable});
                    return (
                        <div className={className} onClick={this.props.onToggleCamera}>
                            <div className={cameraClass}></div>
                            <div className={cameraDescriptionClass}>{lang.monitor.camera}</div>
                        </div>
                    );
                },

                preparing: (enable) => {
                    className = ClassNames('controls center', {'disabled': true});
                    return (
                    <div className={className}>
                        <div className="btn-pause btn-control"></div>
                        <div className="description">{lang.monitor.pause}</div>
                    </div>
                    );
                }
            };
        },

        _isAbortedOrCompleted: function(statusId) {
            let { Device } = this.context.store.getState();
            statusId = statusId || Device.status.st_id;
            return (
                statusId === DeviceConstants.status.ABORTED ||
                statusId === DeviceConstants.status.COMPLETED
            );
        },

        _getJobType: function() {
            let { lang } = this.context, jobInfo, o;
            let { Monitor, Device } = this.context.store.getState();

            jobInfo = Monitor.mode === GlobalConstants.FILE_PREVIEW ? Monitor.selectedFileInfo : Device.jobInfo;
            o = findObjectContainsProperty(jobInfo, 'HEAD_TYPE');

            // this should be updated when slicer returns the same info as play info
            if(jobInfo.length === 0 && this.props.previewUrl) {
                return lang.monitor.task['EXTRUDER'];
            }

            return o.length > 0 ? lang.monitor.task[o[0].HEAD_TYPE.toUpperCase()] : '';
        },

        _renderButtons: function() {
            let { Monitor, Device } = this.context.store.getState()
            let { selectedItem } = Monitor;
            let commands, action, statusId, currentStatus;
            let leftButtonOn = false,
                middleButtonOn = false,
                rightButtonOn = true;

            statusId = Device.status.st_id;
            currentStatus = Device.status.st_label;
            commands = {
                'IDLE': () => {
                    return this._operation().go;
                },

                'RUNNING': () => {
                    return this._operation().pause;
                },

                'STARTING': () => {
                    return this._operation().preparing;
                },

                'PAUSED': () => {
                    return this._operation().go;
                },

                'ABORTED': () => {
                    return this._operation().go;
                },

                'HEATING': () => {
                    return this._operation().preparing;
                },

                'CALIBRATING': () => {
                    return this._operation().preparing;
                },

                'COMPLETED': () => {
                    return this._operation().go;
                }
            };

            action = !!commands[currentStatus] ? commands[currentStatus]() : '';

            // CAMERA mode
            if(Monitor.mode === GlobalConstants.CAMERA) {
                if(statusId === DeviceConstants.status.MAINTAIN || this._getJobType() === '') {
                    middleButtonOn = false;
                }
                else {
                    middleButtonOn = true;
                }

                if(
                    statusId === DeviceConstants.status.IDLE ||
                    statusId === DeviceConstants.status.COMPLETED ||
                    statusId === DeviceConstants.status.ABORTED
                ) {
                    leftButtonOn = false;
                }
                else {
                    leftButtonOn = true;
                }
            }

            // FILE mode
            else if(Monitor.mode === GlobalConstants.FILE) {
                leftButtonOn = Monitor.currentPath !== '';
                middleButtonOn = selectedItem.type === type.FILE;
            }

            // PRINT mode
            else if(Monitor.mode === GlobalConstants.PRINT) {
                leftButtonOn = true;

                if(
                    currentStatus === DeviceConstants.STARTING ||
                    statusId === DeviceConstants.status.PAUSING_FROM_RUNNING ||
                    statusId === DeviceConstants.status.MAINTAIN ||
                    statusId === DeviceConstants.status.SCAN ||
                    this._getJobType() === '' ||
                    this._isAbortedOrCompleted()
                ) {
                    middleButtonOn = false;
                }
                else {
                    middleButtonOn = true;
                }
            }

            // PREVIEW mode
            else if (Monitor.mode === GlobalConstants.PREVIEW) {
                middleButtonOn = true;
                if(
                    statusId === DeviceConstants.status.IDLE ||
                    statusId === DeviceConstants.status.COMPLETED ||
                    statusId === DeviceConstants.status.ABORTED
                ) {
                    leftButtonOn = false;
                }

                if(statusId === DeviceConstants.status.MAINTAIN ||
                   statusId === DeviceConstants.status.SCAN ||
                   this._isAbortedOrCompleted(statusId)
                ) {
                    middleButtonOn = false;
                }
                else {
                    middleButtonOn = true;
                }
            }

            // FILE PREVIEW mode
            else if (Monitor.mode === GlobalConstants.FILE_PREVIEW) {
                leftButtonOn = false;
                middleButtonOn = true;
            }

            let leftButton = Monitor.mode === GlobalConstants.FILE ? this._operation().upload : this._operation().stop,
                middleButton = Monitor.mode === GlobalConstants.FILE ? this._operation().download : action,
                rightButton = this._operation().camera;

            if(leftButton !== '') {
                leftButton = leftButton(leftButtonOn);
            }

            if(middleButton !== '') {
                middleButton = middleButton(middleButtonOn);
            }

            if(rightButton !== '') {
                rightButton = rightButton(rightButtonOn);
            }

            return {
                leftButton,
                middleButton,
                rightButton
            };
        },

        render: function() {
            let { leftButton, middleButton, rightButton } = this._renderButtons();

            return (
                <div className="operation">
                    {leftButton}
                    {middleButton}
                    {rightButton}
                </div>
            )
        }

    });
});
