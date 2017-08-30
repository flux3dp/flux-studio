define([

], function(

){
    'use strict';

    //main panel
    function importImage() {
        $('#tool_import input').click();
    }

    //left panel
    function useSelectTool() {
        $('#tool_select').click();
    }

    function insertRectangle() {
        $('#tool_rect').mouseup();
    }

    function insertEllipse() {
        $('#tool_ellipse').mouseup();
    }

    function insertLine() {
        $('#tool_line').mouseup();
    }

    function insertText() {
        $('#tool_text').click();
    }




    return {
        importImage: importImage,
        insertRectangle: insertRectangle,
        insertEllipse: insertEllipse,
        insertLine: insertLine,
        insertText: insertText,
        useSelectTool: useSelectTool
    };
});