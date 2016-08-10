define([
    'app/constants/device-constants',
], (
    DeviceConstants
) => ({
        setLang: (lang) => {
            this.lang = lang;
        },

        IDLE: () => ({
            displayStatus: this.lang.device.ready,
            currentStatus: DeviceConstants.READY
        }),

        INIT: () => ({
            displayStatus: this.lang.device.starting,
            currentStatus: DeviceConstants.STARTING
        }),

        STARTING: () => ({
            displayStatus: this.lang.device.starting,
            currentStatus: ''
        }),

        RUNNING: () => ({
            displayStatus: this.lang.device.running,
            currentStatus: DeviceConstants.RUNNING
        }),

        PAUSED: () => ({
            displayStatus: this.lang.device.paused,
            currentStatus: DeviceConstants.PAUSED
        }),

        PAUSING: () => ({
            displayStatus: this.lang.device.pausing,
            currentStatus: DeviceConstants.PAUSED
        }),

        WAITING_HEAD: () => ({
            displayStatus: this.lang.device.heating,
            currentStatus: DeviceConstants.HEATING
        }),

        CORRECTING: () => ({
            displayStatus: this.lang.device.calibrating,
            currentStatus: DeviceConstants.CALIBRATING
        }),

        COMPLETING: () => ({
            displayStatus: this.lang.device.completing,
            currentStatus: ''
        }),

        COMPLETED: () => ({
            displayStatus: this.lang.device.completed,
            currentStatus: ''
        }),

        ABORTED: () => ({
            displayStatus: this.lang.device.aborted,
            currentStatus: ''
        }),

        RESUMING: () => ({
            displayStatus: this.lang.device.starting,
            currentStatus: DeviceConstants.RUNNING
        }),

        OCCUPIED: () => ({
            displayStatus: this.lang.device.occupied,
            currentStatus: DeviceConstants.PAUSED
        }),

        SCANNING: () => ({
            displayStatus: this.lang.device.scanning,
            currentStatus: ''
        })
    })
);
