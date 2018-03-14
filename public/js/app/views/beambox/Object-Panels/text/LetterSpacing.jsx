define([
    'react',
    'jsx!widgets/Unit-Input-v2',
], function(React, UnitInput) {

    const LetterSpacing = ({currentLetterSpacing, onChange}) => {
        return (
            <UnitInput
                unit='px'
                defaultValue={currentLetterSpacing}
                getValue={onChange}
            />
        );
    };

    return LetterSpacing;
});
