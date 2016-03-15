define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    var deferred = $.Deferred();

    return React.createClass({
        getDefaultProps: function() {
            return {
                lang: {},
                sizeMaxLimit: 400000,
                accept: '',
                multiple: true,
                className: {},
                // events
                onReadFileStarted: function() {},
                onReadingFile: function() {},
                onReadEnd: function() {},
                onError: function() {}
            };
        },

        // public events
        getFileExtension: function(fileName) {
            return fileName.split('.').pop();
        },

        readFiles: function(e, files) {
            var self = this,
                currentTarget = e.currentTarget,
                fileIndex = 0,
                thisFile = files.item(0),
                blobUrl = window.URL,
                fileReader,
                uploadFiles = [],
                blob,
                readFile = function() {
                    fileReader = new FileReader();

                    fileReader.onloadend = function(e) {
                        blob = new Blob([fileReader.result], { type: thisFile.type });
                        uploadFiles.push({
                            data: fileReader.result,
                            blob: blob,
                            url: blobUrl.createObjectURL(blob),
                            name: thisFile.name,
                            extension: self.getFileExtension(thisFile.name),
                            type: thisFile.type,
                            size: thisFile.size,
                            index: fileIndex,
                            totalFiles: files.length
                        });

                        fileIndex++;
                        thisFile = files.item(fileIndex);

                        deferred.notify({
                            status: 'reading',
                            file: uploadFiles.slice(-1)[0],
                            isEnd: (fileIndex === files.length)
                        });

                        // finished
                        if (fileIndex === files.length) {
                            deferred.resolve();
                            deferred = $.Deferred();
                            currentTarget.value = '';
                        }
                    };

                    fileReader.onerror = function() {
                        self.props.onError();
                        currentTarget.value = '';
                    };

                    fileReader.readAsArrayBuffer(thisFile);
                },
                checkType = function(files) {
                    var accept = self.props.accept.replace(',', '|'),
                        reg = new RegExp(accept.replace('*', '\\w*')),
                        result = true;

                    for (var i = 0; i < files.length; i++) {
                        result = reg.test(files.item(i).type);

                        if (false === result) {
                            break;
                        }
                    }

                    return result;
                };

            self.props.onReadFileStarted(e);
            deferred.
                progress(function(data) {
                    self.props.onReadingFile(data.file, data.isEnd, deferred);

                    if (false === data.isEnd) {
                        readFile();
                    }
                }).
                done(self.props.onReadEnd.bind(null, e, uploadFiles));

            if (false === checkType(files)) {
                self.props.onError('Image only');
            }
            else {
                readFile();
            }
        },

        // UI events
        _onReadFile: function(e) {
            var self = this,
                files = e.currentTarget.files;

            self.readFiles(e, files);
        },

        render: function() {
            var self = this,
                cx = React.addons.classSet,
                props = self.props,
                state = self.state,
                className = cx(props.className),
                lang = props.lang;

            return (
                <input
                    data-ga-event="upload-file"
                    ref="uploader"
                    type="file"
                    className={className}
                    accept={props.accept}
                    multiple={props.multiple}
                    defaultValue=""
                    onChange={self._onReadFile}
                />
            );
        }

    });
});