define(['lib/flux.min'], function(Flux) {
    'use strict';

    var flux = new Flux.Dispatcher();

    return {

        register: function(callback) {
            return flux.register(callback);
        },

        dispatch: function(actionType) {
            flux.dispatch(actionType);
        }

    };
});
