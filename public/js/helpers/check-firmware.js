define(['jquery', 'helpers/api/config'], function($, config) {
    'use strict';

    return function(printer) {
        var ignoreVersions = config().read('software-update-ignore-list') || [],
            isIgnoreVersion = -1 < ignoreVersions.indexOf(printer.version),
            deferred = $.Deferred();

        $.ajax({
            url: 'http://software.flux3dp.com/check-update/?os=pi'
        }).then(function(response) {
            response.needUpdate = (
                null !== response.latest_version &&
                printer.version !== response.latest_version &&
                false === isIgnoreVersion
            );

            deferred.resolve(response);
        });

        return deferred.promise();
    };
});