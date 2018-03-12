define([
    'react',
    'jsx!widgets/Unit-Input-v2',
], function(React, UnitInput) {

    const LetterSpacing = ({currentLetterSpacing, onChange}) => {
        return (
            <UnitInput
                min={1}
                unit='px'
                defaultValue={currentLetterSpacing}
                getValue={onChange}
            />
        );
    };

    return LetterSpacing;
});
