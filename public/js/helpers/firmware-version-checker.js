define([
    'jquery',
    'helpers/version-checker',
    'helpers/device-master'
], function(
    $,
    VersionChecker,
    DeviceMaster
) {
    const check = async (device, key) => {
        if(device.version) {
            await DeviceMaster.selectDevice(device);
            let vc = VersionChecker(device.version);
            return vc.meetRequirement(key);
        }
        else {
            await DeviceMaster.selectDevice(device);
            const deviceInfo = await DeviceMaster.getDeviceInfo();
            const vc = VersionChecker(deviceInfo.version);
            return vc.meetRequirement(key);
        }
    };

    return {
        check
    };
});
