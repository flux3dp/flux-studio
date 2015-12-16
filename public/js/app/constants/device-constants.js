define(function() {
    'use strict';

    return {
        // Status
        RUNNING         : 'RUNNING',
        READY           : 'READY',
        PAUSING         : 'PAUSING',
        PAUSED          : 'PAUSED',
        CONNECTED       : 'CONNECTED',
        DISCONNECTED    : 'DISCONNECTED',
        BUSY            : 'BUSY',
        ERROR           : 'ERROR',
        ABORTED         : 'ABORTED',
        UNKNOWN         : 'UNKNOWN',
        COMPLETED       : 'COMPLETED',
        FATAL           : 'FATAL',
        OK              : 'OK',
        IDLE            : 'IDLE',
        RESUMING        : 'RESUMING',
        AUTH_ERROR      : 'AUTH_ERROR',
        HEAD_OFFLINE    : 'HEAD_OFFLINE',
        HEAD_ERROR      : 'HEAD_ERROR',
        WRONG_HEAD      : 'WRONG_HEAD',
        AUTH_FAILED     : 'AUTH_FAILED',
        HEADER_OFFLINE  : 'HEADER_OFFLINE',
        HEADER_ERROR    : 'HEADER_ERROR',
        WRONG_HEADER    : 'WRONG_HEADER',
        TILT            : 'TILT',
        FAN_FAILURE     : 'FAN_FAILURE',
        TIMEOUT         : 'TIMEOUT',
        FILAMENT_RUNOUT : 'FILAMENT_RUNOUT',
        UNKNOWN_ERROR   : 'UNKNOWN_ERROR',
        UNKNOWN_STATUS  : 'UNKNOWN_STATUS',
        USER_OPERATION  : 'USER_OPERATION',

        // Print head
        EXTRUDER        : 'EXTRUDER',
        PRINTER         : 'PRINTER',

        // Command
        RESUME          : 'RESUME',
        PAUSE           : 'PAUSE',
        STOP            : 'STOP',
        REPORT          : 'REPORT',
        ABORT           : 'ABORT',
        QUIT            : 'QUIT',
        KICK            : 'KICK',
        LS              : 'LS'
    };
});
