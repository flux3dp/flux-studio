define([
    'app/constants/action-creator-monitor',
    'app/constants/global-constants'
], (
    C,
    GC
) => {

    const changeMode = (mode) => ({
        type: C.CHANGE_MODE,
        mode: mode
    });

    const changePath = (path, content) => ({
        type: C.CHANGE_PATH,
        mode: GC.FILE,
        path: path,
        folderContent: content,
        isWaiting: false
    });

    const updateFoldercontent = (content) => ({
        type: C.UPDATE_FOLDER_CONTENT,
        folderContent: content,
        mode: GC.FILE,
        isWaiting: false
    });

    const previewFile = (info) => ({
        type: C.PREVIEW_FILE,
        mode: GC.FILE_PREVIEW,
        selectedFileInfo: info
    });

    const selectItem = (item) => ({
        type: C.SELECT_ITEM,
        selectedItem: item
    });

    const setDownloadProgress = (progress) => ({
        type: C.SET_DOWNLOAD_PROGRESS,
        downloadProgress: progress
    });

    const setUploadProgress = (progress) => ({
        type: C.SET_UPLOAD_PROGRESS,
        uploadProgress: progress
    });

    const showWait = () => ({
        type: C.SHOW_WAIT,
        isWaiting: true
    });

    const closeWait = () => ({
        type: C.CLOSE_WAIT,
        isWaiting: false
    });

    return {
        changeMode          : changeMode,
        changePath          : changePath,
        updateFoldercontent : updateFoldercontent,
        previewFile         : previewFile,
        selectItem          : selectItem,
        setDownloadProgress : setDownloadProgress,
        setUploadProgress   : setUploadProgress,
        showWait            : showWait,
        closeWait           : closeWait
    };

});
