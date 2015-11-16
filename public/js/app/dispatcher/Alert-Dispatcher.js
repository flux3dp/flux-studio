define([
    'lib/flux.min'
], function(
    Flux
) {
    var flux = new Flux.Dispatcher();
    return {

        register: function(callback) {
            return flux.register(callback);
        },

        dispatch(actionType) {
            flux.dispatch(actionType);
        }

    };
});
