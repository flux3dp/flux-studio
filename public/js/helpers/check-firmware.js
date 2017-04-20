define(['jquery'], function($) {
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
            versionKeyMap = {
                firmware: 'version',
                toolhead: 'toolhead_version'
            },
            data = {},
            versionKey = versionKeyMap[type] || '';

        type = typeMap[type] || 'pi';
        printer = printer || {};
        data = {
            os: type,
            v: printer[versionKey] || ''
        };

        if (true === navigator.onLine) {
            $.ajax({
                url: 'http://software.flux3dp.com/check-update/',
                data: data
            }).done(function(response) {
                response.require_update = ('boolean' === typeof response.require_update ? response.require_update : false);
                response.needUpdate = (
                    null !== response.latest_version &&
                    'string' === typeof printer[versionKey] &&
                    printer[versionKey] !== response.latest_version
                );
                response.latestVersion = response.latest_version;

                deferred.resolve(response);
            }).
            fail(function() {
                deferred.reject({
                    needUpdate: true
                });
            });
        }
        else {
            deferred.reject({
                needUpdate: true
            });
        }

        return deferred.promise();
    };
});
