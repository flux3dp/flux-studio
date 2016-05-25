define([
    'helpers/local-storage',
    // non-return
    'lib/jsencrypt'
], function(localStorage) {
    'use strict';

    return function(createNewKey) {
        var RSA_KEY_NAME = 'flux-rsa-key',
            rsaCipher = new JSEncrypt({ default_key_size: 1024 }),
            newKey = rsaCipher.getPrivateKey(),
            rsaKey = localStorage.get(RSA_KEY_NAME) || newKey;

        if (false === localStorage.isExisting(RSA_KEY_NAME)) {
            localStorage.set(RSA_KEY_NAME, rsaKey);
        }

        return (true === createNewKey ? newKey : rsaKey);
    };
});