define([
    'react',
    'app/constants/global-constants',
    'app/constants/device-constants',
    'helpers/device-master',
    'plugins/classnames/index',
    'helpers/duration-formatter'
], (
    React,
    GlobalConstants,
    DeviceConstants,
    DeviceMaster,
    ClassNames,
    FormatDuration
) => {

    'use strict';

    const defaultImage = '/img/ph_l.png';
    const maxFileNameLength = 12;

    let selectedItem = '',
        Monitor,
        Device,
        previewUrl = defaultImage;

    const findObjectContainsProperty = (infoArray = [], propertyName) => {
        return infoArray.filter((o) => Object.keys(o).some(n => n === propertyName));
    };

    const processImage = (imageBlob) => {
        $('.camera-image').attr('src', URL.createObjectURL(imageBlob));
    };

    return React.createClass({
        PropTypes: {

        },

        contextTypes: {
            store: React.PropTypes.object,
            slicingResult: React.PropTypes.object,
            lang: React.PropTypes.object
        },

        componentWillMount: function() {
            const { store } = this.context;

            this.unsubscribe = store.subscribe(() => {
                Monitor = this.context.store.getState().Monitor;
                Device = this.context.store.getState().Device;

                this.forceUpdate();
            });

            Monitor = this.context.store.getState().Monitor;
            Device = this.context.store.getState().Device;
        },

        componentDidMount: function() {
            // console.log('preview is', previewUrl);
            this._initialize();
        },

        componentWillUpdate: function() {
            return false;
        },

        componentWillUnmount: function() {
            previewUrl = '';
            this.unsubscribe();
        },

        _initialize: function() {
            // console.log(Monitor.mode);
            // const go = (result) => {
            //     if(!result.done) {
            //         result.value.then(() => {
            //             go(s.next());
            //         });
            //     };
            // };
            //
            // const starter = function*() {
            //     if(Monitor.mode === GlobalConstants.FILE) {
            //         yield this._retrieveFolderContent();
            //     }
            //     else if(Monitor.mode === GlobalConstants.PREVIEW) {
            //
            //     }
            // }.bind(this);
            //
            // let s = starter();
            // go(s.next());
        },

        _getPreviewUrl: function() {
            const setUrl = (info) => {
                let blobIndex = info.findIndex(o => o instanceof Blob);
                previewUrl = blobIndex > 0 ? window.URL.createObjectURL(info[blobIndex]) : defaultImage;
            };

            if(previewUrl === defaultImage || !previewUrl) {
                if(Monitor.mode === GlobalConstants.FILE_PREVIEW) {
                    setUrl(Monitor.selectedFileInfo);
                }
                // else if(Monitor.mode === GlobalConstants.PREVIEW) {
                //     previewUrl = this.props.previewUrl;
                // }
                // else if(typeof Device.jobInfo !== 'undefined') {
                else if(Device.jobInfo.length > 0) {
                    setUrl(Device.jobInfo);
                }
                else {
                    previewUrl = this.props.previewUrl;
                }
            }
            return `url(${previewUrl})`;
        },

        _showPreview: function() {
            let divStyle = {
                backgroundColor: '#E0E0E0',
                backgroundImage: this._getPreviewUrl(),
                backgroundSize: 'cover',
                backgroundPosition: '50% 50%',
                width: '100%',
                height: '100%'
            };

            return (<div style={divStyle} />);
        },

        // _showFilePreview: function() {
        //     // if(Monitor.mode === GlobalConstants.FILE_PREVIEW) {
        //     //     previewUrl = Monitor.previewUrl;
        //     // }
        //     console.log(Monitor.previewUrl);
        //     let divStyle = {
        //         backgroundColor: '#E0E0E0',
        //         backgroundImage: `url(${Monitor.previewUrl})`,
        //         backgroundSize: 'cover',
        //         backgroundPosition: '50% 50%',
        //         width: '100%',
        //         height: '100%'
        //     };
        //
        //     return (<div style={divStyle} />);
        // },

        _imageError: function(src) {
            src.target.src = '/img/ph_s.png';
        },

        _listFolderContent: function() {
            // console.log(Monitor);
            let { files, directories } = Monitor.currentFolderContent;
            previewUrl = defaultImage; // reset preview image

            if(!directories || !files) {
                return;
            }

            // console.log(directories);

            let _folders = directories.map((folder) => {
                // console.log(Monitor.selectedItem.name, folder);
                let folderNameClass = ClassNames('name', {'selected': Monitor.selectedItem.name === folder});
                return (
                    <div
                        className="folder"
                        onClick={this.props.onFolderClick.bind(this, folder)}
                        onDoubleClick={this.props.onFolderDoubleClick.bind(this, folder)}>
                        <div className={folderNameClass}>
                            {folder}
                        </div>
                    </div>
                );
            });

            let _files = files.map((item, i) => {
                if(!item[0]) {
                    item = [result.files[i]];
                }
                let imgSrc = item[1] ? URL.createObjectURL(item[1]) : '/img/ph_s.png';
                let fileNameClass = ClassNames('name', {'selected': Monitor.selectedItem.name === item[0]});

                return (
                    <div
                        title={item[0]}
                        className="file"
                        onClick={this.props.onFileClick.bind(null, item[0], DeviceConstants.SELECT)}
                        onDoubleClick={this.props.onFileClick.bind(null, item[0], DeviceConstants.PREVIEW)}>
                        <div className="image-wrapper">
                            <img src={imgSrc} onError={this._imageError.bind(this)}/>
                        </div>
                        <div className={fileNameClass}>
                            {item[0].length > maxFileNameLength ? item[0].substring(0, maxFileNameLength) + '...' : item[0]}
                        </div>
                    </div>
                );
            });

            return (
                <div className="wrapper">
                    {_folders}
                    {_files}
                </div>
            );
        },

        _retrieveFileInfo: function() {

        },

        _streamCamera: function() {
            if(!this.cameraStream) {
                let { selectedDevice } = this.props;
                this.cameraStream = DeviceMaster.streamCamera(selectedDevice.uuid);
                this.cameraStream.subscribe(processImage);
            }

            return(
                <img className="camera-image" />
            );
        },

        _getJobType: function() {
            let { lang } = this.context, jobInfo, o;

            jobInfo = Monitor.mode === GlobalConstants.FILE_PREVIEW ? Monitor.selectedFileInfo : Device.jobInfo;
            o = findObjectContainsProperty(jobInfo, 'HEAD_TYPE');

            // this should be updated when slicer returns the same info as play info
            if(jobInfo.length === 0 && this.props.previewUrl) {
                return lang.monitor.task['EXTRUDER'];
            }

            return o.length > 0 ? lang.monitor.task[o[0].HEAD_TYPE.toUpperCase()] : '';
        },

        _getJobTime: function() {
            let jobInfo, o;

            jobInfo = Monitor.mode === GlobalConstants.FILE_PREVIEW ? Monitor.selectedFileInfo : Device.jobInfo;
            o = findObjectContainsProperty(jobInfo, 'TIME_COST');
            return o.length > 0 ? o[0].TIME_COST : '';
        },

        _getJobProgress: function() {
            if(Monitor.mode === GlobalConstants.FILE_PREVIEW  || this._isAbortedOrCompleted()) {
                return '';
            }
            return Device.status.prog ? `${parseInt(Device.status.prog * 100)}%` : '';
        },

        _isAbortedOrCompleted: function() {
            return (
                Device.status.st_id === DeviceConstants.status.ABORTED ||
                Device.status.st_id === DeviceConstants.status.COMPLETED
            );
        },

        _renderDisplay: function(mode) {
            // console.log(`mode is: ${mode}, status is ${Device.status.st_label}`);
            if(mode !== GlobalConstants.CAMERA) {
                this.cameraStream = null;
            }
            let doMode = {};

            doMode[GlobalConstants.PREVIEW] = this._showPreview;
            doMode[GlobalConstants.PRINT] = this._showPreview;
            doMode[GlobalConstants.FILE] = this._listFolderContent;
            doMode[GlobalConstants.CAMERA] = this._streamCamera;
            doMode[GlobalConstants.FILE_PREVIEW] = this._showPreview;

            if(typeof doMode[mode] !== 'function') {
                return (<div></div>);
            }

            return doMode[mode]();
        },

        _renderJobInfo: function() {
            if(Monitor.mode === GlobalConstants.FILE || Monitor.mode === GlobalConstants.CAMERA) {
                return '';
            }

            let { slicingResult } = this.context;

            let jobTime = FormatDuration(this._getJobTime()) || '',
                jobProgress = this._getJobProgress(),
                jobType = this._getJobType(),
                infoClass;

            infoClass = ClassNames(
                'status-info',
                {
                    'running':
                        Monitor.mode === GlobalConstants.PRINT ||
                        ((Monitor.mode === GlobalConstants.PREVIEW || jobTime !== '') && jobType !== '')
                },
                {
                    'hide':
                        (Monitor.mode === GlobalConstants.CAMERA || this._isAbortedOrCompleted())
                        && Monitor.selectedItem.name === ''
                }
            );

            // if job is not active, render from slicing result
            if(jobTime === '' && slicingResult) {
                let time = slicingResult.time || slicingResult.metadata.TIME_COST;
                jobTime = FormatDuration(time);
            }

            return (
                <div className={infoClass}>
                    <div className="verticle-align">
                        <div>{jobType}</div>
                        <div className="status-info-duration">{jobTime}</div>
                    </div>
                    <div className="status-info-progress">{jobProgress}</div>
                </div>
            );
        },

        _renderSpinner: function() {
            return (
                <div className="spinner-wrapper">
                    <div className="spinner-flip"/>
                </div>
            );
        },

        render: function() {
            let content = this._renderDisplay(Monitor.mode),
                jobInfo = this._renderJobInfo();

            if(Monitor.isWaiting) {
                content = this._renderSpinner();
                jobInfo = '';
            }

            return (
                <div className="body">
                    <div className="device-content">
                        {content}
                        {jobInfo}
                    </div>
                </div>
            );
        }

    });

});
