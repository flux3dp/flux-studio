/**
 * check device status and action
 */
define([
    'jquery',
    'helpers/i18n',
    'helpers/device-master',
    'app/constants/device-constants',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/progress-actions'
], function(
    $,
    i18n,
    DeviceMaster,
    DeviceConstants,
    AlertActions,
    AlertStore,
    ProgressActions
) {
    'use strict';

    var lang = i18n.get();

    return function(printer) {
        var deferred = $.Deferred(),
            onYes = function(id) {
                var timer,
                    _deferred = $.Deferred();

                DeviceMaster.selectDevice(printer).then(function() {
                    switch (id) {
                    case 'kick':
                        DeviceMaster.kick().done(function() {
                            deferred.resolve('ok');
                        });
                        break;
                    case 'abort':
                        DeviceMaster.stop().done(function() {
                            timer = setInterval(function() {
                                DeviceMaster.getReport().done(function(report) {
                                    _deferred.notify(report);
                                });
                            }, 100);

                            _deferred.progress(function(report) {
                                if (report.st_id === DeviceConstants.status.ABORTED) {
                                    setTimeout(function() {
                                        DeviceMaster.quit().done(function() {
                                            deferred.resolve('ok');
                                            _deferred.resolve('ok');
                                        });
                                    }, 500);

                                    clearInterval(timer);
                                }
                            });
                        });
                        break;
                    }
                });

                AlertStore.removeYesListener(onYes);
            };

        deferred.always(function() {
            AlertStore.removeYesListener(onYes);
        });

        switch (printer.st_id) {
        // null for simulate
        case null:
        // null for not found default device
        case undefined:
        case DeviceConstants.status.IDLE:
            // no problem
            deferred.resolve('auth');
            break;
        case DeviceConstants.status.RAW:
        case DeviceConstants.status.SCAN:
        case DeviceConstants.status.MAINTAIN:
            // ask kick?
            ProgressActions.close();
            AlertActions.showPopupYesNo('kick', lang.message.device_is_used);
            AlertStore.onYes(onYes);
            break;
        case DeviceConstants.status.COMPLETED:
        case DeviceConstants.status.ABORTED:
            // quit
            DeviceMaster.quit().done(function() {
                deferred.resolve('ok');
            });
            break;
        case DeviceConstants.status.RUNNING:
        case DeviceConstants.status.PAUSED:
        case DeviceConstants.status.PAUSED_FROM_STARTING:
        case DeviceConstants.status.PAUSED_FROM_RUNNING:
            // ask for abort
            ProgressActions.close();
            AlertActions.showPopupYesNo('abort', lang.message.device_is_used);
            AlertStore.onYes(onYes);
            break;
        default:
            // device busy
            ProgressActions.close();
            AlertActions.showDeviceBusyPopup('on-select-printer');
            break;
        }

        return deferred.promise();
    };
});