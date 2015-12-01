define([], function(){
    return {
        // Status
        PRINTING        : 'PRINTING',
        READY           : 'READY',
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

        // Command
        RESUME          : 'RESUME',
        PAUSE           : 'PAUSE',
        STOP            : 'STOP',
        REPORT          : 'REPORT',
        QUIT            : 'QUIT'
    };
});
