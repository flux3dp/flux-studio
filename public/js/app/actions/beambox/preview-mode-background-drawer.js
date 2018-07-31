define([
    'Rx',
    'helpers/i18n',
    'app/actions/beambox/constant'
], function (
    Rx,
    i18n,
    Constant
) {
    const LANG = i18n.lang.beambox.left_panel;

    class PreviewModeBackgroundDrawer {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.cameraCanvasUrl = '';

            this.canvas.width = Constant.dimension.width;
            this.canvas.height = Constant.dimension.height;

            this.cameraOffset = null;
        }
        start(cameraOffset) {
            // { x, y, angle, scaleRatio }
            this.cameraOffset = cameraOffset;

            this.backgroundDrawerSubject = new Rx.Subject();
            this.backgroundDrawerSubject
                .concatMap(p => Rx.Observable.fromPromise(p))
                .subscribe(blob => this._drawBlobToBackground(blob));
        }

        end() {
            this.backgroundDrawerSubject.onCompleted();
        }

        async draw(imgUrl, x, y) {
            const p = this._prepareCroppedAndRotatedImgBlob(imgUrl, x, y);
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

        _drawBlobToBackground(blob) {
            if (this.cameraCanvasUrl) {
                URL.revokeObjectURL(this.cameraCanvasUrl);
            }
            this.cameraCanvasUrl = URL.createObjectURL(blob);
            window.svgCanvas.setBackground('#fff', this.cameraCanvasUrl);
        }

        _prepareCroppedAndRotatedImgBlob(imgUrl, x, y) {
            const img = new Image();
            img.src = imgUrl;
            return new Promise(resolve => {
                img.onload = () => {
                    // free unused blob memory
                    URL.revokeObjectURL(imgUrl);

                    const img_regulated = this._cropAndRotateImg(img);

                    const dstX = x - img_regulated.width/2;
                    const dstY = y - img_regulated.height/2;

                    this.canvas.getContext('2d').drawImage(img_regulated, dstX, dstY);
                    this.canvas.toBlob(blob => resolve(blob));
                };
            });
        }

        _cropAndRotateImg(imageObj) {
            const {angle, scaleRatio, flip} = this.cameraOffset;

            const cvs = document.createElement('canvas');
            const ctx = cvs.getContext('2d');
            
            const a = angle + (flip ? Math.PI : 0);
            const s = scaleRatio;
            const w = imageObj.width;
            const h = imageObj.height;

            /* Old Formula
            const c = h / (Math.cos(a) + Math.sin(a));
            const dstx = (h - w) / 2 * s;
            const dsty = - h * Math.sin(a) / (Math.cos(a) + Math.sin(a)) * s;

            cvs.width = cvs.height = c * s;

            ctx.rotate(a);
            ctx.drawImage(imageObj, 0, 0, w, h, dstx, dsty, w * s, h * s);
            */
            // New Formula ( Support rotation for over 180 )
            cvs.width = cvs.height = h * s;
            ctx.save();
            ctx.translate(h * s / 2, h * s / 2);
            ctx.rotate(a);
            ctx.drawImage(imageObj, - w * s / 2, - h * s / 2, w * s, h * s);
            ctx.restore();

            return cvs;
        }

        _getPreviewBoundary() {
            const previewBoundaryId = 'previewBoundary';
            const color = 'rgba(200,200,200,0.8)';
            const uncapturabledHeight = (this.cameraOffset.y * Constant.dpmm) - (Constant.camera.imgHeight * this.cameraOffset.scaleRatio / 2);

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
