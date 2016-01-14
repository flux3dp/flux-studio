define(function() {
    'use strict';

    return {
        // progress dialog types
        WAITING      : 'WAITING',
        STEPPING     : 'STEPPING',
        NONSTOP      : 'NONSTOP',

        // events
        OPEN_EVENT   : 'OPEN',
        UPDATE_EVENT : 'UPDATE',
        STOP_EVENT   : 'STOP',
        FINISH_EVENT : 'FINISH'
    };
});
