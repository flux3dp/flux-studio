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

    return function(response){
        var lang = i18n.get(),

            _handleDownloadedfile = function(xhr) {
                let filename = response.downloadUrl.split('/').pop();
                if (xhr.status == 200) {
                  var blob = new Blob([xhr.response], {type: 'application/octet-stream'});

                  let a = document.createElement("a");
                  a.style = "display: none";
                  document.body.appendChild(a);
                  let url = window.URL.createObjectURL(blob);
                  a.href = url;
                  a.download = filename;
                  a.click();
                  window.URL.revokeObjectURL(url);

                  ProgressActions.close();
                  AlertActions.showPopupInfo('download-software-completed', lang.message.new_app_downloaded);
                }else{
                  //TODO handle if response status is not 200.
                }
            },

            onInstall = function() {
              let xhr = new XMLHttpRequest(),
                  downloadPercentage,

                  onStop = function() {
                    ProgressActions.close();
                    xhr.abort();
                    AlertActions.showPopupInfo('download-software-completed', lang.message.new_app_download_canceled);
                  };


              // get software from flux3dp website.
              ProgressActions.open(ProgressConstants.STEPPING, '', lang.message.new_app_downloading, true,'' ,'' ,onStop);

              xhr.open("GET", response.downloadUrl, true);
              xhr.responseType = "blob";
              xhr.onprogress = function(event) {
                  downloadPercentage = parseInt((event.loaded / event.total).toFixed(3) * 100, 10);
                  ProgressActions.updating(
                      lang.message.new_app_downloading + ' (' + downloadPercentage + '%)',
                      downloadPercentage,
                      onStop
                  );
              }

              xhr.onloadend = function(event) {
                  _handleDownloadedfile(this);
              };

              xhr.send();
            };

        AlertActions.showUpdate(
           {},
           'software',
           response || {},
           function() {},
           onInstall
        );
    }
  })
