define(['jquery', 'helpers/version-compare'], function($, versionCompare) {
    'use strict';

    /**
     * check firmware update that has to be pass the printer information here
     *
     * @param {JSON}   printer - printer info
     * @param {STRING} type    - checking type with device(pi)/toolhead(toolhead)
     *
     * @return Promise
     */

    return function(printer, type) {
        var deferred = $.Deferred(),
            typeMap = {
                firmware: 'pi',
                toolhead: 'toolhead'
            },
            keyMap = {
                firmware: 'fluxmonitor',
                toolhead: 'toolhead'
            },
            downloadMap = {
              firmware: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxfirmware-[version].fxfw',
              toolhead: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxhead_v[version].bin'
            },
            data = {},
            key = keyMap[type] || '',
            downloadUrl = downloadMap[type] || '';

        type = typeMap[type] || 'pi';
        printer = printer || {};
        data = {
          feature: 'check_update',
          key: key
        };

        // return deferred.reject if network is unavailable.
        if (!navigator.onLine) {
          deferred.reject({
              needUpdate: true
          });
          return deferred.promise();
        }

        $.ajax({
            url: 'http://flux3dp.com/api_entry/',
            data: data
        })
        .done(function(response) {
            response.needUpdate =  versionCompare(printer.version, response.latest_version );
            response.latestVersion = response.latest_version;
            response.changelog_en = response.changelog_en.replace(/[\r]/g, '<br/>');
            response.changelog_zh = response.changelog_zh.replace(/[\r]/g, '<br/>');
            response.downloadUrl = downloadUrl.replace('[version]', response.latest_version);

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
