define([
    'react'
], function(React) {
    'use strict';

    return React.createClass({
        // public events
        getFileExtension: function(fileName) {
            return fileName.split('.').pop();
        },

        // UI events
        _onReadFile: function(e) {
            var self = this,
                currentTarget = e.currentTarget,
                files = currentTarget.files,
                fileIndex = 0,
                goNext = true,
                thisFile = files.item(0),
                blobUrl = window.URL,
                fileReader,
                blob,
                timer;

            self.props.onReadFileStarted(e);

            timer = setInterval(function() {
                if (true === goNext) {
                    goNext = false;

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

                        if (fileIndex === files.length) {
                            self.props.onReadEnd(e, files);
                            clearInterval(timer);
                            currentTarget.value = '';
                        }

                        goNext = true;
                    };

                    fileReader.onerror = function() {
                        self.onError();
                        clearInterval(timer);
                        currentTarget.value = '';
                    };

                    fileReader.readAsArrayBuffer(thisFile);
                }
            }, 0);
        },

        componentDidMount: function () {
            this.refs.uploader.getDOMNode().setAttribute('nwsaveas', true);
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
                onReadFileStarted: React.PropTypes.func,
                onReadingFile: React.PropTypes.func,
                onReadEnd: React.PropTypes.func,
                onError: React.PropTypes.func
            };
        }

    });
});