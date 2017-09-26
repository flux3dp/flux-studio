define([
    'jquery',
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
    'app/actions/beambox/svgeditor-function-wrapper'

], function(
    $,
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
    svgeditorFunction
) {
    'use strict';
    var svgWebSocket = svgLaserParser({ type: 'svgeditor' });

    var ExportGCodeProgressing = function(data) {
            ProgressActions.open(ProgressConstants.STEPPING);
            ProgressActions.updating(data.message, data.percentage * 100);
        };

    var sendToSVGAPI = function(args, settings, callback, fileMode) {
            console.log('sendToSVGAPI', args, settings, callback, fileMode);
            callback = callback || function() {};

            var laserParser = svgWebSocket,
                onSetParamsFinished = function() {
                    laserParser.uploadToSvgeditorAPI(args).done(onComputeFinished);
                },
                onComputeFinished = function() {
                    console.log('onComputeFinished')
                    var names = [],
                        all_svg = laserParser.History.get();

                    all_svg.forEach(function(obj) {
                        names.push(obj.name);
                    });

                    laserParser.getTaskCode(
                        names,
                        {
                            onProgressing: ExportGCodeProgressing,
                            onFinished: callback,
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

    return function(args = {}) {
      var self = this,
          lang = i18n.get();

      var getToolpath = function(settings, callback, progressType, fileMode) {
              fileMode = fileMode || '-f';
              progressType = progressType || ProgressConstants.NONSTOP;
              var args = [],
                  doLaser = function(settings) {
                      var uploadFiles = [];
                      var data = svgCanvas.getSvgString();
                      svgeditorFunction.fetchThumbnailDataurl().done((thumbnail) => {
                          var blob = new Blob([thumbnail, data], {type: 'image/svg+xml'});
                          var reader = new FileReader();

                          reader.readAsArrayBuffer(blob);
                          reader.onload = function(e) {
                              uploadFiles.push({
                                data: reader.result,
                                //blob: blob,
                                url: window.URL.createObjectURL(blob),
                                name: 'svgeditor.svg',
                                extension: 'svg',
                                type: "image/svg+xml",
                                size: blob.size,
                                thumbnailSize: thumbnail.length,
                                index: 0,
                                totalFiles: 1
                              });

                              uploadFiles.forEach(function(file) {
                                file.uploadName = file.url.split('/').pop();
                              });

                              sendToSVGAPI(uploadFiles, settings, callback, fileMode);
                          };
                      });
                  };

              ProgressActions.open(progressType, lang.laser.process_caption, 'Processing...', false);

              doLaser(settings);
          };
      return {
          connectDevice: function() {
              var d = $.Deferred();
              DeviceMaster.selectDevice(self.state.selectedPrinter).then(function (status) {
                if (status === DeviceConstants.CONNECTED) {
                  return d.resolve(status)
                }else {
                  return d.reject(status)
                }
              });
              return d.promise()
          },
          endMaintainMove: function(args) {
              DeviceMaster.endMaintainMode();
          },

          maintainMove: function(args) {
              DeviceMaster.maintainMove(args);
          },

          movement: function(movementMode) {
              var d = $.Deferred();
              DeviceMaster.selectDevice(self.state.selectedPrinter).then(function(status) {
                console.log('status', status);
                  if (status === DeviceConstants.CONNECTED) {
                     if (movementMode === false) {
                        DeviceMaster.enterMaintainMode();
                        return d.resolve(DeviceConstants.CONNECTED);
                     } else if (movementMode === true) {
                        DeviceMaster.endMaintainMode();
                        //return d.resolve(DeviceConstants.CONNECTED);
                     }

                  } else if (status === DeviceConstants.TIMEOUT) {
                      AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                      return d.resolve(DeviceConstants.TIMEOUT);
                  };
              });
              return d.promise();
          },

          uploadFcode: function(settings) {
                getToolpath(settings,
                    (blob) => {
                        var blobUrl = window.URL,
                            fcodeReaderMethods = fcodeReader(),
                            parseFCode = function() {
                                fcodeReaderMethods.getThumbnail().then((data) => {
                                    ProgressActions.close();
                                    DeviceMaster.selectDevice(self.state.selectedPrinter).then(function(status) {
                                        if (status === DeviceConstants.CONNECTED) {
                                            GlobalActions.showMonitor(self.state.selectedPrinter, blob, blobUrl.createObjectURL(data), 'engrave');
                                        }
                                        else if (status === DeviceConstants.TIMEOUT) {
                                            AlertActions.showPopupError('menu-item', lang.message.connectionTimeout);
                                        }
                                    });
                                });
                            };

                        ProgressActions.updating(lang.message.uploading_fcode, 100);
                        fcodeReaderMethods.upload(blob).then(() => {
                            parseFCode();
                        });
                    },
                    ProgressConstants.STEPPING,
                    '-f');
          },

          exportTaskCode: function(settings, fileMode) {
            var getToolpathCallback = (blob, fileMode) => {
                var extension = ('-f' === fileMode ? 'fc' : 'gcode'),
                    // split by . and get unless the last then join as string
                    //fileName = self.state.images[0].name.split('.').slice(0, -1).join(''),
                    fileName = 'test',
                    fullName = fileName + '.' + extension
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
