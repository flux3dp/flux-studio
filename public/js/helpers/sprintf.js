define(function() {
    'use strict';

    return function(formated_str) {
        var regex_pattern = '%[sdf]{1}',
            regular_regex = new RegExp(regex_pattern),
            global_regex  = new RegExp(regex_pattern, 'g'),
            match, identity, replace, args,
            replace_interface = function(str, type) {
                var converter = {
                        s : function(str) {
                            return str;
                        },
                        d : function(str) {
                            return converter.s(parseInt(str, 10) || 0);
                        },
                        f : function(str) {
                            return converter.s(parseFloat(str, 10) || 0);
                        }
                    };

                str = (converter[type] || converter.s)(str);
                return str;
            },
            objectToArray = function(json) {
                var ary = [];

                for (var i in json) {
                    if (true === json.hasOwnProperty(i)) {
                        ary.push(json[i]);
                    }
                }

                return ary;
            };

        formated_str = formated_str.toString();
        args = objectToArray(arguments).slice(1);

        args.forEach(function(v, k) {
            match = regular_regex.exec(formated_str);

            if (true === match instanceof Array) {
                identity = formated_str.substr(match.index + 1, 1);
                replace  = replace_interface(v, identity);
                formated_str = formated_str.replace(regular_regex, replace);
            }

        });

        return formated_str.replace(global_regex, '');
    };
});