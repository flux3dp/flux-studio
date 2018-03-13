define([
    'react'
], function(React) {

    const FontStyle = ({currentFontStyle, fontStyleOptions, onChange}) => {
        const options = fontStyleOptions.map(option => (
            <option key={option} value={option}>{option}</option>
        ));
        return (
            <select
                value={currentFontStyle}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.stopPropagation()}
                style={{
                    lineHeight: '1em'
                }}
            >
                {options}
            </select>
        );
    };

    return FontStyle;
});
