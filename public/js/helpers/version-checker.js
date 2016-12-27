define(function() {
    'use strict';

    return function(sourceVersion) {

        let vRegex = /([\d.]+)(a|b)?(\d*)?/g,
            version = vRegex.exec(sourceVersion);

        function meetMainVersion(requiredVersion) {
            return requiredVersion <= parseFloat(version[1]);
        }

        function getVersion() {
            return version;
        }

        return {
            meetMainVersion,
            getVersion
        };
    };
});
