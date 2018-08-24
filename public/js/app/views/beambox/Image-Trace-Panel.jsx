
/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'reactPropTypes',
    'app/actions/beambox',
    'app/actions/beambox/preview-mode-background-drawer',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/stores/beambox-store',
    'helpers/i18n',
    'helpers/image-data',
    'helpers/api/image-tracer',
    'jsx!widgets/Modal',
    'jsx!widgets/Slider-Control',
    'lib/cropper'
], function(
    $,
    React,
    PropTypes,
    BeamboxActions,
    PreviewModeBackgroundDrawer,
    FnWrapper,
    BeamboxStore,
    i18n,
    ImageData,
    ImageTracerApi,
    Modal,
    SliderControl,
    Cropper
) {
    const LANG = i18n.lang.beambox.image_trace_panel;

    const imageTracerWebSocket = ImageTracerApi();

    const TESTING_IT = false;

    //View render the following steps
    const STEP_NONE = Symbol();
    const STEP_OPEN = Symbol();
    const STEP_CROP = Symbol();
    const STEP_TUNE = Symbol();
    const STEP_APPLY = Symbol();

    let cropper = null;
    let grayscaleCroppedImg = null;

    const TestImg = 'img/hehe.png';

    class ImageTracePanel extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                currentStep: STEP_NONE,
                croppedBlobUrl: '',
                croppedCameraCanvasBlobUrl: '',
                imageTrace: '',
                cropData: {},
                preCrop: {},
                brightness: 100,
                contrast: 100,
                threshold: 255
            };
        }

        componentDidMount() {
            BeamboxStore.onCropperShown(() => this.openCropper());

            if (TESTING_IT) {
                console.log('dev ! testing it-panel');
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d');

                const img = new Image();
                img.src = TestImg;
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        const croppedBlobUrl = URL.createObjectURL(blob);

                        this.setState({ croppedBlobUrl });
                        ImageData(
                            croppedBlobUrl,
                            {
                                height: 0,
                                width: 0,
                                grayscale: {
                                    is_rgba: true,
                                    is_shading: true,
                                    threshold: 255,
                                    is_svg: false
                                },
                                onComplete: (result) => {
                                    grayscaleCroppedImg = result.canvas.toDataURL('image/png');
                                    this.setState({ currentStep : STEP_TUNE })
                                }
                            }
                        );
                    });
                };
            }
        }

        componentWillUnmount() {
            BeamboxStore.removeCropperShownListener(() => this.openCropper());
        }

        _getImageTrace(imageTrace) {
            this.setState({ imageTrace });

            if(this.state.currentStep === STEP_TUNE) {
                this.next();
            }
        }

        openCropper() {
            if( this.state.currentStep === STEP_NONE) {
                this.next();
            }
        }

        next() {
            switch(this.state.currentStep) {
                case STEP_NONE:
                    this.setState({ currentStep: STEP_OPEN });
                    break;
                case STEP_OPEN:
                    this.setState({ currentStep: STEP_CROP });
                    break;
                case STEP_CROP:
                    this.setState({ currentStep: STEP_TUNE });
                    this._destroyCropper();
                    break;
                case STEP_TUNE:
                    this.setState({ currentStep: STEP_APPLY });
                    break;
                case STEP_APPLY:
                    this.setState({ currentStep: STEP_NONE });
                    break;
            }
        }

        prev() {
            switch(this.state.currentStep) {
                case STEP_CROP:
                    this.setState({ currentStep: STEP_NONE })
                    break;
                case STEP_TUNE:
                    this.setState({ currentStep: STEP_CROP })
                    break;
                case STEP_APPLY:
                    this.setState({ currentStep: STEP_TUNE })
                    break;
                default:
                    break;
            }
        }

        _backToCropper() {
            this.prev();
            URL.revokeObjectURL(this.state.croppedBlobUrl);
            this.setState({
                brightness: 100,
                contrast: 100,
                threshold: 255
            });
        }

        _backToTune() {
            this.prev();
            this.setState({ imageTrace: '' });
        }

        async _calculateImageTrace() {
            const {
                croppedBlobUrl,
                brightness,
                contrast,
                threshold
            } = this.state;
            const d = $.Deferred();
            const img = document.getElementById('tunedImage');

            fetch(croppedBlobUrl)
                .then(res => res.blob())
                .then((blob) => {
                    var fileReader = new FileReader();
                    fileReader.onloadend = (e) => {
                        imageTracerWebSocket.upload(e.target.result, { brightness: brightness/100, contrast: contrast/100, threshold })
                            .done((res)=>{
                                d.resolve(res);
                                this._getImageTrace(res.svg);
                            })
                            .fail((res)=>{
                                d.reject(res.toString());
                            });
                    };
                    fileReader.readAsArrayBuffer(blob);
                })
                .catch((err) => {
                    d.reject(err);
                });
        }

        _handleCropping() {
            const cropData = cropper.getData();
            const croppedCanvas = cropper.getCroppedCanvas();

            croppedCanvas.toBlob((blob) => {
                const croppedBlobUrl = URL.createObjectURL(blob);

                this.setState({ cropData, croppedBlobUrl });

                ImageData(
                    croppedBlobUrl,
                    {
                        height: 0,
                        width: 0,
                        grayscale: {
                            is_rgba: true,
                            is_shading: true,
                            threshold: 255,
                            is_svg: false
                        },
                        onComplete: (result) => {
                            grayscaleCroppedImg = result.canvas.toDataURL('image/png');
                            this.next();
                        }
                    }
                );
            });


        }

        _handleCropperCancel() {
            this._destroyCropper();
            this.prev();
            BeamboxActions.backToPreviewMode();
        }

        _handleParameterChange(id, value) {
            switch(id) {
                case 'brightness':
                    this.setState({ brightness: value });
                    this._applyFilterEffect();
                    break;
                case 'contrast':
                    this.setState({ contrast: value });
                    this._applyFilterEffect();
                    break;
                case 'threshold':
                    ImageData(
                        this.state.croppedBlobUrl,
                        {
                            height: 0,
                            width: 0,
                            grayscale: {
                                is_rgba: true,
                                is_shading: true,
                                threshold: parseInt(value),
                                is_svg: false
                            },
                            onComplete: (result) => {
                                const img = document.getElementById('tunedImage');

                                img.src = result.canvas.toDataURL('image/png');
                                this.setState({ threshold: value });
                            }
                        }
                    );
                    break;
            }
        }

        _applyFilterEffect() {
            const { brightness, contrast } = this.state;
            const img = document.getElementById('tunedImage');
            const filterValue = `brightness(${brightness}%) contrast(${contrast}%)`;

            $(img).css({
                '-webkit-filter': filterValue,
            });
        }

        _destroyCropper() {
            if(cropper) {
                cropper.destroy();
            }
        }

        _handleImageTraceCancel() {
            URL.revokeObjectURL(this.state.croppedBlobUrl);
            if (this.state.croppedCameraCanvasBlobUrl != '') {
                URL.revokeObjectURL(this.state.croppedCameraCanvasBlobUrl);
            }
            this.setState({
                currentStep: STEP_NONE,
                croppedBlobUrl: '',
                croppedCameraCanvasBlobUrl: '',
                imageTrace: '',
                brightness: 100,
                contrast: 100,
                threshold: 255
            });
            BeamboxActions.backToPreviewMode();
        }

        _handleImageTraceComplete() {
            this.next();
        }

        async _pushImageTrace() {
            const {
                cropData,
                preCrop,
                imageTrace,
                brightness,
                contrast,
                threshold,
                croppedBlobUrl
            } = this.state;
            const tunedImage = document.getElementById('tunedImage');

            const d = $.Deferred();

            fetch(croppedBlobUrl)
                .then(res => res.blob())
                .then((blob) => {
                    var fileReader = new FileReader();
                    fileReader.onloadend = (e) => {
                        imageTracerWebSocket.basic(e.target.result, { brightness: brightness/100, contrast: contrast/100})
                            .done((res)=>{
                                d.resolve(res);
                                const url = URL.createObjectURL(res);

                                if (TESTING_IT) {
                                    const testingCropData = {
                                        x: tunedImage.x,
                                        y: tunedImage.y,
                                        width: tunedImage.width,
                                        height: tunedImage.height
                                    }
                                    const testingPreCrop = {
                                        offsetX: 100,
                                        offsetY: 100
                                    }

                                    FnWrapper.insertImage(url, testingCropData, testingPreCrop, threshold);
                                    FnWrapper.insertSvg(imageTrace, testingCropData, testingPreCrop);
                                } else {
                                    FnWrapper.insertImage(url, cropData, preCrop, threshold);
                                    FnWrapper.insertSvg(imageTrace, cropData, preCrop);
                                }
                            })
                            .fail((res)=>{
                                d.reject(res.toString());
                            });
                    };
                    fileReader.readAsArrayBuffer(blob);
                })
                .catch((err) => {
                    d.reject(err);
                })
            URL.revokeObjectURL(this.state.croppedBlobUrl);
            if (this.state.croppedCameraCanvasBlobUrl != '') {
                URL.revokeObjectURL(this.state.croppedCameraCanvasBlobUrl);
            }
            this.setState({
                currentStep: STEP_NONE,
                croppedBlobUrl: '',
                croppedCameraCanvasBlobUrl: '',
                imageTrace: '',
                brightness: 100,
                contrast: 100,
                threshold: 255
            });
            BeamboxActions.endImageTrace();
        }

        _renderImageToCrop() {
            const previewBlobUrl = PreviewModeBackgroundDrawer.getCameraCanvasUrl();

            return (
                <img
                    id= 'previewForCropper'
                    onLoad={()=> this._renderCropper()}
                    src={previewBlobUrl}
                />);
        }

        _renderCropper() {
            const imageObj = document.getElementById('previewForCropper');
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const coordinates = PreviewModeBackgroundDrawer.getCoordinates();
            const sourceWidth = (coordinates.maxX - coordinates.minX) + 465.17;
            const sourceHeight = (coordinates.maxY - coordinates.minY) + 465.17;
            const reference = (640/sourceWidth < 600/sourceHeight) ? 'w' : 'h';
            const ratio = (reference === 'w') ? sourceHeight/sourceWidth : sourceWidth/sourceHeight;
            const destWidth = (reference === 'w') ? 640 : 640 * ratio;
            const destHeight = (reference === 'h') ? 600 : 600 * ratio;

            this.setState({
                preCrop: {
                    offsetX: coordinates.minX,
                    offsetY: coordinates.minY,
                },
            });

            cropper = new Cropper(
                imageObj,
                {
                    zoomable: false,
                    viewMode: 0,
                    targetWidth: destWidth,
                    targetHeight: destHeight
                }
            );

        }

        _renderCropperModal() {
            return (
                <Modal>
                    <div className='cropper-panel'>
                        <div className='main-content'>
                            <img
                                id= 'previewForCropper'
                                onLoad={()=> this._renderCropper()}
                                src={this.state.croppedCameraCanvasBlobUrl}
                            />
                        </div>
                        <div className='footer'>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this._handleCropping()}
                            >
                                {LANG.next}
                            </button>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this._handleCropperCancel()}
                            >
                                {LANG.cancel}
                            </button>
                        </div>
                    </div>
                </Modal>
            );
        }

        _getImageTraceDom() {
            const tunedImage = document.getElementById('tunedImage');
            const x = tunedImage.x;
            const y = tunedImage.y;
            const w = tunedImage.width;
            const h = tunedImage.height;

            const imgStyle = {
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`
            };

            if (this.state.imageTrace === null) {
                return null;
            }

            return (
                <img
                    id = 'imageTrace'
                    style = {imgStyle}
                    src = {'data:image/svg+xml; utf8, ' + encodeURIComponent(this.state.imageTrace)}
                />
            );

        }

        _cropCameraCanvas() {
            const imageObj = document.getElementById('cameraCanvas');
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const canvasBackground = document.getElementById('canvasBackground');
            const coordinates = PreviewModeBackgroundDrawer.getCoordinates();
            const sourceX = coordinates.minX;
            const sourceY = coordinates.minY;
            const sourceWidth = (coordinates.maxX - coordinates.minX)  + 465.17;
            const sourceHeight = (coordinates.maxY - coordinates.minY) + 465.17 ;
            const destX = 0;
            const destY = 0;
            const destWidth = (coordinates.maxX - coordinates.minX)/6.286 + 74;
            const destHeight = (coordinates.maxY - coordinates.minY)/6.286+ 74;

            canvas.width = sourceWidth;
            canvas.height = sourceHeight;

            context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, sourceWidth, sourceHeight);
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);

                if (this.state.croppedCameraCanvasBlobUrl != '') {
                    URL.revokeObjectURL(this.state.croppedCameraCanvasBlobUrl);
                }

                this.setState({ croppedCameraCanvasBlobUrl: url });

                if (this.state.currentStep === STEP_OPEN) {
                    this.next();
                }
            });
        }


        _renderImageTraceModal() {
            const {
                brightness,
                contrast,
                threshold,
                currentStep,
                imageTrace
            } = this.state;
            const footer = this._renderImageTraceFooter();
            const it = ((currentStep === STEP_APPLY) && (imageTrace!=='')) ? this._getImageTraceDom() : null;

            return (
                <Modal>
                    <div className='image-trace-panel'>
                        <div className='main-content'>
                                <div className='cropped-container'>
                                    <img id='tunedImage' src={grayscaleCroppedImg} />
                                    {it}
                                </div>
                                <div className='right-part'>
                                <div className='scroll-bar-container'>
                                    <div className='title'>{LANG.tuning}</div>
                                    <SliderControl
                                        id='brightness'
                                        key='brightness'
                                        label={LANG.brightness}
                                        min={60}
                                        max={140}
                                        step={1}
                                        unit='percent'
                                        default={parseInt(brightness)}
                                        onChange={(id, val) => this._handleParameterChange(id, val)}
                                    />
                                    <SliderControl
                                        id='contrast'
                                        key='contrast'
                                        label={LANG.contrast}
                                        min={60}
                                        max={140}
                                        step={1}
                                        unit='percent'
                                        default={parseInt(contrast)}
                                        onChange={(id, val) => this._handleParameterChange(id, val)}
                                    />
                                    <SliderControl
                                        id='threshold'
                                        key='threshold'
                                        label={LANG.threshold}
                                        min={0}
                                        max={255}
                                        step={1}
                                        default={parseInt(threshold)}
                                        onChange={(id, val) => this._handleParameterChange(id, val)}
                                    />
                                </div>
                                </div>
                        </div>
                        {footer}
                    </div>
                </Modal>
            );
        }

        _renderImageTraceFooter() {
            if (this.state.currentStep === STEP_TUNE) {
                return (
                    <div className='footer'>
                        <button
                            className='btn btn-default pull-right'
                            onClick={() => this._handleImageTraceCancel()}
                        >
                            {LANG.cancel}
                        </button>
                        <button
                            className='btn btn-default pull-right'
                            onClick={() => this._calculateImageTrace()}
                        >
                            {LANG.apply}
                        </button>
                        <button
                            className='btn btn-default pull-right'
                            onClick={() => this._backToCropper()}
                        >
                            {LANG.back}
                        </button>
                    </div>
                );
            } else {
                return (
                    <div className='footer'>
                        <button
                            className='btn btn-default pull-right'
                            onClick={() => this._handleImageTraceCancel()}
                        >
                            {LANG.cancel}
                        </button>
                        <button
                            className='btn btn-default pull-right'
                            onClick={() => this._pushImageTrace()}
                        >
                            {LANG.okay}
                        </button>
                        <button
                            className='btn btn-default pull-right'
                            onClick={() => this._calculateImageTrace()}
                        >
                            {LANG.apply}
                        </button>
                        <button
                            className='btn btn-default pull-right'
                            onClick={() => this._backToTune()}
                        >
                            {LANG.back}
                        </button>
                    </div>
                );
            }
        }

        _renderContent() {
            let renderContent = null;

            switch(this.state.currentStep) {
                case STEP_CROP:
                    renderContent = this._renderCropperModal();
                    break;
                case STEP_TUNE:
                    renderContent = this. _renderImageTraceModal();
                    break;
                case STEP_APPLY:
                    renderContent = this. _renderImageTraceModal();
                    break;
                default:
                    break;
            }

            return renderContent;
        }

        render() {
            const renderContent = this._renderContent();
            const canvasBackgroundUrl = PreviewModeBackgroundDrawer.getCameraCanvasUrl() || ''  ;

            return (
                <div id='image-trace-panel-outer'>
                    {renderContent}
                    <img
                        id= 'cameraCanvas'
                        onLoad={() => this._cropCameraCanvas()}
                        src={canvasBackgroundUrl}
                    />
                </div>
            );
        }
    };
    return ImageTracePanel;
});
