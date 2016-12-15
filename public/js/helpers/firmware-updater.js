/**
 * firmware updater
 */
define([
    'helpers/i18n',
    'helpers/check-firmware',
    'helpers/device-master',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/input-lightbox-actions',
    'app/constants/input-lightbox-constants',
    'helpers/round'
], function(
    i18n,
    checkFirmware,
    DeviceMaster,
    AlertActions,
    ProgressActions,
    ProgressConstants,
    InputLightboxActions,
    InputLightboxConstants,
    round
) {
    'use strict';

    return function(response, printer, type) {
        var lang = i18n.get(),
            doUpdate, onInstall, onSubmit;

        doUpdate = ( 'firmware' === type ? DeviceMaster.updateFirmware : DeviceMaster.updateToolhead );

        onInstall = () => {
            let name = 'upload-firmware',
                content;

            content = {
                type: InputLightboxConstants.TYPE_FILE,
                caption: lang.update.firmware.upload_file,
                onSubmit: onSubmit,
                onClose: function() {
                    if ('toolhead' === type) {
                        DeviceMaster.quitTask();
                    }
                },
                confirmText: lang.update.firmware.confirm
            };

            InputLightboxActions.open( name, content );
        };

        onSubmit = function(files, e) {
            let file = files.item(0),
                onFinishUpdate;

            onFinishUpdate = (isSuccess) => {
                console.log('finished update', isSuccess, type);
                if(type === 'toolhead') {
                    quitTask();
                }

                if (true === isSuccess) {
                    AlertActions.showPopupInfo(
                        'firmware-update-success',
                        lang.update.firmware.update_success
                    );
                }
                else {
                    AlertActions.showPopupError(
                        'firmware-update-fail',
                        lang.update.firmware.update_fail
                    );
                }
            };

            DeviceMaster.selectDevice(printer).done(function() {
                ProgressActions.open(ProgressConstants.STEPPING, '', '', false);
                doUpdate(file).progress((r) => {
                    r.percentage = round(r.percentage || 0, -2);
                    ProgressActions.updating(
                        lang.update.updating + ' (' + r.percentage + '%)',
                        r.percentage
                    );
                }).always(() => {
                    ProgressActions.close();
                }).done(
                    onFinishUpdate.bind(null, true)
                ).fail(
                    onFinishUpdate.bind(null, false)
                );
            });
        };

        const quitTask = () => {
            console.log('quitting task');
            DeviceMaster.quitTask().then(r => {
                console.log('task quitted?', r);
                if(r.error) {
                    setTimeout(() => {
                        quitTask();
                    }, 2000);
                };
            }).fail(e => {
                console.log('error from quit task', e);
                setTimeout(() => {
                    quitTask();
                }, 2000);
            });
        };

        AlertActions.showUpdate(
            printer,
            type,
            response || {},
            onInstall
        );
    };
});
