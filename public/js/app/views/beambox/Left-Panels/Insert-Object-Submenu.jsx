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

    return ({onClose}) => {
        return (
            <div className='dialog-window' style={{display: 'flex'}}>
                <div className='arrow arrow-left'/>
                <div className='dialog-window-content'>
                    <ul onClick={() => onClose()} style={{margin: '0px'}}>
                        <li onClick={() => {
                            FnWrapper.insertRectangle();
                        }}>
                            {LANG.rectangle}
                        </li>
                        <li onClick={() => {
                            FnWrapper.insertEllipse();
                        }}>
                            {LANG.ellipse}
                        </li>
                        <li onClick={() => {
                            FnWrapper.insertLine();
                        }}>
                            {LANG.line}
                        </li>
                        <li onClick={() => {
                            FnWrapper.importImage();
                        }}>
                            {LANG.image}
                        </li>
                        <li onClick={() => {
                            FnWrapper.insertText();
                        }}>
                            {LANG.text}
                        </li>
                    </ul>
                </div>
            </div>
        );
    };
});
