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
        UPLOADING       : 'UPLOADING',
        WAITING_HEAD    : 'WAITING_HEAD',
        CORRECTING      : 'CORRECTING',
        OCCUPIED        : 'OCCUPIED',
        SCANNING        : 'SCANNING',

        // folder
        NOT_EXIST       : 'NOT_EXIST',
        PREVIEW         : 'PREVIEW',
        DOWNLOAD        : 'DOWNLOAD',
        UPLOAD          : 'UPLOAD',
        SELECT          : 'SELECT',

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
        QUIT_TASK       : 'QUIT_TASK',
        KICK            : 'KICK',
        LS              : 'LS',
        LOAD_FILAMENT   : 'LOAD',
        UNLOAD_FILAMENT : 'UNLOAD',

        status : {
            SCAN                    : -2,
            MAINTAIN                : -1,
            IDLE                    : 0,
            INIT                    : 1,
            STARTING                : 4,
            RESUME_TO_STARTING      : 6,
            RUNNING                 : 16,
            RESUME_TO_RUNNING       : 18,
            PAUSED                  : 32,
            PAUSED_FROM_STARTING    : 36,
            PAUSING_FROM_STARTING   : 38,
            PAUSED_FROM_RUNNING     : 48,
            PAUSING_FROM_RUNNING    : 50,
            COMPLETED               : 64,
            COMPLETING              : 66,
            ABORTED                 : 128
        }
    };
});
