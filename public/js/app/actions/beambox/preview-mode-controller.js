define([
    'helpers/device-master',
    'helpers/i18n',
    'app/constants/device-constants',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'helpers/image-data',
    'helpers/api/svg-laser-parser',
    'helpers/api/fcode-reader',
    'app/actions/alert-actions',
    'app/actions/global-actions',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/beambox/constant'
], function (
    DeviceMaster,
    i18n,
    DeviceConstants,
    ProgressActions,
    ProgressConstants,
    imageData,
    svgLaserParser,
    fcodeReader,
    AlertActions,
    GlobalActions,
    svgeditorFunction,
    Constant
) {
    'use strict';

    class PreviewModeController {
        constructor() {
            this.storedPrinter = null;
            this.isPreviewModeOn = false;
            this.cameraStream = null;
            this.canvas = document.createElement('canvas');

            this.errorCallback = function(){};

            this.canvas.width = Constant.dimension.width;
            this.canvas.height = Constant.dimension.height;
        }

        //main function
        start(selectedPrinter, errCallback) {
            const d = $.Deferred();
            
            DeviceMaster.select(selectedPrinter)
            .done(()=>{
                DeviceMaster.enterMaintainMode()
                .done(()=>{
                    this._setStoredPrinter(selectedPrinter);
                    this._setPreviewMode(true);
                    this._initCameraStream(selectedPrinter);
                    this.errorCallback = errCallback;
                    d.resolve();
                })
                .fail(()=>{
                    d.reject();
                });
            })
            .fail(()=>{
                d.reject();
            });

            return d.promise();
        }

        end() {
            const d = $.Deferred();
            DeviceMaster.select(this._getStoredPrinter())
            .done(()=>{
                DeviceMaster.endMaintainMode();
            })
            .always(()=>{
                this._reset();
                d.resolve();
            });

            return d.promise();
        }

        preview(x, y) { 
            this._getPhotoAfterMove(x, y)
            .done((imgUrl)=>{
                this._drawIntoBackground(imgUrl, x, y);
            });
        }

        isPreviewMode() {
            return this.isPreviewModeOn;
        }





        _setStoredPrinter(selectedPrinter) {
            this.storedPrinter = selectedPrinter;
        }
        _getStoredPrinter() {
            return this.storedPrinter;
        }
        _setPreviewMode(isOn) {
            this.isPreviewModeOn = isOn;
        }
        

        // TODO: make sure _clearData() and _reset() work well in every cases
        _clearData() {
            this._setStoredPrinter(null);
            this._setPreviewMode(false);
        }

        _reset() {
            this._clearData();
            if(this.cameraStream) {
                DeviceMaster.stopStreamCamera();
            }
        }
        

        
        _initCameraStream(selectedPrinter) {
            this.cameraStream = DeviceMaster.streamCamera(selectedPrinter.uuid);
            this.cameraStream.subscribe(
                ()=>{},
                (err)=>{
                    this._reset();
                    this.errorCallback('Camera Error: ' + err.error);
                }
            );
        }

        _getPhotoAfterMove(x, y) {
            // x, y in pixel
            let d = $.Deferred();
            const maxWidth = Constant.dimension.width;
            const maxHeight = Constant.dimension.height
            if (x < 0 || x > maxWidth || y < 0 || y > maxHeight) {
                return d.reject();
            }

            let movement = {
                f: 6000, // speed
                x: x/10,
                y: y/10
            };

            if (this._getStoredPrinter().model.includes('delta')) {
                // for develop and test in delta
                movement.x = Math.min(movement.x, 50);
                movement.y = Math.min(movement.y, 50);
                movement.z = 50;
            }

            DeviceMaster.maintainMove(movement)
            .done(() => {
                this._getPhotoFromStream(x, y)
                .done((imgUrl)=>{ d.resolve(imgUrl); })
                .fail(()=>{ d.reject(); });
            })
            .fail(() => {
                d.reject();
            });
            return d.promise();
            
        }

        _getPhotoFromStream(x, y) {
            const d = $.Deferred();
            
            this.cameraStream.take(1).subscribe((imageBlob) => {
                const imgUrl = URL.createObjectURL(imageBlob); 
                d.resolve(imgUrl);
            });

            return d.promise();
        }

        _drawIntoBackground(imgUrl, x, y) {
            const img = new Image();
            img.style.opacity = 0.5;
            img.src = imgUrl;
            img.onload = () => {
                // free unused blob memory
                URL.revokeObjectURL(imgUrl);
                this.canvas.getContext('2d').drawImage(img, x - 363, y - 18, 1050, 787.5); // magic number
                this.canvas.toBlob((blob) => {
                    if (this.cameraCanvasUrl) {
                        URL.revokeObjectURL(this.cameraCanvasUrl);
                    }
                    this.cameraCanvasUrl = URL.createObjectURL(blob);
                    window.svgCanvas.setBackground('#fff', this.cameraCanvasUrl);
                });
            };
        }
    }

    const instance = new PreviewModeController();

    return instance;
});