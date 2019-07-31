
/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/image-data',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'jsx!widgets/Modal',
    'jsx!widgets/Slider-Control',
    'lib/cropper'
], function(
    $,
    React,
    i18n,
    ImageData,
    ProgressActions,
    ProgressConstants,
    Modal,
    SliderControl,
    Cropper
) {
    const LANG = i18n.lang.beambox.photo_edit_panel;
    
    let cropper = null;
    class PhotoEditPanel extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                src: this.props.src,
                srcHistory: [],
                isCropping: false,
                wRatio: 1,
                hRatio: 1,
                threshold: $(this.props.element).attr('data-threshold')
            };
            this.sharpenSigma = 1;
            let tempImg = new Image();
            const self = this;
            tempImg.src = this.state.src;
            tempImg.onload = function() {
                self.state.origImage = tempImg;
                self.state.imagewidth = tempImg.naturalWidth;
                self.state.imageheight = tempImg.naturalHeight;
            };
        }

        componentDidMount() {
        }

        componentWillUnmount() {
        }

        _handleCancel() {
            let src = this.state.src
            while (this.state.srcHistory.length > 0) {
                URL.revokeObjectURL(src);
                src = this.state.srcHistory.pop();
            }
            this.props.unmount();
        }

        _handleComplete() {
            let self = this;
            this.batchCmd = new svgedit.history.BatchCommand('Photo edit');
            let elem = this.props.element;
            this._handleSetAttribute('origImage', this.state.src);
            if (this.state.wRatio < 1) {
                this._handleSetAttribute('width', $(elem).attr('width') * this.state.wRatio);
            }
            if (this.state.hRatio < 1) {
                this._handleSetAttribute('height', $(elem).attr('height') * this.state.hRatio);
            }
            this._handleSetAttribute('data-threshold', this.state.threshold);

            ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, LANG.processing);
            ImageData(
                this.state.src, {
                    grayscale: {
                        is_rgba: true,
                        is_shading: false,
                        threshold: this.state.threshold,
                        is_svg: false
                    },
                    onComplete: function (result) {
                        self._handleSetAttribute('xlink:href', result.canvas.toDataURL());
                        svgCanvas.undoMgr.addCommandToHistory(self.batchCmd);
                        svgCanvas.selectOnly([elem], true);
                        ProgressActions.close();
                    }
                }
            );
            let src;
            while (this.state.srcHistory.length > 0) {
                URL.revokeObjectURL(src);
                src = this.state.srcHistory.pop();
            }

            this.props.unmount();
        }

        _handleSetAttribute(attr, value) {
            let elem = this.props.element;
            svgCanvas.undoMgr.beginUndoableChange(attr, [elem]);
            elem.setAttribute(attr, value);
            let cmd = svgCanvas.undoMgr.finishUndoableChange();
            this.batchCmd.addSubCommand(cmd);
        }

        _handleGoBack() {
            URL.revokeObjectURL(this.state.src);
            const src = this.state.srcHistory.pop();
            this.setState({src: src});
        }

        _handleParameterChange(id, val) {
            if (id === 'sharpen-sigma'){
                this.sharpenSigma = parseInt(val);
            } 

        }

        _renderPhotoEditeModal() {
            if (this.state.src !== this.lastSrc) {
                this._handleGrayScale();
                this.lastSrc = this.state.src;
            }
            const maxAllowableWidth = $('.top-menu').width() - 390;
            const maxAllowableHieght = $(window).height() - 2 * $('.top-menu').height() - 120;
            const containerStyle = (this.state.imagewidth / maxAllowableWidth > this.state.imageheight / maxAllowableHieght) ? 
                {width: `${maxAllowableWidth}px`} : {height: `${maxAllowableHieght}px`};
            const footer = this._renderPhotoEditFooter();
            
            return (
                <Modal>
                    <div className='photo-edit-panel'>
                        <div className='main-content'>
                            <div className='image-container' style={containerStyle} >
                                <img id='original-image' style={containerStyle} src={this.state.grayScaleUrl} />
                            </div>
                            <div className='right-part'>
                                <div className='scroll-bar-container'>
                                    <div className='title'>{LANG.phote_edit}</div>
                                    {this._renderSharpenPanel()}
                                    {this._renderCropPanel()}
                                    {this._renderInvertPanel()}
                                </div>
                            </div>
                        </div>
                        {footer}
                    </div>
                </Modal>
            );
        }

        _handleGrayScale() {
            ImageData(
                this.state.src,
                {
                    grayscale: {
                        is_binary: true,
                        is_rgba: true,
                        is_shading: false,
                        threshold: this.state.threshold,
                        is_svg: false
                    },
                    onComplete: (result) => {
                        if (this.state.grayScaleUrl) {
                            URL.revokeObjectURL(this.state.grayScaleUrl);
                        }
                        this.setState({grayScaleUrl: result.canvas.toDataURL('image/png')});
                    }
                }
            );
        }

        _renderSharpenPanel() {
            const isDisable = this.state.isCropping;
            return (
                <div className='sub-functions with-slider'> 
                    <div className='title'>{LANG.sharpen}</div>
                    <SliderControl
                        id='sharpen-sigma'
                        key='sharpen-sigma'
                        label={LANG.sharpen_radius}
                        min={1}
                        max={20}
                        step={1}
                        default={1}
                        onChange={(id, val) => this._handleParameterChange(id, val)}
                    />
                    {this._renderFooterButton(LANG.apply, this._handleSharpen.bind(this), isDisable)}
                </div>
            );
        }

        _handleSharpen() {
            const sharp = require('sharp');
            const d = $.Deferred();
            let imgBlobUrl = this.state.src;
            let imageFile;
            fetch(imgBlobUrl)
                .then(res => res.blob())
                .then((blob) => {
                    var fileReader = new FileReader();
                    fileReader.onloadend = (e) => {
                        imageFile = e.target.result;
                        imageFile = new Buffer.from(imageFile);
                        ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, LANG.processing);
                        sharp(imageFile).sharpen(this.sharpenSigma).toBuffer()
                            .then((data) => {
                                ProgressActions.close();
                                data = new Buffer.from(data);;
                                const newBlob = new Blob([data]);
                                const src = URL.createObjectURL(newBlob);
                                this.state.srcHistory.push(this.state.src);
                                this.setState({src: src});
                            })
                            .catch((err) => {console.log(err);});
                    };
                    fileReader.readAsArrayBuffer(blob);
                })
                .catch((err) => {
                    d.reject(err);
                });
        }

        _renderCropPanel() {
            let buttons = []
            if (this.state.isCropping) {
                buttons.push(this._renderFooterButton(LANG.apply, this._handleCrop.bind(this)));
                buttons.push(this._renderFooterButton(LANG.cancel, this._handleCancelCrop.bind(this)));
            } else {
                buttons = this._renderFooterButton(LANG.start, this._handleStartCrop.bind(this));
            }
            return (
                <div className='sub-functions'> 
                    <div className='title'>{LANG.crop}</div>
                    {buttons}
                </div>
            );
        }

        _handleStartCrop() {
            this.setState({isCropping: true});
            const image = document.getElementById('original-image');
            this.sizeBeforeCrop = {
                width: image.naturalWidth,
                height: image.naturalHeight
            }
            cropper = new Cropper(
                image,
                {
                    zoomable: false,
                    viewMode: 0,
                    targetWidth: image.width,
                    targetHeight: image.height
                }
            );
        }

        _handleCrop() {
            const cropData = cropper.getData();
            console.log(cropData);
            const extractPara = {
                left: parseInt(cropData.x),
                top: parseInt(cropData.y),
                height: parseInt(cropData.height),
                width: parseInt(cropData.width)
            };
            this.state.wRatio *= extractPara.width / this.sizeBeforeCrop.width;
            this.state.hRatio *= extractPara.height / this.sizeBeforeCrop.height;
            const sharp = require('sharp');
            let imgBlobUrl = this.state.src;
            let imageFile;
            fetch(imgBlobUrl)
                .then(res => res.blob())
                .then((blob) => {
                    var fileReader = new FileReader();
                    fileReader.onloadend = (e) => {
                        imageFile = e.target.result;
                        imageFile = new Buffer.from(imageFile);
                        ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, LANG.processing);
                        sharp(imageFile).extract(extractPara).toBuffer()
                            .then((data) => {
                                ProgressActions.close();
                                data = new Buffer.from(data);;
                                const newBlob = new Blob([data]);
                                const src = URL.createObjectURL(newBlob);
                                this.state.srcHistory.push(this.state.src);
                                this._destroyCropper();
                                this.setState({
                                    src: src,
                                    isCropping: false,
                                    imagewidth: cropData.width,
                                    imageheight: cropData.height
                                });
                            })
                            .catch((err) => {console.log(err);});
                    };
                    fileReader.readAsArrayBuffer(blob);
                })
                .catch((err) => {
                    d.reject(err);
                });
        }

        _handleCancelCrop() {
            this._destroyCropper();
            this.setState({isCropping: false});
        }

        _destroyCropper() {
            if(cropper) {
                cropper.destroy();
            }
        }

        _renderInvertPanel() {
            const isDisable = this.state.isCropping;
            return (
                <div className='sub-functions'> 
                    <div className='title'>{LANG.invert}</div>
                    {this._renderFooterButton(LANG.apply, this._handleInvert.bind(this), isDisable)}
                </div>
            );
        }

        _handleInvert() {
            const jimp = require('jimp');
            const d = $.Deferred();
            let imgBlobUrl = this.state.src;
            let imageFile;
            this.state.threshold = 256 - this.state.threshold;
            fetch(imgBlobUrl)
                .then(res => res.blob())
                .then((blob) => {
                    var fileReader = new FileReader();
                    fileReader.onloadend = (e) => {
                        imageFile = e.target.result;
                        imageFile = new Buffer.from(imageFile);
                        ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, LANG.processing);
                        jimp.read(imageFile)
                            .then((image) => {
                                image.invert();
                                image.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                                    const newBlob = new Blob([buffer]);
                                    const src = URL.createObjectURL(newBlob);
                                    ProgressActions.close();
                                    this.state.srcHistory.push(this.state.src);
                                    this.setState({src: src});
                                });
                            })
                            .catch((err) => {console.log(err);});
                    };
                    fileReader.readAsArrayBuffer(blob);
                })
                .catch((err) => {
                    d.reject(err);
                });
        }

        _renderPhotoEditFooter() {
            const disableGoBack = (this.state.srcHistory.length === 0);
            const disableComplete = (this.state.srcHistory.length === 0);
            return (
                <div className='footer'>
                    {this._renderFooterButton(LANG.okay, this._handleComplete.bind(this), disableComplete)}
                    {this._renderFooterButton(LANG.back, this._handleGoBack.bind(this), disableGoBack)}
                    {this._renderFooterButton(LANG.cancel, this._handleCancel.bind(this))}
                </div>
            );
        }

        _renderFooterButton(label, onClick, isDisable) {
            let disable = '';
            if (isDisable) {
                disable = 'disabled';
                onClick = () => {};
            }
            return(
                <button
                        className={`btn btn-default pull-right ${disable}`}
                        onClick={() => {onClick()}}
                    >
                        {label}
                </button>
            )
        }

        render() {
            const renderContent = this._renderPhotoEditeModal();
            return renderContent;
        }
    };
    return PhotoEditPanel;
});
