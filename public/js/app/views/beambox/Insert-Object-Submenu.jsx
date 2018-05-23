define([
    'jquery',
    'react',
    'jsx!widgets/Dialog-Menu',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/i18n',
    'helpers/shortcuts',
], function(
    $,
    React,
    DialogMenu,
    FnWrapper,
    i18n,
    Shortcuts
){

    const LANG = i18n.lang.beambox.left_panel.insert_object_submenu;

    return React.createClass({
        componentDidMount: function(){
            Shortcuts.on(['esc'], this._closeDialog);
        },
        _closeDialog: function() {
            console.log('close dialog');
            $('.dialog-opener:checked').click(); // This is very bad practice
        },

        render: function() {
            return (
                <ul>
                    <li onClick={FnWrapper.insertRectangle}>
                        {LANG.rectangle}
                    </li>
                    <li onClick={FnWrapper.insertEllipse}>
                        {LANG.ellipse}
                    </li>
                    <li onClick={FnWrapper.insertLine}>
                        {LANG.line}
                    </li>
                    <li onClick={FnWrapper.importImage}>
                        {LANG.image}
                    </li>
                    <li onClick={FnWrapper.insertText}>
                        {LANG.text}
                    </li>
                </ul>
            );
        }
    });

});
