define(function() {
    'use strict';

    return {
        // progress dialog types
        WAITING                 : 'WAITING',
        STEPPING                : 'STEPPING',
        NONSTOP                 : 'NONSTOP',
        NONSTOP_WITH_MESSAGE    : 'NONSTOP_WITH_MESSAGE',

        // events
        OPEN_EVENT              : 'OPEN',
        UPDATE_EVENT            : 'UPDATE',
        FINISH_EVENT            : 'FINISH'
    };
});
