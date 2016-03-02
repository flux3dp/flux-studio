define([
    'helpers/i18n',
], function(
    i18n
) {
    'use strict';

    var lang = i18n.get(),
        oneHour = 3600,
        oneMinute = 60;

    return function(lengthInSecond) {

        lengthInSecond = lengthInSecond || 0;

        if(lengthInSecond >= oneHour) {

            var hours = parseInt(lengthInSecond / oneHour),
                minutes = parseInt(lengthInSecond % oneHour / oneMinute);

            return `${hours} ${lang.monitor.hour} ${minutes} ${lang.monitor.minute}`;

        } else if (lengthInSecond >= oneMinute) {

            var minutes = parseInt(lengthInSecond / oneMinute),
                seconds = parseInt(lengthInSecond % oneMinute);

            return `${minutes} ${lang.monitor.minute} ${seconds} ${lang.monitor.second}`;

        } else {

            if(!lengthInSecond) {
                return '';
            }
            return `${parseInt(lengthInSecond)} ${lang.monitor.second}`;

        }

    };

});
