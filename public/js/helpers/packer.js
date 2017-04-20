define(['jquery'],function($) {
    'use strict';

    /// packing files into a blob for user to download, used for saving scene
    /// leading reserve length (12) for tracking where information starts

    var reserveLength = 12, // 999 GB max
        files   = [],
        info    = [];

    function addFile(file) {
        files.push(file);
    }

    function addInfo(information) {
        info.push(information);
    }

    function pack() {
        console.log('packing');
        var fileInfo = [],
            totalSize;

        totalSize = files.reduce(function(p, c) {
            return {size: p.size + c.size};
        }, {size: 0});

        totalSize = totalSize.size;

        files.forEach(function(i) {
            fileInfo.push({size: i.size, name: i.name});
        });

        info.unshift(fileInfo);
        files.push(JSON.stringify(info));

        var infoIndex = _pad(totalSize, reserveLength);
        files.unshift(infoIndex);

        var b = new Blob(files, {type : 'application/scene'});
        return b;
    }

    function unpack(source) {
        var d = $.Deferred();
        var _files = [];
        getInfo(source).then(function(_info) {
            var fileInfo = _info[0],
                start = reserveLength;

            fileInfo.forEach(function(f) {
                var end = start + f.size,
                    _file = source.slice(start, end);

                start = end;
                _file.name = f.name;
                _files.push(_file);
            });

            _info.shift();
            _info.unshift(_files);
            d.resolve(_info);
        });

        return d.promise();
    }

    function getInfoIndex(blob) {
        var d = $.Deferred();
        var test = blob.slice(0, reserveLength);
        var f = new FileReader();
        f.onload = function() {
            d.resolve(parseInt(f.result) + reserveLength);
        };
        f.readAsText(test);
        return d.promise();
    }

    function getInfo(blob) {
        var d = $.Deferred();
        getInfoIndex(blob).then(function(i) {
            if(i > 0) {
                var data = blob.slice(i);
                var f = new FileReader();
                f.onload = function() {
                    d.resolve(JSON.parse(f.result));
                };
                f.readAsText(data);
            }
        });

        return d.promise();
    }

    function clear() {
        files.length = 0;
        info.length = 0;
    }

    function _pad(num, size) {
        var s = num + '';
        while (s.length < size) {
            s = '0' + s;
        }
        return s;
    }

    return {
        addFile     : addFile,
        addInfo     : addInfo,
        pack        : pack,
        unpack      : unpack,
        clear       : clear
    };
});
