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
            doUpdate = (
                'firmware' === type ?
                DeviceMaster.updateFirmware :
                DeviceMaster.updateToolhead
            ),
            onInstall = function() {
                InputLightboxActions.open(
                    'upload-firmware',
                    {
                        type: InputLightboxConstants.TYPE_FILE,
                        caption: lang.update.firmware.upload_file,
                        onSubmit: onSubmit,
                        onClose: function() {
                            if ('toolhead' === type) {
                                DeviceMaster.quitTask();
                            }
                        },
                        confirmText: lang.update.firmware.confirm
                    }
                );
            },
            onSubmit = function(files, e) {
                var file = files.item(0),
                    onFinishUpdate = function(isSuccess) {

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
                    doUpdate(file).
                        progress((response) => {
                            response.percentage = round(response.percentage, -2);
                            ProgressActions.updating(
                                lang.update.updating + ' (' + response.percentage + '%)',
                                response.percentage
                            );
                        }).
                        always(() => {
                            ProgressActions.close();
                        }).
                        done(onFinishUpdate.bind(null, true)).
                        fail(onFinishUpdate.bind(null, false));
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