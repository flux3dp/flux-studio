define([
    'jquery',
    'helpers/version-compare'
], function(
    $,
    versionCompare
) {
    'use strict';

    const infoMap = {
        firmware: {
            api_key: 'fluxmonitor',
            downloadUrl: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxfirmware-[version].fxfw'
        },
        toolhead: {
            api_key: 'toolhead',
            downloadUrl: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxhead_v[version].bin'
        }
    };

    /**
     * check firmware update that has to be pass the printer information here
     *
     * @param {JSON}   printer - printer info
     * @param {STRING} type    - checking type with device(pi)/toolhead(toolhead)
     *
     * @return Promise
     */

    return function(printer, type) {
        const deferred = $.Deferred();
        // return deferred.reject if network is unavailable.
        if (!navigator.onLine) {
            deferred.reject({
                needUpdate: true
            });
            return deferred.promise();
          }
        
        const request_data = {
          feature: 'check_update',
          key: infoMap[type]['api_key']
        };

        $.ajax({
            url: 'http://flux3dp.com/api_entry/',
            data: request_data
        })
        .done(function(response) {
            response.needUpdate =  versionCompare(printer.version, response.latest_version );
            response.latestVersion = response.latest_version;
            response.changelog_en = response.changelog_en.replace(/[\r]/g, '<br/>');
            response.changelog_zh = response.changelog_zh.replace(/[\r]/g, '<br/>');
            response.downloadUrl = infoMap[type]['downloadUrl'].replace('[version]', response.latest_version);

            deferred.resolve(response);
        })
        .fail(function() {
            deferred.reject({
                needUpdate: true
            });
        });

        return deferred.promise();
    };
});
