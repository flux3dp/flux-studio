/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'reactPropTypes',
    'helpers/i18n',
    'app/actions/beambox/beambox-preference',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'helpers/device-master',
    'helpers/version-checker',
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
    PropTypes,
    i18n,
    BeamboxPreference,
    Modal,
    Alert,
    DeviceMaster,
    VersionChecker,
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
    const LANG = i18n.lang.camera_calibration;

    const cameraCalibrationWebSocket = CameraCalibration();

    //View render the following steps
    const STEP_REFOCUS = Symbol();
    const STEP_BEFORE_CUT = Symbol();
    const STEP_BEFORE_ANALYZE_PICTURE = Symbol();
    const STEP_FINISH = Symbol();

    let cameraOffset = {};

    class CameraCalibrationStateMachine extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                currentStep: STEP_REFOCUS,
                imgBlobUrl: ''
            };

            this.updateCurrentStep = this.updateCurrentStep.bind(this);
            this.onClose = this.onClose.bind(this);
            this.updateImgBlobUrl = this.updateImgBlobUrl.bind(this);
        }

        updateCurrentStep(nextStep) {
            this.setState({
                currentStep: nextStep
            });
        }

        onClose() {
            this.props.onClose();
        }

        updateImgBlobUrl(val) {
            URL.revokeObjectURL(this.state.imgBlobUrl);
            this.setState({
                imgBlobUrl: val
            });
        }

        render() {
            const stepsMap = {
                [STEP_REFOCUS]:
                    <StepRefocus
                        gotoNextStep={this.updateCurrentStep}
                        onClose={this.onClose}
                    />,
                [STEP_BEFORE_CUT]:
                    <StepBeforeCut
                        gotoNextStep={this.updateCurrentStep}
                        onClose={this.onClose}
                        device={this.props.device}
                        updateImgBlobUrl={this.updateImgBlobUrl}
                    />,
                [STEP_BEFORE_ANALYZE_PICTURE]:
                    <StepBeforeAnalyzePicture
                        gotoNextStep={this.updateCurrentStep}
                        onClose={this.onClose}
                        imgBlobUrl={this.state.imgBlobUrl}
                    />,
                [STEP_FINISH]:
                    <StepFinish
                        onClose={this.onClose}
                    />
            };

            const currentStep = this.state.currentStep;
            const currentStepComponent = stepsMap[currentStep];
            return (
                <div className='always-top' ref='modal'>
                    <Modal className={{'modal-camera-calibration': true}} content={currentStepComponent} disabledEscapeOnBackground={false}/>
                </div>
            );
        }
    };

    const StepRefocus = ({gotoNextStep, onClose}) => (
        <Alert
            caption={LANG.camera_calibration}
            message={LANG.please_refocus}
            buttons={
                [{
                    label: LANG.next,
                    className: 'btn-default btn-alone-right',
                    onClick: () => gotoNextStep(STEP_BEFORE_CUT)
                },
                {
                    label: LANG.cancel,
                    className: 'btn-default btn-alone-left',
                    onClick: onClose
                }]
            }
        />
    );

    const StepBeforeCut = ({device, updateImgBlobUrl, gotoNextStep, onClose}) => {
        const cutThenCapture = async () => {
            await _doCuttingTask();
            await _doCaptureTask();
        };
        const _doCuttingTask = async () => {
            await DeviceMaster.select(device);
            await CheckDeviceStatus(device);
            await DeviceMaster.runBeamboxCameraTest();
        };
        const _doCaptureTask = async () => {
            try {
                await PreviewModeController.start(device, ()=>{console.log('camera fail. stop preview mode');});

                ProgressActions.open(ProgressConstants.NONSTOP, LANG.taking_picture);

                const movementX = Constant.camera.calibrationPicture.centerX - Constant.camera.offsetX_ideal;
                const movementY = Constant.camera.calibrationPicture.centerY - Constant.camera.offsetY_ideal;
                const blobUrl = await PreviewModeController.takePictureAfterMoveTo(movementX, movementY);
                cameraOffset = PreviewModeController.getCameraOffset();
                updateImgBlobUrl(blobUrl);
            } catch (error) {
                throw error;
            } finally {
                ProgressActions.close();
                PreviewModeController.end();
            }
        };

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
                                await cutThenCapture();
                                gotoNextStep(STEP_BEFORE_ANALYZE_PICTURE);
                            } catch (error) {
                                console.log(error);
                                ProgressActions.close();
                                AlertActions.showPopupError('menu-item', error.message || 'Fail to cut and capture');
                            }
                        }
                    },
                    {
                        label: LANG.cancel,
                        className: 'btn-default btn-alone-left',
                        onClick: onClose
                    }]
                }
            />
        );
    };

    const StepBeforeAnalyzePicture = ({imgBlobUrl, gotoNextStep, onClose}) => {
        const sendPictureThenSetConfig = async () => {
            const resp = await _doSendPictureTask();
            const result = await _doAnalyzeResult(resp.x, resp.y, resp.angle, resp.width, resp.height);
            if(!result) {
                throw new Error(LANG.analyze_result_fail);
            }
            await _doSetConfigTask(result.X, result.Y, result.R, result.SX, result.SY);
        };

        const _doSendPictureTask = async () => {
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
                            });
                    };
                    fileReader.readAsArrayBuffer(blob);
                })
                .catch((err) => {
                    d.reject(err);
                });
            return await d.promise();
        };

        const _doAnalyzeResult = async (x, y, angle, squareWidth, squareHeight) => {
            const blobImgSize = await new Promise(resolve => {
                const img = new Image();
                img.src = imgBlobUrl;
                img.onload = () => {
                    resolve({
                        width:img.width,
                        height: img.height
                    });
                };
            });

            const offsetX_ideal = Constant.camera.offsetX_ideal; // mm
            const offsetY_ideal = Constant.camera.offsetY_ideal; // mm
            const scaleRatio_ideal = Constant.camera.scaleRatio_ideal;
            const square_size = Constant.camera.calibrationPicture.size; // mm

            const scaleRatioX = (square_size * Constant.dpmm) / squareWidth;
            const scaleRatioY = (square_size * Constant.dpmm) / squareHeight;
            const deviationX = x - blobImgSize.width/2; // pixel
            const deviationY = y - blobImgSize.height/2; // pixel

            const offsetX = -deviationX * scaleRatioX / Constant.dpmm + offsetX_ideal;
            const offsetY = -deviationY * scaleRatioY / Constant.dpmm + offsetY_ideal;

            if ((0.8 > scaleRatioX/scaleRatio_ideal) || (scaleRatioX/scaleRatio_ideal > 1.2)) {
                return false;
            }
            if ((0.8 > scaleRatioY/scaleRatio_ideal) || (scaleRatioY/scaleRatio_ideal > 1.2)) {
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
                SX: scaleRatioX,
                SY: scaleRatioY
            };
        };

        const _doSetConfigTask = async (X, Y, R, SX, SY) => {
            const deviceInfo = await DeviceMaster.getDeviceInfo();
            const vc = VersionChecker(deviceInfo.version);
            if(vc.meetRequirement('BEAMBOX_CAMERA_CALIBRATION_XY_RATIO')) {
                await DeviceMaster.setDeviceSetting('camera_offset', `Y:${Y} X:${X} R:${R} S:${(SX+SY)/2} SX:${SX} SY:${SY}`);
            } else {
                await DeviceMaster.setDeviceSetting('camera_offset', `Y:${Y} X:${X} R:${R} S:${(SX+SY)/2}`);
            }
        };

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
                                await sendPictureThenSetConfig();
                                gotoNextStep(STEP_FINISH);
                            } catch (error) {
                                console.log(error);
                                AlertActions.showPopupError('menu-item', error.toString().replace('Error: ', ''));
                                gotoNextStep(STEP_REFOCUS);
                            }
                        }
                    },
                    {
                        label: LANG.back,
                        className: 'btn-default btn-alone-right-2',
                        onClick: () => gotoNextStep(STEP_BEFORE_CUT)
                    },
                    {
                        label: LANG.cancel,
                        className: 'btn-default btn-alone-left',
                        onClick: onClose
                    }]
                }
            />
        );
    };

    const StepFinish = ({onClose}) => (
        <Alert
            caption={LANG.camera_calibration}
            message={LANG.calibrate_done}
            buttons={
                [{
                    label: LANG.finish,
                    className: 'btn-default btn-alone-right',
                    onClick: () => {
                        BeamboxPreference.write('should_remind_calibrate_camera', false);
                        onClose();
                    }
                }]
            }
        />
    );

    return CameraCalibrationStateMachine;
});
