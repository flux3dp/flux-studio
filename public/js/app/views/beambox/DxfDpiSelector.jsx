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

    const DxfDpiSelector = ({defaultDpiValue, onSubmit, onCancel}) => {
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
                    {lang.message.please_enter_dpi}
                    <br/>
                    2.54, 25.4, 72, 96 etc.
                </div>
                <div className="message" style={{textAlign: 'center'}}>
                    <input
                        id='dpi-input'
                        defaultValue={defaultDpiValue}
                        onClick={clearInputValue}
                        onKeyDown={_handleKeyDown}
                        style={style}
                    />
                </div>

                <ButtonGroup buttons={buttons}/>
            </div>
        );
    };
    return DxfDpiSelector;
});
