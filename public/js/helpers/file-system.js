define(function() {
    'use strict';

    var defaults = {
            size: 5 * 1024 * 1024 /*50MB*/,
            onComplete: function() {},
            onError: function() {}
        },
        defaultOptions = function(options) {
            options = options || {};

            for (var key in defaults) {
                if (true === defaults.hasOwnProperty(key) && false === options.hasOwnProperty(key)) {
                    options[key] = defaults[key];
                }
            }

            return options;
        },
        /**
         * Options:
         *     file: the file you wanna to write to filesystem
         *     size: how many capacity you take
         *
         *     // Events
         *     onComplete: firing when process complete
         *     onError: firing when error occurred
         */
        requestFileSystem = function(options, callback) {
            var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

            requestFileSystem(
                window.TEMPORARY,
                options.size || defaults.size,
                function(fileSystem) {
                    callback(fileSystem);
                }
            );

        },
        /**
         * write file into local drive
         */
        writeFile = function(options) {
            options.onError = options.onError || defaults.onError;
            options.onComplete = options.onComplete || defaults.onComplete;

            requestFileSystem(options, function(fileSystem) {
                fileSystem.root.getFile(
                    options.file.name,
                    {
                        create: options.append || true  // **true** will create a new file or overwrite existing file
                    },
                    function(fileEntry) {
                        // Do something with fileEntry.
                        fileEntry.createWriter(function(fileWriter) {
                            var fr = new FileReader();

                            fileWriter.onwriteend = function(e) {
                                options.onComplete(e, fileEntry);
                            };

                            if (true === options.append) {
                                fileWriter.seek(fileWriter.length);
                            }

                            fileWriter.onerror = options.onError;

                            fr.onloadend = function(e) {
                                var contentBlob = new Blob([fr.result]);
                                fileWriter.write(contentBlob);
                            };

                            fr.onerror = options.onError;
                            fr.readAsArrayBuffer(options.file);

                        }, options.onError);
                    },
                    options.onError
                );
            });
        },
        readDir = function(options) {
            options.onError = options.onError || defaults.onError;
            options.onComplete = options.onComplete || defaults.onComplete;

            requestFileSystem(options, function(fileSystem) {
                var dirReader = fileSystem.root.createReader(),

                    // Call the reader.readEntries() until no more results are returned.
                    readEntries = function() {
                        dirReader.readEntries(function(results) {
                            options.onComplete(results);
                        }, options.onError);
                    };

                readEntries(); // Start reading dirs.
            });
        },
        getFile = function(options) {
            options.onError = options.onError || defaults.onError;
            options.append = false;
            options.onComplete = options.onComplete || defaults.onComplete;

            // console.log(options);
            requestFileSystem(options, function(fileSystem) {
                // console.log(fileSystem);
                fileSystem.root.getFile(
                    options.file.name,
                    {},
                    function(fileEntry) {
                        console.log(fileEntry.toURL());
                        // Do something with fileEntry.
                        fileEntry.file(function(file) {
                            console.log(file);
                            var fileReader = new FileReader();

                            fileReader.onloadend = function(e) {
                                // var contentBlob = new Blob([fileReader.result]);
                                // console.log(contentBlob);
                                console.log('aa');
                                options.onComplete(e);
                            };

                            fileReader.onerror = options.onError;
                            fileReader.readAsArrayBuffer(file);
                            // fileReader.readAsText(file);

                        }, options.onError);
                    },
                    options.onError
                );
            });
        };

    return {
        getFile: function(file, options) {
            options = defaultOptions(options);
            options.file = file;

            getFile(options);

            return this;
        },
        writeFile: function(file, options) {
            options = defaultOptions(options);
            options.file = file;

            writeFile(options);

            return this;
        },
        readDir: function(callback, options) {
            options = defaultOptions(options);
            options.onComplete = callback || defaults.onComplete;

            readDir(options);

            return this;
        }
    };
});