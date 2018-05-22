/**
 * API control
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-control
 */
define([
    'helpers/websocket',
    'helpers/rsa-key',
    'Rx'
], function(Websocket, rsaKey, Rx) {

    const TIMEOUT = 10000;

    class Camera {
        constructor() {
            this._ws = null;
            this._wsSubject = new Rx.Subject();
            this._source = this._wsSubject
                .asObservable()
                .filter(x => x instanceof Blob)
                .switchMap(x => {
                    // if stream return extremely small blob (i.e. when camera hardware connection fail)
                    if (x.size < 30) {
                        return Rx.Observable.throw(new Error('Fail to transmit Blob'));
                    } else {
                        return Rx.Observable.of(x);
                    }
                });
        }

        // let subject get response from websocket
        async createWs(device) {
            const method = (() => {
                const isUsb = device.source === 'h2h';
                const uuid = device.uuid;
                return isUsb ? `camera/usb/${parseInt(uuid)}` : `camera/${uuid}`;
            })();

            this._ws = new Websocket({
                method: method,
                onOpen: () => this._ws.send(rsaKey()),
                onMessage: (res) => this._wsSubject.onNext(res),
                onError: (res) => this._wsSubject.onError(new Error(res.error[0])),
                onFatal: (res) => this._wsSubject.onError(new Error(res.error[0])),
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
    }

    return Camera;

});
