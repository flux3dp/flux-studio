define([
], function(
) {
    return (fullPhoneNumber) => {
        if (fullPhoneNumber === '') {
            return {};
        }
        const prefixs = ['+86', '+852', '+853', '+886'];
        const matchPrefix = prefixs.find(x => fullPhoneNumber.startsWith(x));
        const number = fullPhoneNumber.replace(matchPrefix, '');
        return {
            'prefix': matchPrefix,
            'number': number
        };
    };
});
