define([
    'app/dispatcher/progress-dispatcher',
    'app/constants/progress-constants',
    'events',
    'helpers/object-assign'
], function(
    Dispatcher,
    ProgressConstants,
    EventEmitter
) {
    'use strict';

    var Store;

    Store = Object.assign(EventEmitter.prototype, {

        onOpened: function(callback) {
            this.on(ProgressConstants.OPEN_EVENT, callback);
            return Store;
        },

        onUpdating: function(callback) {
            this.on(ProgressConstants.UPDATE_EVENT, callback);
            return Store;
        },

        onClosed: function(callback) {
            this.on(ProgressConstants.FINISH_EVENT, callback);
            return Store;
        },

        removeOpenedListener: function(callback) {
            this.removeListener(ProgressConstants.OPEN_EVENT, callback);
            return Store;
        },

        removeUpdatingListener: function(callback) {
            this.removeListener(ProgressConstants.UPDATE_EVENT, callback);
            return Store;
        },

        removeClosedListener: function(callback) {
            this.removeListener(ProgressConstants.FINISH_EVENT, callback);
            return Store;
        },

        dispatcherIndex: Dispatcher.register(function(payload) {
            var actionType = payload.actionType,
                actions = [
                    ProgressConstants.UPDATE_EVENT,
                    ProgressConstants.FINISH_EVENT,
                    ProgressConstants.OPEN_EVENT
                ],
                isMethodExisting = function(method) {
                    return actionType === method;
                };

            if (true === actions.some(isMethodExisting)) {
                Store.emit(actionType, payload);
            }
            else {
                throw new Error('No method exists');
            }
        })

    });

    return Store;
});
