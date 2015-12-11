define([], function(){
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
        RUNNING         : 'RUNNING',
        OK              : 'OK',
        IDLE            : 'IDLE',
        COMPLETED       : 'COMPLETED',
        IDLE            : 'IDLE',
        RESUMING        : 'RESUMING',
        AUTH_ERROR      : 'AUTH_ERROR',
        HEAD_OFFLINE    : 'HEAD_OFFLINE',
        HEAD_ERROR      : 'HEAD_ERROR',
        WRONG_HEAD      : 'WRONG_HEAD',
        TILT            : 'TILT',
        FAN_FAILURE     : 'FAN_FAILURE',
        TIMEOUT         : 'TIMEOUT',
        FILAMENT_RUNOUT : 'FILAMENT_RUNOUT',
        UNKNOWN_ERROR   : 'UNKNOWN_ERROR',
        USER_OPERATION  : 'USER_OPERATION',

        // Command
        RESUME          : 'RESUME',
        PAUSE           : 'PAUSE',
        STOP            : 'STOP',
        REPORT          : 'REPORT',
        ABORT           : 'ABORT',
        QUIT            : 'QUIT',
        LS              : 'LS'
    };
});
