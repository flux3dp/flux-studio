/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'Rx',
    'helpers/websocket',
    'helpers/rsa-key',
    'helpers/version-checker',
    'helpers/i18n'
], function(
    Rx,
    Websocket,
    rsaKey,
    VersionChecker,
    i18n) {

    const TIMEOUT = 15000;
    const LANG = i18n.lang;
    class Camera {
        constructor() {
            this._device = '';
            this._ws = null;
            this._wsSubject = new Rx.Subject();
            this._source = this._wsSubject
                .asObservable()
                .filter(x => x instanceof Blob)
                .switchMap(blob => {
                    if (blob.size < 30) {
                        // if stream return extremely small blob (i.e. when camera hardware connection fail)
                        return Rx.Observable.throw(new Error(LANG.message.camera_fail_to_transmit_image));
                    } else {
                        return Rx.Observable.of(blob);
                    }
                })
                .map(blob => this.preprocessImage(blob))
                .concatMap(p => Rx.Observable.fromPromise(p));
        }

        // let subject get response from websocket
        async createWs(device) {
            this._device = device;
            console.assert(device.version, 'device miss version!', device);
            const method = (() => {
                const isUsb = device.source === 'h2h';
                const uuid = device.uuid;
                return isUsb ? `camera/usb/${parseInt(uuid)}` : `camera/${uuid}`;
            })();

            this._ws = new Websocket({
                method: method,
                onOpen: () => this._ws.send(rsaKey()),
                onMessage: (res) => this._wsSubject.onNext(res),
                onError: (res) => this._wsSubject.onError(new Error(res.error?res.error.toString():res)),
                onFatal: (res) => this._wsSubject.onError(new Error(res.error?res.error.toString():res)),
                onClose: () => this._wsSubject.onCompleted(),
                autoReconnect: false
            });

            return await this._wsSubject
                .filter(res => res.status === 'connected')
                .take(1)
                .timeout(TIMEOUT)
                .toPromise();
        }

        async oneShot() {
            this._ws.send('require_frame');
            return await this._source
                .take(1)
                .timeout(TIMEOUT)
                .toPromise();
        }

        getLiveStreamSource() {
            this._ws.send('enable_streaming');
            return this._source
                .timeout(TIMEOUT)
                .asObservable();
        }

        closeWs() {
            this._ws.close(false);
        }

        async preprocessImage(blob) {
            if (!['fbb1b', 'fbb1p', 'laser-b1'].includes(this._device.model)) {
                return blob;
            }

            const imageLoadBlob = async () => {
                const img = new Image();
                const imgUrl = URL.createObjectURL(blob);
                img.src = imgUrl;
                await new Promise(resolve => img.onload = resolve);
                URL.revokeObjectURL(imgUrl);
                return img;
            };
            const resize1280x640ImageTo640x280 = async () => {
                const img = await imageLoadBlob();
                console.assert(img.width === 1280 && img.height === 640, 'image should be 1280x640',img.width, img.height);

                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 280;
                canvas.getContext('2d').drawImage(img, 0, -20, 640, 320); // resize
                const preprocessedBlob = await new Promise(resolve =>
                    canvas.toBlob(b => resolve(b))
                );
                return preprocessedBlob;
            };

            const crop640x480ImageTo640x280 = async () => {
                const img = await imageLoadBlob();
                console.assert(img.width === 640 && img.height === 480, 'image should be 640x480',img.width, img.height);

                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 280;
                canvas.getContext('2d').drawImage(img, 0, -100, 640, 480); // crop top and bottom
                const preprocessedBlob = await new Promise(resolve =>
                    canvas.toBlob(b => resolve(b))
                );
                return preprocessedBlob;
            };

            if (VersionChecker(this._device.version).meetRequirement('BEAMBOX_CAMERA_SPEED_UP')) {
                return await crop640x480ImageTo640x280();
            } else {
                return await resize1280x640ImageTo640x280();
            }
        }
    }

    return Camera;

});
