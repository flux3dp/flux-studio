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
            return vc.meetVersion(requirement[key]);
        }
        else {
            await DeviceMaster.selectDevice(device);
            const deviceInfo = await DeviceMaster.getDeviceInfo();
            const vc = VersionChecker(deviceInfo.version);
            return vc.meetVersion(requirement[key]);
        }
    };

    const requirement = {
        BACKLASH                    : '1.5b12',
        OPERATE_DURING_PAUSE        : '1.6.20',
        UPGRADE_KIT_PROFILE_SETTING : '1.6.20',
        SCAN_CALIBRATION            : '1.6.25',
        M666R_MMTEST                : '1.6.40',
        CLOUD                       : '1.5.0',

        CLOSE_FAN                   : '1.4.1',
    };

    return {
        check
    };
});
