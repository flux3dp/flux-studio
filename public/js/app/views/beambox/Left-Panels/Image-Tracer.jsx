
/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'reactPropTypes',
    'helpers/i18n',
    'app/actions/beambox/beambox-preference',
    'app/actions/beambox/bottom-right-funcs',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/alert-actions',
    'helpers/check-device-status',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/beambox/preview-mode-controller',
    'helpers/api/image-tracer',
    'helpers/sprintf',
    'app/actions/beambox/constant',
    'lib/cropper',
    'plugins/classnames/index',
    'app/stores/beambox-store',
], function(
    $,
    React,
    PropTypes,
    i18n,
    BeamboxPreference,
    BottomRightFuncs,
    Modal,
    Alert,
    DeviceMaster,
    DeviceConstants,
    AlertActions,
    CheckDeviceStatus,
    ProgressActions,
    ProgressConstants,
    PreviewModeController,
    ImageTracerApi,
    sprintf,
    Constant,
    Cropper,
    classNames,
    BeamboxStore
) {
    const LANG = i18n.lang.beambox.left_panel;

    const imageTracerWebSocket = ImageTracerApi();

    //View render the following steps
    const STEP_CHECK = Symbol();
    const STEP_CUT = Symbol();
    const STEP_MODERATE = Symbol();
    const STEP_APPLY = Symbol();

    let cameraOffset = {};

    class ImageTracer extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                currentStep: '',
                previewBlobUrl: '',
                isCropping: false
            };
        }

        componentDidMount() {
            BeamboxStore.onDrawPreviewBlob((payload) => this.getImgBlobUrl(payload));
            BeamboxStore.onCropperShowed((()=>{}));
        }

        componentWillUnmount() {
            BeamboxStore.removeDrawPreviewBlobListener((previewBlobUrl) => this.getImgBlobUrl(previewBlobUrl));
            BeamboxStore.removeCropperShowedListener(()=>{});
        }

        getImgBlobUrl(payload) {
            const previewBlobUrl = `url(${payload.previewBlobUrl})`
            this.setState({ previewBlobUrl: payload.previewBlobUrl })
            console.log('getImgblobUrl');
            console.log(this.state.previewBlobUrl);

        }

        render() {
            const Button = this._renderButton();
            const renderContent = this.state.isCropping ?  this._renderCropper()  : null;
            return (
                <div>
                    {Button}
                    {renderContent}
                    <span id='clear-preview-graffiti-button-placeholder' />
                    <span id='printer-selector-placeholder' />
                </div>
            );
        }

        _svgToCanvas() {
            window.onload = function(){
                //获取svg内容
                var svg = document.getElementById('svg-wrap').innerHTML;

                var canvas = document.getElementById('canv as');
                var c = canvas.getContext('2d');

                //新建Image对象
                var img = new Image();

                //svg内容
                img.src = 'data:image/svg+xml,' + unescape(encodeURIComponent(svg));//svg内容中可以有中文字符
                img.src = 'data:image/svg+xml,' + svg;//svg内容中不能有中文字符

                //svg编码成base64
                img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svg)));//svg内容中可以有中文字符
                img.src = 'data:image/svg+xml;base64,' + window.btoa(svg);//svg内容中不能有中文字符

                //图片初始化完成后调用
                img.onload = function() {
                    //将canvas的宽高设置为图像的宽高
                    canvas.width = img.width;
                    canvas.height = img.height;

                    //canvas画图片
                    c.drawImage(img, 0, 0);

                    //将图片添加到body中
                    document.body.appendChild(img)
                }
            }
        }

        _renderPreview() {
            return (
                <img
                    id="previewYAYA"
                    src={this.state.previewBlobUrl}
                />);
        }

        _renderButton() {
            return (
                <div
                    className='option preview-btn'
                    onClick={() => this._handleClick()}
                >
                    {LANG.image_trace}
                </div>
            );
        }

        _renderCropper() {
            const canvasBackground = document.getElementById('svgcanvas');
            const previewForCropper = document.createElement('img');
            previewForCropper.setAttribute('id', 'previewForCropper');
            // console.log('yo this is renderCropper');
            // console.log(this.state.previewBlobUrl);

            canvasBackground.appendChild(previewForCropper);

            //const imageUrl = URL.createObjectURL(this.state);

            //console.log('-imageUrl-');
            //console.log(imageUrl);

            // const img = document.getElementById('canvasBackground');
            // previewForCropper.addEventListener('load', () => URL.revokeObjectURL(this.state.previewBlobUrl));
            // document.querySelector('img').src = imageUrl;
            previewForCropper.src = this.state.previewBlobUrl;
            // document.open(this.state.previewBlobUrl);

            //    console.log('=====');
            //    console.log(previewForCropper);
            //    console.log('-----');
            //    console.log(this._renderPreview());
            //    console.log('-----');
            //    console.log(canvasBackground);
            //    console.log('=====');



            // const image = document.getElementById('background_image');
            const cropper = new Cropper(previewForCropper, {
                aspectRatio: 1,
                viewMode: 1,
                crop(event) {
                    console.log(event.detail.x);
                    console.log(event.detail.y);
                    console.log(event.detail.width);
                    console.log(event.detail.height);
                    console.log(event.detail.rotate);
                    console.log(event.detail.scaleX);
                    console.log(event.detail.scaleY);
                },
            });

        }

        _handleClick() {
            this.props.onClick();
            this.setState({ isCropping: true });
            // BottomRightFuncs.uploadForTrace();
        }
    };
    return ImageTracer;
});
