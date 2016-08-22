define([
    'app/constants/action-creator-device'
], (
    C
) => {

    let initialState = {
        status: {},
        jobInfo: []
    };

    /**
    * State list
    * status            : (object), machine status
    * jobInfo           : (array), active job info, array of object
    * usbFolderExist    : (bool), wether usb drive (folder) exist in machine or not
    */

    return (state = initialState, action) => {

        var _action = {};

        _action[C.UPDATE_DEVICE_STATUS] = () => Object.assign({}, state, { status: action.status });
        _action[C.UPDATE_JOB_INFO] = () => Object.assign({}, state, { jobInfo: action.jobInfo });
        _action[C.UPDATE_USB_FOLDER_EXISTANCE] = () => Object.assign({}, state, { usbFolderExist: action.usbFolderExist });

        if (typeof _action[action.type] !== 'function') {
            return state;
        }

        return _action[action.type]();
    };
});
