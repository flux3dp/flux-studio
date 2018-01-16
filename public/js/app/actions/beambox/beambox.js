define([
    'helpers/device-master',
    'helpers/i18n',
    'app/constants/device-constants',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'helpers/image-data',
    'helpers/api/svg-laser-parser',
    'helpers/api/fcode-reader',
    'app/actions/alert-actions',
    'app/actions/global-actions',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/beambox/constant'

], function (
    DeviceMaster,
    i18n,
    DeviceConstants,
    ProgressActions,
    ProgressConstants,
    imageData,
    svgLaserParser,
    fcodeReader,
    AlertActions,
    GlobalActions,
    FnWrapper,
    Constant
) {
        'use strict';
        const lang = i18n.get();
        var svgWebSocket = svgLaserParser({ type: 'svgeditor' });

        var ExportGCodeProgressing = function (data) {
            ProgressActions.open(ProgressConstants.STEPPING);
            ProgressActions.updating(data.message, data.percentage * 100);
        };

        var sendToSVGAPI = function (files, settings, callback, fileMode) {
            callback = callback || function () { };

            var laserParser = svgWebSocket,
                onSetParamsFinished = function () {
                    laserParser.uploadToSvgeditorAPI(files).done(onComputeFinished);
                },
                onComputeFinished = function () {
                    var names = [],
                        all_svg = laserParser.History.get();

                    all_svg.forEach(function (obj) {
                        names.push(obj.name);
                    });

                    laserParser.getTaskCode(
                        names,
                        {
                            onProgressing: ExportGCodeProgressing,
                            onFinished: function(fcodeBlob) {
                                callback(fcodeBlob, files[files.length-1].url); // note: last one of files is the thumbnail
                            },
                            fileMode: fileMode
                        }
                    );
                };

            laserParser.params.setEach(
                settings,
                {
                    onFinished: onSetParamsFinished
                }
            );
        };

        var getToolpath = function (settings, callback, progressType, fileMode) {
            fileMode = fileMode || '-f';
            progressType = progressType || ProgressConstants.NONSTOP;
            var args = [],
                doLaser = function (settings) {
                    var uploadFiles = [];
                    var data = svgCanvas.getSvgString();
                    FnWrapper.fetchThumbnail().then((res) => {
                        const thumbnail = res[0];
                        const thumbnailBlobURL = res[1];
                        var blob = new Blob([thumbnail, data], { type: 'image/svg+xml' });
                        var reader = new FileReader();

                        reader.readAsArrayBuffer(blob);
                        reader.onload = function (e) {
                            uploadFiles.push({
                                data: reader.result,
                                //blob: blob,
                                url: thumbnailBlobURL,
                                name: 'svgeditor.svg',
                                extension: 'svg',
                                type: "image/svg+xml",
                                size: blob.size,
                                thumbnailSize: thumbnail.length,
                                index: 0,
                                totalFiles: 1
                            });

                            uploadFiles.forEach(function (file) {
                                file.uploadName = file.url.split('/').pop();
                            });

                            sendToSVGAPI(uploadFiles, settings, callback, fileMode);
                        };
                    });
                };

            ProgressActions.open(progressType, lang.laser.process_caption, 'Processing...', false);

            doLaser(settings);
        };

        return function (args = {}) {
            var self = this;

            
            return {
                uploadFcode: function (settings) {
                    getToolpath(settings,
                        (blob, thumbnailDataURL) => {
                            ProgressActions.updating(lang.message.uploading_fcode, 100);
                            DeviceMaster.selectDevice(self.state.selectedPrinter).then(function (status) {
                                ProgressActions.close();
                                if (status === DeviceConstants.CONNECTED) {
                                    GlobalActions.showMonitor(self.state.selectedPrinter, blob, thumbnailDataURL, 'engrave');
                                }
                                else if (status === DeviceConstants.TIMEOUT) {
                                    AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                }
                            }).fail(function () {
                                ProgressActions.close();
                            });
                        },
                        ProgressConstants.STEPPING,
                        '-f');
                },

                exportTaskCode: function (settings, fileMode) {
                    var getToolpathCallback = (blob, fileMode) => {
                        var extension = ('-f' === fileMode ? 'fc' : 'gcode'),
                            // split by . and get unless the last then join as string
                            //fileName = self.state.images[0].name.split('.').slice(0, -1).join(''),
                            fileName = 'untitled',
                            fullName = fileName + '.' + extension;
                        ProgressActions.close();
                        saveAs(blob, fullName);
                    };
                    getToolpath(
                        settings,
                        getToolpathCallback,
                        ProgressConstants.STEPPING,
                        fileMode || '-f'
                    );
                },
            };
        };
    });
