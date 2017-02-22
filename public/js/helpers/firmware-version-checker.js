define([
    'jquery',
    'helpers/version-checker',
    'helpers/device-master'
], function(
    $,
    VersionChecker,
    DeviceMaster
) {
    return function(device, version) {

        let d = $.Deferred();

        DeviceMaster.selectDevice(device).then(() => {
            return DeviceMaster.getDeviceInfo();
        })
        .then(deviceInfo => {
            console.log('device info', deviceInfo);
            let vc = VersionChecker(deviceInfo.version);
            d.resolve(vc.meetVersion(version));
        });

        return d.promise();
    };
});
