define([
    'jquery',
    'helpers/api/config',
    'helpers/i18n',
    'helpers/version-compare',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/constants/alert-constants',
    'app/actions/progress-actions',
    'app/stores/progress-store',
    'app/constants/progress-constants'
], function(
    $,
    config,
    i18n,
    versionCompare,
    AlertActions,
    AlertStore,
    AlertConstants,
    ProgressActions,
    ProgressStore,
    ProgressConstants
) {
    'use strict';

    return function() {
        var self = this,
            deferred = $.Deferred(),
            lang = i18n.get(),
            currentVersion = window.FLUX.version,
            isIgnore,
            filename,
            manifest,
            downloadPercentage = 0,
            ignoreVersions = config().read('software-update-ignore-list') || [];

        if (!navigator.onLine) {
          deferred.reject({
              needUpdate: true
          });
          return deferred.promise();
        }

        $.ajax({
            url: 'http://flux3dp.com/api_entry/',
            data: { feature: 'check_update', key: 'fluxstudio' }
        })
        .done( function(response) {
          response.needUpdate = versionCompare('0.6.0', response.version);
          response.latestVersion = response.version;
          response.currentVersion = currentVersion;
          response.changelog_en = response.changelog_en.replace(/[\r]/g, '<br/>');
          response.changelog_zh = response.changelog_zh.replace(/[\r]/g, '<br/>');
          response.downloadUrl = 'https://s3-us-west-1.amazonaws.com/fluxstudio/fstudio-20170417-0.7.8-osx-stable.dmg';
          //response.downloadUrl = 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxfirmware-1.6.64.fxfw'
          response.thisVerionIsIgnored = !(ignoreVersions.indexOf(response.version) === -1);

          deferred.resolve(response);
        })

        return deferred.promise();
    };
});
