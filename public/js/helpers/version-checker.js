define(function() {
    'use strict';

    return function(sourceVersion) {

        let vRegex = /([\d.]+)(a|b)?(\d*)?/g,
            version = vRegex.exec(sourceVersion);

        // version format example: 1.5b12
        // major version: 1.5
        // minor version: b
        // sub version: 12
        function meetVersion(requiredVersion) {
            let regex = vRegex = /([\d.]+)(a|b)?(\d*)?/g;
            let _v = regex.exec(requiredVersion);

            // compare major version
            let metVersion = parseFloat(_v[1]) <= parseFloat(version[1]);

            // compare minor version if exist
            if(metVersion && _v[2]) {
                metVersion = _v[2].charCodeAt(0) <= version[2].charCodeAt(0);
            }

            // compare sub version if exist
            if(metVersion && _v[3]) {
                metVersion = (parseInt(_v[3]) || 0) <= (parseInt(version[3]) || 0);
            }

            return metVersion;
        }

        function getVersion() {
            return version;
        }

        return {
            meetVersion,
            getVersion
        };
    };
});
