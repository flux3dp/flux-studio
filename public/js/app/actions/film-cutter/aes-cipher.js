define([
    'lib/crypto-js',
    'app/actions/film-cutter/record-manager',
], function(
    CryptoJS,
    RecordManager
) {
    class AESCipher {
        async encryptBlob(blob) {
            const key = RecordManager.read('film_secret_key');

            const arrayBuffer = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsArrayBuffer(blob);
            });
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);

            const encryptedAsBase64String = CryptoJS.AES.encrypt(wordArray, CryptoJS.enc.Utf8.parse(key), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });

            const byteCharacters = atob(encryptedAsBase64String);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {type: 'application/encrypted_fcode'});

            return blob;
        }
        encrypt(str) {
            const key = RecordManager.read('film_secret_key');
            var encrypt = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypt.toString();
        }
        decrypt(str) {
            const key = RecordManager.read('film_secret_key');
            var decrypt = CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(key), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return decrypt.toString(CryptoJS.enc.Utf8);
        }
        decryptUint8Array(uint8Arr) {
            const parse = (u8arr) => {
                // Shortcut
                var len = u8arr.length;
                // Convert
                var words = [];
                for (var i = 0; i < len; i++) {
                    words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
                }
                return CryptoJS.lib.WordArray.create(words, len).toString(CryptoJS.enc.Base64);
            };
            return this.decrypt(parse(uint8Arr));
        }
    };

    const instance = new AESCipher();
    return instance;
});
