define([
    'helpers/device-master',
    'helpers/i18n',
    'app/constants/device-constants',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/global-actions',
    'helpers/sprintf',
    'helpers/check-device-status',
    'app/actions/beambox/constant'
], function (
    DeviceMaster,
    i18n,
    DeviceConstants,
    ProgressActions,
    ProgressConstants,
    GlobalActions,
    sprintf,
    checkDeviceStatus,
    Constant
) {
    const LANG = i18n.lang.beambox.left_panel;
    class PreviewModeController {
        constructor() {
            this.storedPrinter = null;
            this.isPreviewModeOn = false;
            this.isPreviewBlocked = false;
            this.cameraStream = null;
            this.cameraOffset = null;
            this.canvas = document.createElement('canvas');
            this.cameraCanvasUrl = '';
            this.errorCallback = function(){};

            this.canvas.width = Constant.dimension.width;
            this.canvas.height = Constant.dimension.height;

        }

        //main functions

        async start(selectedPrinter, errCallback) {
            await this._reset();

            await DeviceMaster.select(selectedPrinter);

            ProgressActions.open(ProgressConstants.NONSTOP, sprintf(i18n.lang.message.connectingMachine, selectedPrinter.name));

            try {
                await checkDeviceStatus(selectedPrinter);
                await this._retrieveCameraOffset();
                await DeviceMaster.enterMaintainMode();
                this.storedPrinter = selectedPrinter;
                this.errorCallback = errCallback;
                this.isPreviewModeOn = true;
                this._drawBoundary();
                this._initCameraStream();
            } catch (error) {
                throw error;
            } finally {
                ProgressActions.close();
            }
        }

        async end() {
            this._clearBoundary();
            const storedPrinter = this.storedPrinter;
            await this._reset();
            await DeviceMaster.select(storedPrinter);
            await DeviceMaster.endMaintainMode();
        }

        preview(x, y) {
            if (this.isPreviewBlocked) {
                return;
            }
            this.isPreviewBlocked = true;
            const constrainedXY = this._constrainPreviewXY(x, y);
            x = constrainedXY.x;
            y = constrainedXY.y;

            $(workarea).css('cursor', 'wait');

            this._getPhotoAfterMove(x, y)
                .then((imgUrl)=>{
                    $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
                    this._drawIntoBackground(imgUrl, x, y);
                    this.isPreviewBlocked = false;
                    $('.left-panel .preview-btns .clear-preview').show();// bad practice ~~~~
                })
                .catch((error)=>{
                    console.log(error);
                    this.errorCallback(error.message);
                    this.isPreviewBlocked = false;
                });
        }

        // x, y in mm
        takePictureAfterMoveTo(movementX, movementY) {
            return this._getPhotoAfterMoveTo(movementX, movementY);
        }

        clearGraffiti() {
            window.svgCanvas.setBackground('#fff');

            // clear canvas
            this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);

            // reset cameraCanvasUrl
            URL.revokeObjectURL(this.cameraCanvasUrl);
            this.cameraCanvasUrl = '';

            // hide 'x' button
            $('.left-panel .preview-btns .clear-preview').hide();// bad practice ~~~~
        }

        isPreviewMode() {
            return this.isPreviewModeOn;
        }

        isGraffitied() {
            return this.cameraCanvasUrl === '';
        }

        //helper functions

        async _retrieveCameraOffset() {
            try {
                await DeviceMaster.endMaintainMode();
            } catch (error) {
                console.log(error);
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

        _clearData() {
            this.storedPrinter = null;
            this.isPreviewModeOn = false;
            this.cameraOffset = null;
            this.isPreviewBlocked = false;
        }

        async _reset() {
            this._clearData();
            if(this.cameraStream) {
                await DeviceMaster.stopStreamCamera();
            }
        }

        _initCameraStream() {
            this.cameraStream = DeviceMaster.streamCamera(this.storedPrinter.uuid);
            this.cameraStream.subscribe(
                ()=>{},
                (err)=>{
                    this.end();
                    this.errorCallback('Camera Error: ' + err.error);
                }
            );
        }

        _constrainPreviewXY(x, y) {
            const maxWidth = Constant.dimension.width;
            const maxHeight = Constant.dimension.height;

            // Align grid
            x = Math.round(x / 100) * 100;
            y = Math.round(y / 100) * 100;

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
            // x, y in pixel
            let movement = {
                f: Constant.camera.movementSpeed,
                x: movementX, // mm
                y: movementY  // mm
            };

            await DeviceMaster.select(this.storedPrinter);
            await checkDeviceStatus(this.storedPrinter);
            await DeviceMaster.maintainMove(movement);
            const imgUrl = await this._getPhotoFromStream();
            return imgUrl;
        }

        //just fot _getPhotoAfterMoveTo()
        _getPhotoFromStream() {
            const d = $.Deferred();

            const waitTimeForMovementStop = Constant.camera.waitTimeForMovementStop; //millisecond. this value need optimized
            setTimeout(() => {
                this.cameraStream.take(1).subscribe((imageBlob) => {
                    const imgUrl = URL.createObjectURL(imageBlob);
                    d.resolve(imgUrl);
                });
            }, waitTimeForMovementStop);

            return d.promise();
        }

        //just for preview()
        _drawIntoBackground(imgUrl, x, y) {
            const img = new Image();
            img.src = imgUrl;
            img.onload = () => {
                // free unused blob memory
                URL.revokeObjectURL(imgUrl);

                const img_regulated = this._cropAndRotateImg(img);

                const dstX = x - img_regulated.width/2;
                const dstY = y - img_regulated.height/2;

                this.canvas.getContext('2d').drawImage(img_regulated, dstX, dstY);
                this.canvas.toBlob((blob) => {
                    if (this.cameraCanvasUrl) {
                        URL.revokeObjectURL(this.cameraCanvasUrl);
                    }
                    this.cameraCanvasUrl = URL.createObjectURL(blob);
                    window.svgCanvas.setBackground('#fff', this.cameraCanvasUrl);
                });
            };
        }

        //just for _drawIntoBackground()
        _cropAndRotateImg(imageObj) {
            const angle = this._getCameraOffset().angle;
            const scaleRatio = this._getCameraOffset().scaleRatio;

            const cvs = document.createElement('canvas');
            const ctx = cvs.getContext('2d');

            const a = angle;
            const s = scaleRatio;
            const w = imageObj.width;
            const h = imageObj.height;

            const c = h / (Math.cos(a) + Math.sin(a));
            const dstx = (h - w) / 2 * s;
            const dsty = - h * Math.sin(a) / (Math.cos(a) + Math.sin(a)) * s;

            cvs.width = cvs.height = c * s;

            ctx.rotate(a);
            ctx.drawImage(imageObj, 0, 0, w, h, dstx, dsty, w * s, h * s);

            return cvs;
        }

        //just for end()
        _clearBoundary() {
            const canvasBackground = svgedit.utilities.getElem('canvasBackground');
            const previewBoundary = svgedit.utilities.getElem('previewBoundary');
            canvasBackground.removeChild(previewBoundary);
        }

        // just for start()
        _drawBoundary() {
            const canvasBackground = svgedit.utilities.getElem('canvasBackground');
            const previewBoundary = this._getPreviewBoundary();
            canvasBackground.appendChild(previewBoundary);
        }
        // just for _drawBoundary()
        _getPreviewBoundary() {
            const previewBoundaryId = 'previewBoundary';
            const color = 'rgba(200,200,200,0.8)';

            const boundaryGroup = svgCanvas.addSvgElementFromJson({
                'element': 'g',
                'attr': {
                    'id': previewBoundaryId,
                    'width': '100%',
                    'height': '100%',
                    'x': 0,
                    'y': 0,
                    'style': 'pointer-events:none'
                }
            });
            const uncapturabledHeight = (this._getCameraOffset().y * Constant.dpmm) - (Constant.camera.imgHeight * this._getCameraOffset().scaleRatio / 2);
            const uncapturabledHeightRatio = uncapturabledHeight / Constant.dimension.height;

            const descText = svgCanvas.addSvgElementFromJson({
                'element': 'text',
                'attr': {
                    'font-size': '14px',
                    'x': 10,
                    'y': 15,
                    'fill': '#fff',
                    'style': 'pointer-events:none'
                }
            });
            const textNode = document.createTextNode(LANG.unpreviewable_area);
            descText.appendChild(textNode);
            const borderTop = svgCanvas.addSvgElementFromJson({
                'element': 'rect',
                'attr': {
                    'width': '100%',
                    'height': `${uncapturabledHeightRatio*100}%`,
                    'x': 0,
                    'y': 0,
                    'fill': color,
                    'style': 'pointer-events:none'
                }
            });
            // const borderBottom = svgCanvas.addSvgElementFromJson({
            //     'element': 'rect',
            //     'attr': {
            //         'width': '100%',
            //         'height': '2.597%',
            //         'x': 0,
            //         'y': '97.403%',
            //         'fill': color,
            //         'style': 'pointer-events:none'
            //     }
            // });
            // const borderLeft = svgCanvas.addSvgElementFromJson({
            //     'element': 'rect',
            //     'attr': {
            //         'width': '2.381%',
            //         'height': '100%',
            //         'x': 0,
            //         'y': 0,
            //         'fill': color,
            //         'style': 'pointer-events:none'
            //     }
            // });
            // const borderRight = svgCanvas.addSvgElementFromJson({
            //     'element': 'rect',
            //     'attr': {
            //         'width': '2.381%',
            //         'height': '100%',
            //         'x': '97.619%',
            //         'y': 0,
            //         'fill': color,
            //         'style': 'pointer-events:none'
            //     }
            // });
            boundaryGroup.appendChild(borderTop);
            boundaryGroup.appendChild(descText);
            // boundaryGroup.appendChild(borderBottom);
            // boundaryGroup.appendChild(borderLeft);
            // boundaryGroup.appendChild(borderRight);
            return boundaryGroup;
        }
    }

    const instance = new PreviewModeController();

    return instance;
});
