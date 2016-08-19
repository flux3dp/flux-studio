define([
    'app/constants/device-constants',
], (
    DeviceConstants
) => {
    let lang;
    return {
        setLang: (l) => {
            lang = l;
        },

        IDLE: () => ({
            displayStatus: lang.device.ready,
            currentStatus: DeviceConstants.READY
        }),

        INIT: () => ({
            displayStatus: lang.device.starting,
            currentStatus: DeviceConstants.STARTING
        }),

        STARTING: () => ({
            displayStatus: lang.device.starting,
            currentStatus: ''
        }),

        RUNNING: () => ({
            displayStatus: lang.device.running,
            currentStatus: DeviceConstants.RUNNING
        }),

        PAUSED: () => ({
            displayStatus: lang.device.paused,
            currentStatus: DeviceConstants.PAUSED
        }),

        PAUSING: () => ({
            displayStatus: lang.device.pausing,
            currentStatus: DeviceConstants.PAUSED
        }),

        WAITING_HEAD: () => ({
            displayStatus: lang.device.heating,
            currentStatus: DeviceConstants.HEATING
        }),

        CORRECTING: () => ({
            displayStatus: lang.device.calibrating,
            currentStatus: DeviceConstants.CALIBRATING
        }),

        COMPLETING: () => ({
            displayStatus: lang.device.completing,
            currentStatus: ''
        }),

        COMPLETED: () => ({
            displayStatus: lang.device.completed,
            currentStatus: ''
        }),

        ABORTED: () => ({
            displayStatus: lang.device.aborted,
            currentStatus: ''
        }),

        RESUMING: () => ({
            displayStatus: lang.device.starting,
            currentStatus: DeviceConstants.RUNNING
        }),

        OCCUPIED: () => ({
            displayStatus: lang.device.occupied,
            currentStatus: DeviceConstants.PAUSED
        }),

        SCANNING: () => ({
            displayStatus: lang.device.scanning,
            currentStatus: ''
        })
    };
});
