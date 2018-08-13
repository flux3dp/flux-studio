
/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'reactPropTypes',
    'app/actions/beambox',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/stores/beambox-store',
    'helpers/i18n',
    'helpers/image-data',
    'helpers/api/image-tracer',
    'jsx!widgets/Modal',
    'lib/cropper'
], function(
    $,
    React,
    PropTypes,
    BeamboxActions,
    FnWrapper,
    BeamboxStore,
    i18n,
    ImageData,
    ImageTracerApi,
    Modal,
    Cropper
) {
    const LANG = i18n.lang.beambox.image_trace_panel;

    const imageTracerWebSocket = ImageTracerApi();

    const TESTING_IT = false;

    //View render the following steps
    const STEP_NONE = Symbol();
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
                previewBlobUrl: '',
                croppedBlobUrl: '',
                imageTrace: '',
                cropData: {},
                brightness: 100,
                contrast: 100,
                threshold: 255
            };
        }

        componentDidMount() {
            BeamboxStore.onDrawPreviewBlob((payload) => this.getImgBlobUrl(payload));
            BeamboxStore.onCropperShown(() => this.openCropper());
            BeamboxStore.onGetImageTrace((payload) => this.getImageTrace(payload));

            if (TESTING_IT) {
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d');

                const img = new Image();
                img.src = TestImg;
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img,0,0);
                    canvas.toBlob((blob) => {
                        const croppedBlobUrl = URL.createObjectURL(blob);
                        this.setState({
                            roppedBlobUrl,
                            currentStep : STEP_TUNE
                        });
                    });
                };
            }
        }

        componentWillUnmount() {
            BeamboxStore.removeDrawPreviewBlobListener((payload) => this.getImgBlobUrl(payload));
            BeamboxStore.removeCropperShownListener(() => this.openCropper());
            BeamboxStore.removeGetImageTraceListener((payload) => this.getImageTrace(payload));
        }

        getImageTrace(payload) {
            this.setState({ imageTrace: payload.imageTrace });

            if(this.state.currentStep === STEP_TUNE) {
                this.next();
            }
        }

        getImgBlobUrl(payload) {
            this.setState({ previewBlobUrl: payload.previewBlobUrl })
        }

        openCropper() {
            if( this.state.currentStep === STEP_NONE) {
                this.next();
            }
        }

        next() {
            switch(this.state.currentStep) {
                case STEP_NONE:
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

        _handleBrightnessChange(e) {
            this.setState({ brightness: e.target.value });
            this._applyFilterEffect();
        }

        _handleContrastChange(e) {
            this.setState({ contrast: e.target.value });
            this._applyFilterEffect();
        }

        _handleThresholdChange(e) {
            const img = document.getElementById('tunedImage');

            this.setState({ threshold: e.target.value });

            ImageData(
                this.state.croppedBlobUrl,
                {
                    height: 0,
                    width: 0,
                    grayscale: {
                        is_rgba: true,
                        is_shading: true,
                        threshold: parseInt(this.state.threshold),
                        is_svg: false
                    },
                    onComplete: function(result) {
                        img.src = result.canvas.toDataURL('image/png')
                    }
                }
            );

        }

        _applyFilterEffect() {
            const { brightness, contrast } = this.state;
            const img = document.getElementById('tunedImage');
            const filterValue = `brightness(${brightness}%) contrast(${contrast}%)`;

            $(img).css({
                "-webkit-filter": filterValue,
            });
        }

        _destroyCropper() {
            cropper.destroy();
        }

        _handleImageTraceCancel() {
            URL.revokeObjectURL(this.state.croppedBlobUrl);
            this.setState({
                currentStep: STEP_NONE,
                croppedBlobUrl: '',
                imageTrace: '',
                brightness: 100,
                contrast: 100,
                threshold: 90
            });
            BeamboxActions.backToPreviewMode();
        }

        _handleImageTraceComplete() {
            this.next();
        }

        _pushImageTrace() {
            const { cropData, imageTrace } = this.state;
            FnWrapper.insertSvg(imageTrace, cropData);
            this._handleImageTraceCancel();
            BeamboxActions.endImageTrace();
        }

        _renderCropper() {
            const previewForCropper = document.getElementById('previewForCropper');

            cropper = new Cropper(previewForCropper, {
                zoomable: false,
                viewMode: 0,
            });
        }

        _renderCropperModal() {
            return (
                <Modal>
                    <div className='cropper-panel'>
                        <div className='main-content'>
                            <img
                                id= 'previewForCropper'
                                onLoad={()=> this._renderCropper()}
                                src={this.state.previewBlobUrl}
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
                    src = {'data:image/svg+xml; utf8, ' + encodeURIComponent(this.state.imageTrace.replace('black', '#ff00ff'))}
                />
            );

        }

        _renderImageTraceModal() {
            const {
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
                                <img id="tunedImage" src={grayscaleCroppedImg} />
                                {it}
                            </div>
                            <div className='scroll-bar-container'>
                                <span className="text-center header">
                                    {LANG.brightness}
                                </span>
                                <input
                                    type='range'
                                    min={50}
                                    max={150}
                                    value={this.state.brightness}
                                    onChange={(e) => this._handleBrightnessChange(e)}
                                />
                            </div>
                            <div className='scroll-bar-container'>
                                <span className="text-center header">
                                    {LANG.contrast}
                                </span>
                                <input
                                    type='range'
                                    min={50}
                                    max={150}
                                    value={this.state.contrast}
                                    onChange={(e) => this._handleContrastChange(e)}
                                />
                            </div>
                            <div className='scroll-bar-container'>
                                <span className="text-center header">
                                    {LANG.threshold}
                                </span>
                                <input
                                    type='range'
                                    min={0}
                                    max={255}
                                    value={this.state.threshold}
                                    onChange={(e) => this._handleThresholdChange(e)}
                                />
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
            return (
                <div id='image-trace-panel-outer'>
                    {renderContent}
                </div>
            );
        }
    };
    return ImageTracePanel;
});
