define([
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/i18n',
], function(
    React,
    FnWrapper,
    i18n
){

    const LANG = i18n.lang.beambox.left_panel.insert_object_submenu;

    return React.createClass({
        componentDidMount: function(){
            $('#svgcanvas').mouseup(this._closeDialog);
        },
        _closeDialog: function() {
            console.log('close dialog');
            $('.dialog-opener:checked').click(); // This is very bad practice
        },

        render: function() {
            return (
                <ul>
                    <li onClick={() => {
                        FnWrapper.insertRectangle();
                        this._closeDialog();
                    }}>
                        {LANG.rectangle}
                    </li>
                    <li onClick={() => {
                        FnWrapper.insertEllipse();
                        this._closeDialog();
                    }}>
                        {LANG.ellipse}
                    </li>
                    <li onClick={() => {
                        FnWrapper.insertLine();
                        this._closeDialog();
                    }}>
                        {LANG.line}
                    </li>
                    <li onClick={() => {
                        FnWrapper.importImage();
                        this._closeDialog();
                    }}>
                        {LANG.image}
                    </li>
                    <li onClick={() => {
                        FnWrapper.insertText();
                        this._closeDialog();
                    }}>
                        {LANG.text}
                    </li>
                </ul>
            );
        }
    });

});
