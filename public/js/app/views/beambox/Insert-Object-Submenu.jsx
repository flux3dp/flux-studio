define([
    'jquery',
    'react',
    'jsx!widgets/Dialog-Menu',
    'app/actions/beambox/svgeditor-function-wrapper'
], function(
    $,
    React,
    DialogMenu,
    FnWrapper
){
    'use strict';

    return React.createClass({

        _closeDialog: function() {
            $('.dialog-opener:checked').removeAttr('checked');
        },

        render: function() {
            return (
                <ul onClick={this._closeDialog}>
                    <li onClick={FnWrapper.insertRectangle}>
                        Rectangle
                    </li>
                    <li onClick={FnWrapper.insertEllipse}>
                        Ellipse
                    </li>
                    <li onClick={FnWrapper.insertLine}>
                        Line
                    </li>
                    <li onClick={FnWrapper.importImage}>
                        Image
                    </li>
                    <li onClick={FnWrapper.insertText}>
                        Text
                    </li>
                </ul>
            );
        }
    });

});