define([
], function(
) {
    return {
        toggleLoginMenu({myAccount, signIn, signOut}) {
            if(window['electron']) {
                const { ipc, events } = window.electron;
                ipc.send(events.UPDATE_ACCOUNT, {myAccount, signIn, signOut});
            }
            return;
        }
    };
});
