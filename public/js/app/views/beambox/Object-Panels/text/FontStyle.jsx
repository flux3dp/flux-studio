define([
    'react',
    'plugins/classnames/index',
], function(
    React,
    ClassNames
) {

    const FontStyle = ({currentFontStyle, fontStyleOptions, onChange}) => {
        const options = fontStyleOptions.map(option => (
            <option key={option} value={option}>{option}</option>
        ));
        const onlyOneOption = (options.length === 1);
        return (
            <select
                value={currentFontStyle}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.stopPropagation()}
                className={ClassNames({'no-triangle': onlyOneOption})}
                disabled={onlyOneOption}
                style={{
                    lineHeight: '1.5em'
                }}
            >
                {options}
            </select>
        );
    };

    return FontStyle;
});
