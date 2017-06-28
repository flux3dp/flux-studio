define([], function(){
    return {
        CHANGE_ENGINE_ERROR : '1',  // change engine
        CURA_VERSION_ERROR  : '2',  // change engine
        PATH_IS_NOT_CURA    : '3',  // change engine
        PATH_IS_NOT_FILE    : '4',  // change engine
        SLICING_ERROR       : '5',  // report slicing
        GCODE_AREA_TOO_BIG  : '6',  // report slicing
        INVALID_PARAMETER   : '7',  // advanced setting
        NO_RESULT           : '8',  // get result
        NO_PATH_DATA        : '9',  // get result
        NOT_UPDALOADED_YET  : '10', // delete
        WRONG_ENGINE        : '11', // change engine
        EMPTY_FILE          : '12', // upload
        NAME_NOT_EXIST      : '13', // duplicate
        NAME_NOT_UPLOADED   : '14', // set
        FILE_BROKEN         : '15', // upload
        LIBRARY_NOT_FOUND   : 'LIBRARY_NOT_FOUND'
    };
});
