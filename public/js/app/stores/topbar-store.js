define([
    'app/dispatcher/topbar-dispatcher',
    'app/constants/topbar-constants',
    'events',
    'helpers/object-assign'
], function(
    Dispatcher,
    Constants,
    EventEmitter
) {
    'use strict';

    var topbarStore;

    topbarStore = Object.assign(EventEmitter.prototype, {

        onAlignToolboxShowed: function(callback) {
            this.on(Constants.SHOW_ALIGN_TOOLBOX, callback);
            return topbarStore;
        },

        onAlignToolboxClosed: function(callback) {
            this.on(Constants.CLOSE_ALIGN_TOOLBOX, callback);
            return topbarStore;
        },

        onDistributeToolboxShowed: function(callback) {
            this.on(Constants.SHOW_DISTRIBUTE_TOOLBOX, callback);
            return topbarStore;
        },

        onDistributeToolboxClosed: function(callback) {
            this.on(Constants.CLOSE_DISTRIBUTE_TOOLBOX, callback);
            return topbarStore;
        },

        removeAlignToolboxShowedListener: function(callback) {
            this.removeListener(Constants.SHOW_ALIGN_TOOLBOX, callback);
            return topbarStore;
        },

        removeAlignToolboxClosedListener: function(callback) {
            this.removeListener(Constants.CLOSE_ALIGN_TOOLBOX, callback);
            return topbarStore;
        },

        removeDistributeToolboxShowedListener: function(callback) {
            this.removeListener(Constants.SHOW_DISTRIBUTE_TOOLBOX, callback);
            return topbarStore;
        },

        removeDistributeToolboxClosedListener: function(callback) {
            this.removeListener(Constants.CLOSE_DISTRIBUTE_TOOLBOX, callback);
            return topbarStore;
        },

        dispatcherIndex: Dispatcher.register(function(payload) {
            var actionType = payload.actionType;

            if(Constants[actionType]) {
                topbarStore.emit(actionType, payload);
            }
            else {
                throw new console.error('unknown method');
            }
        })

    });

    return topbarStore;
});
