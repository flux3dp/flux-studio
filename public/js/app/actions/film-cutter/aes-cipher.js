define([
    'lib/crypto-js',
    'app/actions/film-cutter/record-manager',
], function(
    CryptoJS,
    RecordManager
) {
    class AESCipher {
        encrpyt(str) {
            const key = RecordManager.read('secret_key');
            var encrypt = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypt.toString();
        }
        decrypt(str) {
            const key = RecordManager.read('secret_key');
            var decrypt = CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(key), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return decrypt.toString(CryptoJS.enc.Utf8);
        }
    };

    const instance = new AESCipher();
    return instance;
});
