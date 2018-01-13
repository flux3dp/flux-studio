define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/api/config',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/alert-actions',
    'helpers/check-device-status',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/beambox/preview-mode-controller',
    'helpers/api/camera-calibration',
    'helpers/sprintf',
    'app/actions/beambox/constant',    
], function(
    $,
    React,
    i18n,
    ConfigHelper,
    Modal,
    Alert,
    DeviceMaster,
    DeviceConstants,
    AlertActions,
    CheckDeviceStatus,
    ProgressActions,
    ProgressConstants,
    PreviewModeController,
    CameraCalibration,
    sprintf,
    Constant
) {
    'use strict';

    const lang = i18n.get();
    const LANG = lang.camera_calibration;
    const Config = ConfigHelper();

    const cameraCalibrationWebSocket = CameraCalibration();    
    
    let imgBlobUrl = '';

    //View render the following steps
    const STEP_REFOCUS = Symbol();
    const STEP_BEFORE_CUT = Symbol();
    const STEP_BEFORE_ANALYZE_PICTURE = Symbol();
    const STEP_FINISH = Symbol();

    class View extends React.Component {
        constructor(props) {
            super(props);
            this.stepsMap = new Map([
                [STEP_REFOCUS, StepRefocus],
                [STEP_BEFORE_CUT, StepBeforeCut],
                [STEP_BEFORE_ANALYZE_PICTURE, StepBeforeAnalyzePicture],
                [STEP_FINISH, StepFinish]
            ]);
            
            this.state = {
                currentStep: STEP_REFOCUS
            };

            this.changeCurrentStep = this.changeCurrentStep.bind(this);
            this.onClose = this.onClose.bind(this);
        }

        changeCurrentStep(nextStep) {
            this.setState({currentStep: nextStep});
        }

        onClose() {
            this.props.onClose();
        }

        render() {
            const currentStep = this.state.currentStep;
            const TheStep = this.stepsMap.get(currentStep);
            const content = (<TheStep 
                gotoNextStep={this.changeCurrentStep}
                onClose={this.onClose}
                device={this.props.device}
            />);
            return (
                <div className="always-top" ref="modal">
                    <Modal className={{"modal-camera-calibration": true}} content={content} disabledEscapeOnBackground={false}/>
                </div>
            );
        }
    };
    View.propTypes = {
        device  : React.PropTypes.object,
        onClose : React.PropTypes.func
    };

    class StepRefocus extends React.Component {
        render() {
            return (
                <Alert
                    caption={LANG.camera_calibration}
                    message={LANG.please_refocus}
                    buttons={
                        [{
                            label: LANG.next,
                            className: 'btn-default btn-alone-right',
                            onClick: () => this.props.gotoNextStep(STEP_BEFORE_CUT)
                        },
                        {
                            label: LANG.cancel,
                            className: 'btn-default btn-alone-left',
                            onClick: this.props.onClose
                        }]
                    }
                    />
            );
        }
    }
    
    class StepBeforeCut extends React.Component {
        async cutThenCapture() {
            await this._doCuttingTask();
            await this._doCaptureTask();
        };
        async _doCuttingTask() {
            const device = this.props.device;
            await DeviceMaster.select(device);
            await CheckDeviceStatus(device);
            await DeviceMaster.runBeamboxCameraTest();
        };
        async _doCaptureTask() {
            const device = this.props.device;
            await PreviewModeController.start(device, ()=>{console.log('camera fail. stop preview mode')});
            ProgressActions.open(ProgressConstants.NONSTOP, LANG.taking_picture); 
            try {
                const movementX = Constant.camera.calibrationPicture.centerX - Constant.camera.offsetX_ideal;
                const movementY = Constant.camera.calibrationPicture.centerY - Constant.camera.offsetY_ideal;
                const blobUrl = await PreviewModeController.takePictureAfterMoveTo(movementX, movementY);
                if(imgBlobUrl) {
                    URL.revokeObjectURL(imgBlobUrl);
                }
                imgBlobUrl = blobUrl;
            } catch (error) {
                throw error;
            } finally {
                ProgressActions.close();
                PreviewModeController.end();
            }
        };

        render() {
            return (
                <Alert
                caption={LANG.camera_calibration}
                message={LANG.please_place_paper}
                buttons={
                    [{
                        label: LANG.start_engrave,
                        className: 'btn-default btn-alone-right',
                        onClick: async ()=>{
                            try {
                                await this.cutThenCapture();
                                this.props.gotoNextStep(STEP_BEFORE_ANALYZE_PICTURE);
                            } catch (error) {
                                console.log(error);
                                AlertActions.showPopupError('menu-item', error.message);                                
                            }
                        }
                    },
                    {
                        label: LANG.cancel,
                        className: 'btn-default btn-alone-left',
                        onClick: this.props.onClose
                    }]
                }
                />
            ); 
        };
    }

    class StepBeforeAnalyzePicture extends React.Component {
        async sendPictureThenSetConfig() {
            const resp = await this._doSendPictureTask();
            console.log('sendPicture done', resp);
            const result = this._doAnalyzeResult(resp.x, resp.y, resp.angle, resp.size);
            if(!result) {
                throw new Error(LANG.analyze_result_fail);
            }
            await this._doSetConfigTask(result.X, result.Y, result.R, result.S);
        }

        async _doSendPictureTask() {
            const d = $.Deferred();
            fetch(imgBlobUrl)
            .then(res => res.blob())
            .then((blob) => {
                var fileReader = new FileReader();
                fileReader.onloadend = (e) => {
                    cameraCalibrationWebSocket.upload(e.target.result)
                    .done((resp)=>{
                        d.resolve(resp);
                    })
                    .fail((resp)=>{
                        d.reject(resp.toString());
                    })
                };
                fileReader.readAsArrayBuffer(blob);
            })
            .catch((err) => {
                d.reject(err);
            });
            await d.promise();
        }

        _doAnalyzeResult(x, y, angle, size) {
            const offsetX_ideal = Constant.camera.offsetX_ideal; // mm
            const offsetY_ideal = Constant.camera.offsetY_ideal; // mm
            const scaleRatio_ideal = Constant.camera.scaleRatio_ideal;
            const square_size = Constant.camera.calibrationPicture.size; // mm

            const scaleRatio = (square_size * Constant.dpmm) / size;
            const deviationX = x - Constant.camera.imgWidth/2; // pixel
            const deviationY = y - Constant.camera.imgHeight/2; // pixel

            const offsetX = -deviationX * scaleRatio / Constant.dpmm + offsetX_ideal;
            const offsetY = -deviationY * scaleRatio / Constant.dpmm + offsetY_ideal;
            
            if ((0.8 > scaleRatio/scaleRatio_ideal) || (scaleRatio/scaleRatio_ideal > 1.2)) {
                return false;
            }
            if ((Math.abs(deviationX) > 400) || (Math.abs(deviationY) > 400)) {
                return false;
            }
            if (Math.abs(angle) > 10*Math.PI/180) {
                return false;
            }
            return {
                X: offsetX,
                Y: offsetY,
                R: -angle,
                S: scaleRatio
            }
        }

        async _doSetConfigTask(X, Y, R, S) {
            await DeviceMaster.setDeviceSetting('camera_offset', `Y:${Y} X:${X} R:${R} S:${S}`);
        }

        render() {
            return (
                <Alert
                    caption={LANG.camera_calibration}
                    message={sprintf(LANG.please_confirm_image, imgBlobUrl)}
                    buttons={
                        [{
                            label: LANG.next,
                            className: 'btn-default btn-alone-right-1',
                            onClick: async () => {
                                try {
                                    await this.sendPictureThenSetConfig();
                                    this.props.gotoNextStep(STEP_FINISH);
                                } catch (error) {
                                    console.log(error);
                                    AlertActions.showPopupError('menu-item', error.message);                                        
                                    this.props.gotoNextStep(STEP_REFOCUS);
                                }
                            }
                        },
                        {
                            label: LANG.back,
                            className: 'btn-default btn-alone-right-2',
                            onClick: () => this.props.gotoNextStep(STEP_BEFORE_CUT)
                        },
                        {
                            label: LANG.cancel,
                            className: 'btn-default btn-alone-left',
                            onClick: this.props.onClose
                        }]
                    }
                />
            );
        }
    };

    class StepFinish extends React.Component {
        render() {
            return (
                <Alert
                    caption={LANG.camera_calibration}
                    message={LANG.calibrate_done}
                    buttons={
                        [{
                            label: LANG.finish,
                            className: 'btn-default btn-alone-right',
                            onClick: () => {
                                Config.update('beambox-preference', 'should_remind_calibrate_camera', false);
                                this.props.onClose();
                            }
                        }]
                    }
                />
            );
        }
    };

    return View;
});
