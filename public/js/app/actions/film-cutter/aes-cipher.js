define([
    'lib/crypto-js'
], function(
    CryptoJS
) {
    class AESCipher {
        constructor() {
            this.key = '';
        }
        setKey(key) {
            this.key = key;
        }
        encrpyt(str) {
            var encrypt = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(this.key), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypt.toString();
        }
        decrypt(str) {
            var decrypt = CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(this.key), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return decrypt.toString(CryptoJS.enc.Utf8);
        }
    };

    const instance = new AESCipher();
    return instance;
});
