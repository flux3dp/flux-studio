define([
    'app/actions/film-cutter/record-manager',
], function(
    RecordManager
) {
    return {
        validate: () => {
            const expiry_time = RecordManager.read('usage_download');
            return (expiry_time > Date.now());
        }
    };
});
