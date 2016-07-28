define([
    'helpers/api/config',
    'helpers/i18n',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/constants/alert-constants',
    'app/actions/progress-actions',
    'app/stores/progress-store',
    'app/constants/progress-constants'
], function(
    config,
    i18n,
    AlertActions,
    AlertStore,
    AlertConstants,
    ProgressActions,
    ProgressStore,
    ProgressConstants
) {
    'use strict';

    return () => {
        var self = this,
            lang = i18n.get(),
            isIgnore,
            filename,
            manifest,
            firmwareUpdater,
            downloadPercentage = 0,
            ignoreVersions = config().read('software-update-ignore-list') || [],
            installNewApp = function() {
                nw.App.runInstaller(filename, manifest, function(err, newAppPath) {
                    if (err) {
                        AlertActions.showPopupInfo('ruinstalling', 'Upgrade failed');
                    }
                });
                AlertStore.removeYesListener(installNewApp);
            },
            handleDownloadProgress = function(data, downloadSize, contentLength) {
                downloadPercentage = parseInt((downloadSize / contentLength).toFixed(3) * 100, 10);

                ProgressActions.updating(
                    lang.message.new_app_downloading + ' (' + downloadPercentage + '%)',
                    downloadPercentage
                );

                if (100 === downloadPercentage) {
                    ProgressActions.close();
                    AlertActions.showPopupYesNo('install-new-app', lang.message.ask_for_upgrade);
                    AlertStore.onYes(installNewApp);
                }
            };

        if (true === window.FLUX.isNW) {
            nw.App.checkUpdate(function(error, newVersionExists, _manifest) {
                if (!error) {
                    manifest = _manifest;
                    isIgnore = -1 < ignoreVersions.indexOf(manifest.version);
                }

                if (!error && true === newVersionExists && false === isIgnore) {
                    AlertActions.showUpdate(
                        {},
                        'software',
                        {
                            currentVersion: window.FLUX.version,
                            latestVersion: manifest.version,
                            releaseNote: manifest.changelog,
                        },
                        () => {
                            ProgressActions.open(ProgressConstants.STEPPING, '', lang.message.new_app_downloading, true);
                            updater = nw.App.downloadUpdate(
                                manifest,
                                (error, _filename) => {
                                    if (error) {
                                        ProgressActions.close();
                                        nw.Shell.openExternal('https://flux3dp.com/downloads');
                                    }
                                    filename = _filename;
                                },
                                handleDownloadProgress
                            );
                        }
                    );
                }
            });
        }
    };
});