define(['helpers/i18n'], function (i18n) {
    'use strict';

    const lang = i18n.lang;

    const self = {
        /**
         * Error as constants
         */
        Errors: {
            DEFAULT: 0,
            RESOURCE_BUSY: 1,
            TIMEOUT: 2,
            TYPE_ERROR: 3,
            UNKNOWN_COMMAND: 4,
            KICKED: 5
        },
        /**
        * Translate device error into readable language
        * @param {String|String[]} error - some string or array
        */
        translate: (error) => {
            // always process error as array, hard fix for the backend
            error = (error instanceof Array ? error : [error]);

            let errorOutput = '';

            if (error.length) {
                if (error[0] === 'CLOUD') {
                    console.log('device error handler', error);
                    errorOutput = lang.settings.flux_cloud[error.join('_')];
                }
                else if (error.length === 4) {
                    if(error[3] === 'N/A') {
                        errorOutput = this.translate(['HEAD_ERROR','HEAD_OFFLINE']);
                    }
                    // for wrong toolhead type;
                    if (error[1] === 'TYPE_ERROR') {
                        errorOutput = lang.monitor[error.slice(0, 2).join('_')];
                    }
                    if (errorOutput === '') {
                        errorOutput = (error.length >= 2) ? lang.monitor[error.slice(0, 2).join('_')] : error.join('_');
                    }
                } else if (error.length === 3) {
                    errorOutput = self.processToolheadErrorCode(error[2]);
                    // for wrong toolhead type;
                    if (error[1] === 'TYPE_ERROR') {
                        errorOutput = lang.monitor[error.slice(0, 2).join('_')];
                    }
                    if (errorOutput === '') {
                        errorOutput = (error.length >= 2) ? lang.monitor[error.slice(0, 2).join('_')] : error.join('_');
                    }
                } else {
                    if (lang.generic_error[error[0]]) {
                        return lang.generic_error[error[0]];
                    }
                    errorOutput = lang.monitor[error.slice(0, 2).join('_')];
                    if (errorOutput === '' || typeof errorOutput === 'undefined') {
                        errorOutput = error.join(' ');
                    }
                }

                // special case for Pressure sensor failed
                // ["HARDWARE_ERROR",  "SENSOR_ERROR", "FSR", "X-"]
                // ["HARDWARE_ERROR",  "SENSOR_ERROR", "FSR", "X-", "Y-"]
                // ["HARDWARE_ERROR",  "SENSOR_ERROR", "FSR", "X-", "Y-", "Z-"]
                if(error.slice(0,3).join('_') === 'HARDWARE_ERROR_SENSOR_ERROR_FSR') {
                    errorOutput = lang.monitor[error.slice(0, 3).join('_')];
                    errorOutput = `${errorOutput} ${error.slice(3).join(' ')}`;
                }
            }


            return errorOutput || '';
        },
        /**
         *  Process error code ( mostly for toolhead error )
         *  @param {String} argument - The error code
         */
        processToolheadErrorCode: (errorCode) => {
            if (Number(errorCode) === parseInt(errorCode)) {
                let m = parseInt(errorCode).toString(2).split('').reverse();
                let message = m.map((flag, index) => {
                    return flag === '1' ? lang.head_module.error[index] : '';
                });
                return message.filter(entry => entry !== '').join('\n');
            } else {
                return '';
            }
        },
        /**
         * Process change filament response
         * @param {Object} response - Error response from change filament command
         */
        processChangeFilamentResponse: (response) => {
            if ('RESOURCE_BUSY' === response.error[0]) {
                return self.Errors.DEFAULT;
            }
            else if ('TIMEOUT' === response.error[0]) {
                return self.Errors.TIMEOUT;
            }
            else if (response.info === 'TYPE_ERROR') {
                return self.Errors.TYPE_ERROR;
            }
            else if ('UNKNOWN_COMMAND' === response.error[0]) {
                return self.Errors.UNKNOWN_COMMAND;
            }
            else if ('KICKED' === response.error[0]) {
                return self.Errors.KICKED;
            }
            else {
                return self.Errors.DEFAULT;
            }
        },
        /**
         * Regularize error message
         */
        processDeviceMasterResponse: (response) => {
            if (response.info === 'RESOURCE_BUSY') { response.error = ['RESOURCE_BUSY']; }
            if (response.module === 'LASER') { response.error = ['HEAD_ERROR', 'TYPE_ERROR']; }
            // if (!response.module) { response.error = ['HEAD_ERROR', "HEAD_OFFLINE"]; }
            return response;
        }
    };

    return self;
});
