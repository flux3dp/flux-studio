define(function() {
    const requirement = {
        BACKLASH                    : '1.5b12',
        OPERATE_DURING_PAUSE        : '1.6.20',
        UPGRADE_KIT_PROFILE_SETTING : '1.6.20',
        SCAN_CALIBRATION            : '1.6.25',
        M666R_MMTEST                : '1.6.40',
        CLOUD                       : '1.5.0',

        CLOSE_FAN                   : '1.4.1',
        BEAMBOX_CAMERA_SPEED_UP     : '1.4.4',
        BEAMBOX_CAMERA_CALIBRATION_XY_RATIO: '1.6.0',
    };

    // 1.7.0 > 1.5.0 > 1.5b12 > 1.5a12
    return function(sourceVersion) {
        const currentVersion = sourceVersion.split('.');
        const meetVersion = (targetVersion) => {
            targetVersion = targetVersion.split('.');
            // Compare first version number
            if (parseInt(targetVersion[0]) > parseInt(currentVersion[0])) return false;
            const targetMinorVersion = targetVersion[1].split(/[ab]/);
            const currentMinorVersion = currentVersion[1].split(/[ab]/);

            // Compare second version number - Adapt with 1.5b12 style.
            // Crashes when beta / alpha version number exceed 40000
            if (parseInt(targetVersion[1] || 0) >= 40000) throw new Error("Second version number overflow, should be < 40000");
            if (parseInt(currentMinorVersion[1] || 0) >= 40000) throw new Error("Second version number overflow, should be < 40000");
            let targetMinorScore = parseInt(targetMinorVersion[0]) * 120000 - parseInt(targetMinorVersion[1] || 0);
            let currentMinorScore = parseInt(currentMinorVersion[0]) * 120000 - parseInt(currentMinorVersion[1] || 0);
            if (targetVersion[1].indexOf('a') > -1) targetMinorScore -= 80000; // Alpha Version => Score -80000
            if (targetVersion[1].indexOf('b') > -1) targetMinorScore -= 40000; // Beta Version => Score -40000
            if (currentVersion[1].indexOf('a') > -1) currentMinorScore -= 80000;
            if (currentVersion[1].indexOf('b') > -1) currentMinorScore -= 40000;
            if (targetMinorScore == currentMinorScore) {
                return parseInt(targetVersion[2] || 0) <= parseInt(currentVersion[2] || 0);
            }
            return targetMinorScore < currentMinorScore;
        };

        const meetRequirement = key => meetVersion(requirement[key]);

        return {
            meetRequirement
        };
    };
});
