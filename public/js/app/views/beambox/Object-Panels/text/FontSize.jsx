define([
    'react',
    'jsx!widgets/Unit-Input-v2',
], function(React, UnitInput) {

    const FontSize = ({currentFontSize, onChange}) => {
        return (
            <UnitInput
                min={1}
                unit='px'
                defaultValue={currentFontSize}
                getValue={onChange}
            />
        );
    };

    return FontSize;
});
