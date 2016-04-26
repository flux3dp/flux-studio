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
    'app/constants/input-lightbox-constants'
], function(
    i18n,
    checkFirmware,
    DeviceMaster,
    AlertActions,
    ProgressActions,
    ProgressConstants,
    InputLightboxActions,
    InputLightboxConstants
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
                        inputHeader: lang.update.firmware.upload_file,
                        onSubmit: onSubmit,
                        confirmText: lang.update.firmware.confirm
                    }
                );
            },
            onSubmit = function(files, e) {
                var file = files.item(0),
                    onFinishUpdate = function(isSuccess) {
                        // ProgressActions.close();

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

                // ProgressActions.open(ProgressConstants.NONSTOP);
                doUpdate(file).
                    done(onFinishUpdate.bind(null, true)).
                    fail(onFinishUpdate.bind(null, false));
            };

        AlertActions.showUpdate(
            printer,
            type,
            response || {},
            onInstall
        );
    };
});