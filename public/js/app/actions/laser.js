define([
    'jquery',
    'helpers/file-system',
    'helpers/display'
], function($, fileSystem, display) {
    'use strict';

    return function(args) {

        var $uploader = $('.file-importer'),
            $uploader_file_control = $uploader.find('[type="file"]'),
            readfiles = function(files) {
                for (var i = 0; i < files.length; i++) {
                    fileSystem.writeFile(
                        files.item(i),
                        {
                            onComplete: function(e, fileEntry) {
                                $('#file-importer').hide();
                                $('#operation-table').show();
                            }
                        }
                    );

                }

            };

        $uploader_file_control.on('change', function(e) {
            readfiles(this.files);
        });

        $uploader.on('dragover dragend', function() {
            return false;
        });

        $uploader.on('drop', function(e) {
            e.preventDefault();
            readfiles(e.originalEvent.dataTransfer.files);
        });
    };
});