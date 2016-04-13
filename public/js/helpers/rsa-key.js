define([
    'helpers/local-storage',
    // non-return
    'lib/jsencrypt'
], function(localStorage) {
    'use strict';

    return function() {
        var RSA_KEY_NAME = 'flux-rsa-key',
            rsaCipher = new JSEncrypt({ default_key_size: 1024 }),
            rsaKey = localStorage.get(RSA_KEY_NAME) || rsaCipher.getPrivateKey();

        if (false === localStorage.isExisting(RSA_KEY_NAME)) {
            localStorage.set(RSA_KEY_NAME, rsaKey);
        }

        return rsaKey;
    };
});