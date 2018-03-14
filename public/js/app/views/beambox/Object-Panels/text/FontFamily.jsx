define([
    'react',
], function(React) {

    const FontFamily = ({currentFontFamily, fontFamilyOptions, onChange}) => {
        console.log('currentFontFamily: ', currentFontFamily);
        const options = fontFamilyOptions.map(
            option => (
                <option value={option} key={option}>
                    {option}
                </option>
            )
        );
        return (
            <select
                value={currentFontFamily}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.stopPropagation()}
                style={{
                    lineHeight: '1.5em'
                }}
            >
                {options}
            </select>
        );
    };

    return FontFamily;
});
