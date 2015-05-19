define([
    'jquery',
    'jsx!widgets/Popup'
], function($, popup) {
    'use strict';

    return function(args) {

        var $lanuch_img = $('.launch-img'),
            $starting_section = $('.starting-section'),
            $operating_section = $('.operating-section'),
            $header = $('.scan-herader'),
            $btn_scan = $('#btn-scan'),
            $btn_rescan = $('#btn-rescan'),
            $btn_export = $('#btn-export'),
            popup_window;


        $lanuch_img.on('click', function(e) {
            $starting_section.hide();
            $operating_section.show();
            $header.removeClass('invisible');
        });

        $btn_scan.on('click', function(e) {
            require(['jsx!views/scan/Progress-Bar'], function(view) {
                popup_window = popup(view, args);
                popup_window.open();
            });
        });

        $btn_rescan.on('click', function(e) {
            $starting_section.show();
            $operating_section.hide();
            $header.addClass('invisible');
        });

        $btn_export.on('click', function(e) {
            require(['jsx!views/scan/Export'], function(view) {
                popup_window = popup(view, args);
                popup_window.open();
            });
        });
    };
});