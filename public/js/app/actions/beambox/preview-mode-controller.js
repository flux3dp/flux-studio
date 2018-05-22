define([
    'Rx',
    'app/actions/beambox/preview-mode-background-drawer',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/global-actions',
    'helpers/sprintf',
    'helpers/check-device-status',
    'helpers/firmware-version-checker',
    'helpers/i18n',
    'app/actions/beambox/constant'
], function (
    Rx,
    PreviewModeBackgroundDrawer,
    DeviceMaster,
    DeviceConstants,
    ProgressActions,
    ProgressConstants,
    GlobalActions,
    sprintf,
    checkDeviceStatus,
    FirmwareVersionChecker,
    i18n,
    Constant
) {

    class PreviewModeController {
        constructor() {
            this.storedPrinter = null;
            this.isPreviewModeOn = false;
            this.isPreviewBlocked = false;
            this.cameraOffset = null;
            this.lastPosition = [0, 0]; // in mm
            this.errorCallback = function(){};
        }

        //main functions

        async start(selectedPrinter, errCallback) {
            await this._reset();

            await DeviceMaster.select(selectedPrinter);

            ProgressActions.open(ProgressConstants.NONSTOP, sprintf(i18n.lang.message.connectingMachine, selectedPrinter.name));

            try {
                await this._retrieveCameraOffset();
                await DeviceMaster.enterMaintainMode();
                if (await FirmwareVersionChecker.check(selectedPrinter, 'CLOSE_FAN')) {
                    DeviceMaster.maintainCloseFan(); // this is async function, but we don't have to wait it
                }
                await DeviceMaster.connectCamera(selectedPrinter);
                PreviewModeBackgroundDrawer.start(this.cameraOffset);
                PreviewModeBackgroundDrawer.drawBoundary();

                this.storedPrinter = selectedPrinter;
                this.errorCallback = errCallback;
                this.isPreviewModeOn = true;
            } catch (error) {
                throw error;
            } finally {
                ProgressActions.close();
            }
        }

        async end() {
            PreviewModeBackgroundDrawer.clearBoundary();
            PreviewModeBackgroundDrawer.end();
            const storedPrinter = this.storedPrinter;
            await this._reset();
            await DeviceMaster.select(storedPrinter);
            await DeviceMaster.endMaintainMode();
        }

        async preview(x, y) {
            if (this.isPreviewBlocked) {
                return;
            }
            this.isPreviewBlocked = true;
            const constrainedXY = this._constrainPreviewXY(x, y);
            x = constrainedXY.x;
            y = constrainedXY.y;

            $(workarea).css('cursor', 'wait');

            try {
                const imgUrl = await this._getPhotoAfterMove(x, y);
                $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
                PreviewModeBackgroundDrawer.draw(imgUrl, x, y);
                this.isPreviewBlocked = false;
                $('.left-panel .preview-btns .clear-preview').show();// bad practice ~~~~
            } catch (error) {
                console.log(error);
                this.errorCallback(error.message);
                this.isPreviewBlocked = false;
            }
        }

        async previewRegion(x1, y1, x2, y2) {
            const points = (() => {
                const size = (() => {
                    const h = Constant.camera.imgHeight;
                    const a = this._getCameraOffset().angle;
                    const s = this._getCameraOffset().scaleRatio;
                    const c = h / (Math.cos(a) + Math.sin(a));
                    // overlap a little bit to fix empty area between pictures
                    // (some machine will have it, maybe due to cameraOffset.angle).
                    // it seems like something wrong handling image rotation.
                    return c * s - 2;
                })();

                const {left, right, top, bottom} = (() => {
                    const l = Math.min(x1, x2) + size/2;
                    const r = Math.max(x1, x2) - size/2;
                    const t = Math.min(y1, y2) + size/2;
                    const b = Math.max(y1, y2) - size/2;

                    return {
                        left: this._constrainPreviewXY(l, 0).x,
                        right: this._constrainPreviewXY(r, 0).x,
                        top: this._constrainPreviewXY(0, t).y,
                        bottom: this._constrainPreviewXY(0, b).y
                    };
                })();

                let pointsArray = [];
                let shouldRowReverse = false; // let camera 走Ｓ字型
                for(let curY = top; curY < (bottom + size); curY += size) {

                    const row = [];
                    for(let curX = left; curX < (right + size); curX += size) {
                        row.push([curX, curY]);
                    }

                    if(shouldRowReverse) {
                        row.reverse();
                    }
                    pointsArray = pointsArray.concat(row);
                    shouldRowReverse = !shouldRowReverse;
                }
                return pointsArray;
            })();

            for(let i=0; i<points.length; i++) {
                await this.preview(points[i][0], points[i][1]);
            }
        }

        // x, y in mm
        takePictureAfterMoveTo(movementX, movementY) {
            return this._getPhotoAfterMoveTo(movementX, movementY);
        }

        clearGraffiti() {
            PreviewModeBackgroundDrawer.clear();

            // hide 'x' button
            $('.left-panel .preview-btns .clear-preview').hide();// bad practice ~~~~
        }

        isPreviewMode() {
            return this.isPreviewModeOn;
        }

        isGraffitied() {
            return !PreviewModeBackgroundDrawer.isClean();
        }

        //helper functions

        async _retrieveCameraOffset() {
            // cannot getDeviceSetting during maintainMode. So we force to end it.
            try {
                await DeviceMaster.endMaintainMode();
            } catch (error) {
                if ( (error.status === 'error') && (error.error && error.error[0] === 'OPERATION_ERROR') ) {
                    // do nothing.
                } else {
                    console.log(error);
                }
            }

            const resp = await DeviceMaster.getDeviceSetting('camera_offset');
            this.cameraOffset = {
                x:          Number(/X:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1]),
                y:          Number(/Y:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1]),
                angle:      Number(/R:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1]),
                scaleRatio: Number(/S:\s?(\-?\d+\.?\d+)/.exec(resp.value)[1])
            };
            if ((this.cameraOffset.x === 0) && (this.cameraOffset.y === 0)) {
                this.cameraOffset = {
                    x: Constant.camera.offsetX_ideal,
                    y: Constant.camera.offsetY_ideal,
                    angle: 0,
                    scaleRatio: Constant.camera.scaleRatio_ideal,
                };
            }
        }

        _getCameraOffset() {
            return this.cameraOffset;
        }

        async _reset() {
            this.storedPrinter = null;
            this.isPreviewModeOn = false;
            this.isPreviewBlocked = false;
            this.cameraOffset = null;
            this.lastPosition = [0, 0];
            await DeviceMaster.disconnectCamera();
        }

        _constrainPreviewXY(x, y) {
            const maxWidth = Constant.dimension.width;
            const maxHeight = Constant.dimension.height;

            x = Math.max(x, this._getCameraOffset().x * 10);
            x = Math.min(x, maxWidth);
            y = Math.max(y, this._getCameraOffset().y * 10);
            y = Math.min(y, maxHeight);
            return {
                x: x,
                y: y
            };
        }

        //x, y in pixel
        _getPhotoAfterMove(x, y) {
            const movementX = x / Constant.dpmm - this._getCameraOffset().x;
            const movementY = y / Constant.dpmm - this._getCameraOffset().y;
            return this._getPhotoAfterMoveTo(movementX, movementY);
        }

        //movementX, movementY in mm
        async _getPhotoAfterMoveTo(movementX, movementY) {
            let movement = {
                f: Math.max(Constant.camera.movementSpeed.x, Constant.camera.movementSpeed.y), // firmware will used limited x, y speed still
                x: movementX, // mm
                y: movementY  // mm
            };

            await DeviceMaster.select(this.storedPrinter);
            await DeviceMaster.maintainMove(movement);
            await this._waitUntilEstimatedMovementTime(movementX, movementY);
            const imgUrl = await this._getPhotoFromMachine();
            return imgUrl;
        }

        //movementX, movementY in mm
        async _waitUntilEstimatedMovementTime(movementX, movementY) {
            const speed = {
                x: Constant.camera.movementSpeed.x / 60 / 1000, // speed: mm per millisecond
                y: Constant.camera.movementSpeed.y / 60 / 1000 // speed: mm per millisecond
            };
            let timeToWait = Math.hypot((this.lastPosition[0] - movementX)/speed.x, (this.lastPosition[1] - movementY)/speed.y);

            // wait for moving camera to take a stable picture, this value need to be optimized
            timeToWait *= 1.2;

            this.lastPosition = [movementX, movementY];
            await Rx.Observable.timer(timeToWait).toPromise();
        }

        //just fot _getPhotoAfterMoveTo()
        async _getPhotoFromMachine() {
            const imgBlob = await DeviceMaster.takeOnePicture();
            const imgUrl = URL.createObjectURL(imgBlob);
            return imgUrl;
        }
    }

    const instance = new PreviewModeController();

    return instance;
});
