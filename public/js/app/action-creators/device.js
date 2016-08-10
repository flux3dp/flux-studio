define([
    'app/constants/action-creator-device'
], (
    C
) => {

    const updateDeviceStatus = (status) => ({
        type: C.UPDATE_DEVICE_STATUS,
        status
    });

    const updateJobInfo = (jobInfo) => ({
        type: C.UPDATE_JOB_INFO,
        jobInfo
    });

    const updateUsbFolderExistance = (usbFolderExist) => ({
        type: C.UPDATE_USB_FOLDER_EXISTANCE,
        usbFolderExist
    });

    return {
        updateDeviceStatus,
        updateJobInfo,
        updateUsbFolderExistance
    };

});
