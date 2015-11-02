define([
    'react'
], function(React) {
    'use strict';

    return React.createClass({
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
                blob,
                readFile = function() {
                    fileReader = new FileReader();

                    fileReader.onloadend = function(e) {
                        blob = new Blob([fileReader.result], { type: thisFile.type });
                        self.props.onReadingFile({
                            data: fileReader.result,
                            blob: blob,
                            url: blobUrl.createObjectURL(blob),
                            extension: self.getFileExtension(thisFile.name),
                            type: thisFile.type,
                            size: thisFile.size
                        });

                        fileIndex++;
                        thisFile = files.item(fileIndex);

                        // finished
                        if (fileIndex === files.length) {
                            self.props.onReadEnd(e, files);
                            currentTarget.value = '';
                        }
                        // move forward
                        else {
                            readFile();
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
        },

        getDefaultProps: function() {
            return {
                lang: React.PropTypes.object,
                sizeMaxLimit: React.PropTypes.number,
                accept: React.PropTypes.string,
                multiple: React.PropTypes.bool,
                className: {},
                // events
                onReadFileStarted: React.PropTypes.func,
                onReadingFile: React.PropTypes.func,
                onReadEnd: React.PropTypes.func,
                onError: React.PropTypes.func
            };
        }

    });
});