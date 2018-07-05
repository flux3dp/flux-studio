define([
    'lib/crypto-js',
    'app/actions/film-cutter/record-manager',
], function(
    CryptoJS,
    RecordManager
) {
    class AESCipher {
        encrpyt(str) {
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
