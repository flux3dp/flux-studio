define([
    'react',
    'jsx!widgets/Button-Group',
    'app/constants/keycode-constants',
    'helpers/i18n'
],
function(
    React,
    ButtonGroup,
    KeyCodeConstants,
    i18n
) {
    const lang = i18n.lang;

    const DxfDpiSelector = ({onSubmit, onCancel}) => {
        const submitValue = () => {
            const dpi = Number($('#dpi-input').val());
            onSubmit(dpi);
        };
        const _handleKeyDown = (e) => {
            if (e.keyCode === KeyCodeConstants.KEY_RETURN) {
                submitValue();
            }
        };
        const clearInputValue = () => {
            $('#dpi-input').val('');
        };

        const buttons = [
            {
                label: lang.alert.cancel,
                right: true,
                onClick: () => onCancel()
            },
            {
                label: lang.alert.ok,
                right: true,
                onClick: () => submitValue()
            }
        ];
        const style = {
            padding: '3px 10px',
            width: '120px',
            textAlign: 'left'
        };
        return (
            <div>
                <div className='caption'>
                    {lang.message.please_select_dpi}
                </div>
                <div className="message" style={{textAlign: 'center'}}>
                    <input
                        list='suggest-dpi'
                        id='dpi-input'
                        onClick={clearInputValue}
                        onKeyDown={_handleKeyDown}
                        style={style}
                    />
                    <datalist id='suggest-dpi'>
                        <option value='2.54'/>
                        <option value='25.4'/>
                        <option value='72'/>
                        <option value='96'/>
                    </datalist>
                </div>

                <ButtonGroup buttons={buttons}/>
            </div>
        );
    };
    return DxfDpiSelector;
});
