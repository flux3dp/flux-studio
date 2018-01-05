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
        printer = printer || {};
        
        var deferred = $.Deferred(),
            TYPE_MAP = {
                firmware: 'pi',
                toolhead: 'toolhead'
            },
            KEY_MAP = {
                firmware: 'fluxmonitor',
                toolhead: 'toolhead'
            },
            DOWNLOAD_MAP = {
              firmware: {
                  'delta-1': 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxfirmware-[version].fxfw',
                  'delta-1p': 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxfirmware-[version].fxfw',
                  'laser-b1': 'https://s3-us-west-1.amazonaws.com/firmware/beambox/beamboxfirmware-[version].fxfw',
                  'bb-1b': 'https://s3-us-west-1.amazonaws.com/firmware/beambox/beamboxfirmware-[version].fxfw',
                  'bb-1p': 'https://s3-us-west-1.amazonaws.com/firmware/beambox/beamboxfirmware-[version].fxfw'
              },
              toolhead: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxhead_v[version].bin'
            },
            key = KEY_MAP[type] || '',
            downloadUrl = (DOWNLOAD_MAP[type].indexOf ? DOWNLOAD_MAP[type] : DOWNLOAD_MAP[type][printer.model]) || '';
        
        type = TYPE_MAP[type] || 'pi';
        
        // return deferred.reject if network is unavailable.
        if (!navigator.onLine) {
          deferred.reject({
              needUpdate: true
          });
          return deferred.promise();
        }

        $.ajax({
            url: 'http://flux3dp.com/api_entry/',
            data: {
                feature: 'check_update',
                key: key,
                model: printer.model
            }
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
