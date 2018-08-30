define([
    'Rx',
    'helpers/i18n',
    'app/actions/beambox/constant',
    'app/actions/beambox'
], function (
    Rx,
    i18n,
    Constant,
    BeamboxActions
) {
    const LANG = i18n.lang.beambox.left_panel;

    class PreviewModeBackgroundDrawer {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.cameraCanvasUrl = '';

            this.coordinates = {
                maxX : 0,
                maxY : 0,
                minX : 10000,
                minY : 10000
            }

            this.canvas.width = Constant.dimension.width;
            this.canvas.height = Constant.dimension.height;

            this.cameraOffset = null;
        }
        start(cameraOffset) {
            // { x, y, angle, scaleRatioX, scaleRatioY }
            this.cameraOffset = cameraOffset;

            this.backgroundDrawerSubject = new Rx.Subject();
            this.backgroundDrawerSubject
                .concatMap(p => Rx.Observable.fromPromise(p))
                .subscribe(blob => this._drawBlobToBackground(blob));

        }

        end() {
            this.backgroundDrawerSubject.onCompleted();
        }

        async draw(imgUrl, x, y, last = false) {
            const p = this._prepareCroppedAndRotatedImgBlob(imgUrl, x, y, last);

            this.backgroundDrawerSubject.onNext(p);
            // await p;  if you want to know the time when image transfer to Blob, which is almost the same time background is drawn.
        }

        drawBoundary() {
            const canvasBackground = svgedit.utilities.getElem('canvasBackground');
            const previewBoundary = this._getPreviewBoundary();
            canvasBackground.appendChild(previewBoundary);
        }

        clearBoundary() {
            const canvasBackground = svgedit.utilities.getElem('canvasBackground');
            const previewBoundary = svgedit.utilities.getElem('previewBoundary');
            canvasBackground.removeChild(previewBoundary);
        }

        isClean() {
            return this.cameraCanvasUrl === '';
        }

        clear() {
            window.svgCanvas.setBackground('#fff');

            // clear canvas
            this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);

            // reset cameraCanvasUrl
            URL.revokeObjectURL(this.cameraCanvasUrl);
            this.cameraCanvasUrl = '';
        }

        getCameraCanvasUrl() {
            return this.cameraCanvasUrl;
        }

        getCoordinates() {
            return this.coordinates;
        }

        resetCoordinates() {
            this.coordinates.maxX = 0;
            this.coordinates.maxY = 0;
            this.coordinates.minX = 10000;
            this.coordinates.minY = 10000;
        }

        _drawBlobToBackground(blob) {
            if (this.cameraCanvasUrl) {
                URL.revokeObjectURL(this.cameraCanvasUrl);
            }
            this.cameraCanvasUrl = URL.createObjectURL(blob);
            window.svgCanvas.setBackground('#fff', this.cameraCanvasUrl);
        }

        _prepareCroppedAndRotatedImgBlob(imgUrl, x, y, last = false) {
            const img = new Image();
            img.src = imgUrl;
            return new Promise(resolve => {
                img.onload = () => {
                    // free unused blob memory
                    URL.revokeObjectURL(imgUrl);

                    const img_regulated = this._cropAndRotateImg(img);

                    const dstX = x - img_regulated.width/2;
                    const dstY = y - img_regulated.height/2;

                    if (dstX > this.coordinates.maxX) {
                        this.coordinates.maxX = dstX;
                    }
                    if (dstX < this.coordinates.minX) {
                        this.coordinates.minX = dstX;
                    }
                    if (dstY > this.coordinates.maxY) {
                        this.coordinates.maxY = dstY;
                    }
                    if (dstY < this.coordinates.minY) {
                        this.coordinates.minY = dstY;
                    }

                    this.canvas.getContext('2d').drawImage(img_regulated, dstX, dstY);
                    this.canvas.toBlob( (blob) => {
                        resolve(blob);
                        if (last) {
                            setTimeout(() => BeamboxActions.endDrawingPreviewBlob(), 1000);
                        }
                    });
                };
            });
        }

        _cropAndRotateImg(imageObj) {
            const {angle, scaleRatioX, scaleRatioY} = this.cameraOffset;

            const cvs = document.createElement('canvas');
            const ctx = cvs.getContext('2d');

            const a = angle + (flip ? Math.PI : 0);
            const s = scaleRatio;
            const w = imageObj.width;
            const h = imageObj.height;

            const l = h * scaleRatioY / (Math.cos(a) + Math.sin(a));
            cvs.width = cvs.height = l;
            ctx.translate(l/2, l/2);
            ctx.rotate(a);
            ctx.scale(scaleRatioX, scaleRatioY);
            ctx.drawImage(imageObj, -w/2, -h/2, w, h);

            return cvs;
        }

        _getPreviewBoundary() {
            const previewBoundaryId = 'previewBoundary';
            const color = 'rgba(200,200,200,0.8)';
            const uncapturabledHeight = (this.cameraOffset.y * Constant.dpmm) - (Constant.camera.imgHeight * this.cameraOffset.scaleRatioY / 2);

            const svgdoc = document.getElementById('svgcanvas').ownerDocument;
            const NS = svgedit.NS;
            const boundaryGroup = svgdoc.createElementNS(NS.SVG, 'svg');
            const borderTop = svgdoc.createElementNS(NS.SVG, 'rect');
            const descText = svgdoc.createElementNS(NS.SVG, 'text');

            svgedit.utilities.assignAttributes(boundaryGroup, {
                'id': previewBoundaryId,
                'width': '100%',
                'height': '100%',
                'viewBox': `0 0 ${Constant.dimension.width} ${Constant.dimension.height}`,
                'x': 0,
                'y': 0,
                'style': 'pointer-events:none'
            });

            svgedit.utilities.assignAttributes(borderTop, {
                'width': Constant.dimension.width,
                'height': uncapturabledHeight,
                'x': 0,
                'y': 0,
                'fill': color,
                'style': 'pointer-events:none'
            });

            svgedit.utilities.assignAttributes(descText, {
                'font-size': 30,
                'x': 10,
                'y': 30,
                'fill': '#fff',
                'style': 'pointer-events:none'
            });
            const textNode = document.createTextNode(LANG.unpreviewable_area);
            descText.appendChild(textNode);


            boundaryGroup.appendChild(borderTop);
            boundaryGroup.appendChild(descText);

            return boundaryGroup;
        }
    }

    const instance = new PreviewModeBackgroundDrawer();

    return instance;

});
