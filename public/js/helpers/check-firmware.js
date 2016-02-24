define(['jquery', 'helpers/api/config'], function($, config) {
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
            };

        type = typeMap[type] || 'pi';

        if (true === navigator.onLine) {
            $.ajax({
                url: 'http://software.flux3dp.com/check-update/?os=' + type
            }).then(function(response) {
                response.needUpdate = (
                    null !== response.latest_version &&
                    printer.version !== response.latest_version
                );
                response.latestVersion = response.latest_version;

                deferred.resolve(response);
            });
        }
        else {
            deferred.reject();
        }

        return deferred.promise();
    };
});