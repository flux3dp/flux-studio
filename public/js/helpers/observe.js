/**
 * refers to: http://www.jqui.net/node-js/recursive-object-observer/
 */
define(function() {
    'use strict';

    return (function() {

        return function Observe(root, callback, curr, path) {
            var base, curr_path, item, key, type_of_curr, _i, _len;
            if (curr == null) {
                curr = null;
            }
            if (path == null) {
                path = null;
            }
            curr = curr || root;
            type_of_curr = curr.constructor.name;
            base = path;
            if (type_of_curr === "Array") {
                for (key = _i = 0, _len = curr.length; _i < _len; key = ++_i) {
                    item = curr[key];
                    if (typeof item === "object") {
                        if (base) {
                            path = "" + base + "[" + key + "]";
                        }
                        if (!base) {
                            path = "" + key;
                        }
                        new Observe(root, callback, item, path);
                        path = "";
                    }
                }
            }
            if (type_of_curr === "Object") {
                for (key in curr) {
                    item = curr[key];
                    if (typeof item === "object") {
                        if (base) {
                            path = "" + base + "." + key;
                        }
                        if (!base) {
                            path = "" + key;
                        }
                        new Observe(root, callback, item, path);
                        path = "";
                    }
                }
            }
            if (curr.constructor.name === "Array") {
                curr_path = path;
                Array.observe(curr, function(changes) {
                    var original, result;
                    result = {};
                    original = {};
                    base = path;
                    changes.forEach(function(change, i) {
                        var part;
                        path = "" + base + "[" + change.index + "]";
                        part = {
                            path: curr_path,
                            value: change.object
                        };
                        if (change.addedCount > 0 && typeof part.value === "object") {
                            new Observe(root, callback, part.value, part.path);
                        }
                        result[i] = part;
                        return original[i] = change;
                    });
                    return callback(result, original);
                });
            }
            if (curr.constructor.name === "Object") {
                base = "" + path;
                Object.observe(curr, function(changes) {
                    var original, result;
                    result = {};
                    original = {};
                    changes.forEach(function(change, i) {
                        var part;
                        curr_path = path;
                        if (base) {
                            path = "" + base + "." + change.name;
                        }
                        if (!base) {
                            path = "" + change.name;
                        }
                        part = {
                            path: path,
                            value: change.object[change.name]
                        };
                        if (change.type === "add" && typeof part.value === "object") {
                            new Observe(root, callback, part.value, part.path);
                        }
                        result[i] = part;
                        return original[i] = change;
                    });
                    return callback(result, original);
                });
            }
        }

    })();

});