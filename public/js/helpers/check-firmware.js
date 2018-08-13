define([
    'helpers/version-compare',
    'app/actions/film-cutter/film-cutter-cloud'
], function(
    versionCompare,
    FilmCutterCloud
) {
    const infoMap = {
        delta: {
            firmware: {
                api_key: 'fluxmonitor',
                downloadUrl: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxfirmware-[version].fxfw'
            },
            toolhead: {
                api_key: 'toolhead',
                downloadUrl: 'https://s3-us-west-1.amazonaws.com/fluxstudio/fluxhead_v[version].bin'
            }
        },
        beambox: {
            firmware: {
                api_key: 'beambox-firmware',
                //TODO:
                downloadUrl: 'https://s3-us-west-1.amazonaws.com/fluxstudio/firmware/beambox/beamboxfirmware-[version].fxfw'
            },
        }

    };
    function checkMachineSeries(model) {
        switch (model) {
            case 'fbb1b':
            case 'fbb1p':
            case 'laser-b1':
                return 'beambox';
            case 'delta-1':
            case 'delta-1p':
                return 'delta';
            default:
                throw new Error('unknown model name' + model);
        }
    }

    function checkMozu1Firmware(printerVersion) {
        const deferred = $.Deferred();
        FilmCutterCloud.latestFirmware('mozu1').then(
            ({version, download_link, changelog}) => {
                const response = {
                    needUpdate: versionCompare(printerVersion, version),
                    latestVersion: version,
                    changelog_en: changelog.replace(/[\r]/g, '<br/>'),
                    changelog_zh: changelog.replace(/[\r]/g, '<br/>'),
                    downloadUrl: download_link
                };
                deferred.resolve(response);
            },
            () => deferred.reject({needUpdate: true})
        );
        return deferred.promise();
    }

    return function(printer, type) {
        const deferred = $.Deferred();
        // return deferred.reject if network is unavailable.
        if (!navigator.onLine) {
            deferred.reject({
                needUpdate: true
            });
            return deferred.promise();
        }

        if (printer.model === 'mozu1') {
            return checkMozu1Firmware(printer.version);
        }

        const series = checkMachineSeries(printer.model);
        const info = infoMap[series][type];
        const request_data = {
            feature: 'check_update',
            key: info['api_key']
        };

        $.ajax({
            url: 'https://flux3dp.com/api_entry/',
            data: request_data
        })
            .done(function(response) {
                response.needUpdate =  versionCompare(printer.version, response.latest_version );
                console.log('response.needUpdate: ', response.needUpdate);
                response.latestVersion = response.latest_version;
                response.changelog_en = response.changelog_en.replace(/[\r]/g, '<br/>');
                response.changelog_zh = response.changelog_zh.replace(/[\r]/g, '<br/>');
                response.downloadUrl = info['downloadUrl'].replace('[version]', response.latest_version);

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
