
/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'reactPropTypes',
    'helpers/i18n',
    'jsx!widgets/Modal',
    'helpers/api/image-tracer',
    'lib/cropper',
    'app/stores/beambox-store',
], function(
    $,
    React,
    PropTypes,
    i18n,
    Modal,
    ImageTracerApi,
    Cropper,
    BeamboxStore
) {
    const LANG = i18n.lang.beambox.left_panel;

    const imageTracerWebSocket = ImageTracerApi();

    //View render the following steps
    const STEP_NONE = Symbol();
    const STEP_CROP = Symbol();
    const STEP_TUNE = Symbol();
    const STEP_APPLY = Symbol();

    let cameraOffset = {};
    let cropper = null;

    class ImageTracePanel extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                currentStep: STEP_NONE,
                previewBlobUrl: '',
                croppedBlobUrl: '',
                tunedBlobUrl: '',
                imageTraceUrl: '',
                brightness: 100,
                contrast: 100,
                cropperShown: false
            };
        }

        componentDidMount() {
            BeamboxStore.onDrawPreviewBlob((payload) => this.getImgBlobUrl(payload));
            BeamboxStore.onCropperShown((() => this.openCropper()));
        }

        componentWillUnmount() {
            BeamboxStore.removeDrawPreviewBlobListener((previewBlobUrl) => this.getImgBlobUrl(previewBlobUrl));
            BeamboxStore.removeCropperShownListener(() => this.openCropper());
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

        _handleBackToCropper() {
            this.prev();
        }

        async _calculateImageTrace() {
            console.log('Start Journey!');
            // const _doSendPictureTask = async () =>
            const img = document.getElementById('tunedImage');
            const blob = new Blob([img.outerHTML], {
              "type": "text/html"
            });
            // create `objectURL` of `blob`
            const blobUrl = window.URL.createObjectURL(blob);

            const d = $.Deferred();

            let fileReader = new FileReader();
            fileReader.onloadend = (e) => {
                imageTracerWebSocket.upload(e.target.result)
                    .done((resp)=>{
                        d.resolve(resp);
                    })
                    .fail((resp)=>{
                        d.reject(resp.toString());
                    });
            }
            fileReader.readAsArrayBuffer(blob);

            /*
            fetch(imgBlobUrl)
                .then(res => res.blob())
                .then((blob) => {
                    var fileReader = new FileReader();
                    fileReader.onloadend = (e) => {
                        imageTracerWebSocket.upload(e.target.result)
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
                // return await d.promise();
            */
            // imageTracerWebSocket.upload(e.target.result, { threshold })
            // const traceString = await imageTracerWebSocket.upload(this.state.croppedBlobUrl);
            console.log('YAYA calculate Image Trace');
            console.log(d);
            console.log('HoHo ~~ weird ');

        }

        _handleCropperCheckBoxClicked() {
            const cropData = cropper.getData();
            const croppedCanvas = cropper.getCroppedCanvas();

            croppedCanvas.toBlob((blob) => {
                const croppedBlobUrl = URL.createObjectURL(blob);

                this.setState({ croppedBlobUrl });

                this.next();
            });
        }

        _handleCropperCancel() {
            this._destroyCropper();
            this.prev();
        }

        _handleBrightnessChange(e) {
            this.setState({ brightness: e.target.value });
            this._applyFilterEffect();
            console.log('Brightness Changed', this.state.brightness);
        }

        _handleContrastChange(e) {
            this.setState({ contrast: e.target.value });
            this._applyFilterEffect();
            console.log('Contrast Changed', this.state.contrast);
        }

        _applyFilterEffect() {
            const { brightness, contrast } = this.state;
            const img = document.getElementById('tunedImage');
            const filterValue = `brightness(${brightness}%) contrast(${contrast}%)`;

            // set `img` `filter` to `filterVal`
            $(img).css({
                "-webkit-filter": filterValue,
            });
        }

        _renderCropper() {
            if (this.state.cropperShown) {
                return;
            }

            const previewForCropper = document.getElementById('previewForCropper');
            cropper = new Cropper(previewForCropper, {
                viewMode: 0,
            });
            this.setState({ cropperShown: true })
        }

        _renderCropperModal() {
            return (
                <Modal onClose={()=>{}} >
                    <div className='cropper-panel'>
                        <div className='main-content'>
                            <img
                                id= 'previewForCropper'
                                onLoad={()=> this._renderCropper()}
                                src={this.state.previewBlobUrl}
                            />
                        </div>
                        <div className='footer'>
                            <div
                                className='cropper-check-box'
                                onClick={() => this._handleCropperCheckBoxClicked()}
                            >
                                <img src='img/check-box.png' />
                            </div>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this._handleCropperCancel()}
                            >{'Cancel'}
                            </button>
                        </div>
                    </div>
                </Modal>
            );
        }

        _destroyCropper() {
            cropper.destroy();
        }

        _renderTuningDialog() {
            return (
                <Modal onClose={()=>{}} >
                    <div className='image-trace-panel'>
                        <div className='main-content'>
                            <div className='cropped-container'>
                                <img id="tunedImage" src={this.state.croppedBlobUrl} />
                            </div>
                        </div>
                        <div className='footer'>
                            <div className='scroll-bar-container'>
                                <input
                                    type='range'
                                    min={50}
                                    max={150}
                                    value={this.state.brightness}
                                    onChange={(e) => this._handleBrightnessChange(e)}
                                />
                            </div>
                            <div className='scroll-bar-container'>
                                <input
                                    type='range'
                                    min={50}
                                    max={150}
                                    value={this.state.contrast}
                                    onChange={(e) => this._handleContrastChange(e)}
                                />
                            </div>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this._calculateImageTrace()}
                            >{'SEND!'}
                            </button>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => {
                                    this.props.onClose();
                                }}
                            >{'ccc'}
                            </button>
                        </div>
                    </div>
                </Modal>
            );
        }

        _handleImageTraceComplete() {
            this.next();
        }

        _renderImageTraceResult() {
            return (
                <Modal onClose={()=>{}} >
                    <div className='image-trace-panel'>
                        <div className='main-content'>
                            <div className='cropped-container'>
                                <img src={this.state.imageTraceUrl} />
                            </div>
                        </div>
                        <div className='footer'>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this._calculateImageTrace()}
                            >{'OKAY'}
                            </button>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => {
                                    this.props.onClose();
                                }}
                            >{'BACK'}
                            </button>
                        </div>
                    </div>
                </Modal>
            );
        }

        _renderContent() {
            let renderContent = null;

            switch(this.state.currentStep) {
                case STEP_CROP:
                    renderContent = this._renderCropperModal();
                    break;
                case STEP_TUNE:
                    renderContent = this._renderTuningDialog();
                    break;
                case STEP_APPLY:
                    renderContent = this._renderImageTraceResult();
                    break;
                default:
                    break;
            }

            return renderContent;
        }

        render() {
            const renderContent = this._renderContent();
            return (
                <div>
                    {renderContent}
                </div>
            );
        }
    };
    return ImageTracePanel;
});
