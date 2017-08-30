define([
    'jquery',
    'helpers/device-master',
    'helpers/i18n',
    'app/constants/device-constants',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'helpers/image-data',
    'helpers/api/svg-laser-parser',
], function(
    $,
    DeviceMaster,
    i18n,
    DeviceConstants,
    ProgressActions,
    ProgressConstants,
    imageData,
    svgLaserParser
) {
    'use strict';
    var svgWebSocket = svgLaserParser({ type: 'svgeditor' });

    var convertToFitSVGAPI = (uploadFiles) => {
        uploadFiles.forEach((file) => {
            file.svg_data = file;
            file.real_width = 300;
            file.real_height = 200;
            file.tl_position_x = 0;
            file.tl_position_y = 0;
            file.br_position_x = 300;
            file.br_position_y = 200,
            file.rotate = 0;
            file.width = 300;
            file.height = 200;
            file.image_data = [255,255,255,255];
        });

        return uploadFiles;
    };

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

              var //$ft_controls = $laser_platform.find('.ft-controls'),
                  //_callback = function() {
                  //    GlobalActions.sliceComplete({ time: arguments[2] });
                  //    callback.apply(null, arguments);
                  //},

                  args = [],
                  doLaser = function(settings) {
                    console.log('Bang!');

                    var uploadFiles = [];
                    //============for testing ===============================
                      //$.get("js/lib/svgeditor/test3.svg", (res) => {
                      //$.var data = new XMLSerializer().serializeToString(res);
                      var data = svgCanvas.getSvgString();
                      var blob = new Blob([data], {type: 'image/svg+xml'});
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
                          index: 0,
                          totalFiles: 1
                        });
                    //============for testing end============================

                        console.log('uploadFiles', uploadFiles);
                        uploadFiles.forEach(function(file) {
                          file.uploadName = file.url.split('/').pop();
                        });

                        var convertedFiles = convertToFitSVGAPI(uploadFiles);

                        sendToSVGAPI(convertedFiles, settings, callback, fileMode);

                      };
                  };

              ProgressActions.open(progressType, lang.laser.process_caption, 'Processing...', false);

              doLaser(settings);
          };
      return {
          exportTaskCode: function(settings, fileMode) {
            var getToolpathCallback = (blob, fileMode) => {
                var extension = ('-f' === fileMode ? 'fc' : 'gcode'),
                    // split by . and get unless the last then join as string
                    //fileName = self.state.images[0].name.split('.').slice(0, -1).join(''),
                    fileName = 'test',
                    fullName = fileName + '.' + extension
                    ProgressActions.close();
                    console.log('blob', blob);
                saveAs(blob, fullName)
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
