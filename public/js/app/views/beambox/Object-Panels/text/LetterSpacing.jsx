define([
    'react',
    'jsx!widgets/Unit-Input-v2',
], function(React, UnitInput) {

    const LetterSpacing = ({currentLetterSpacing, onChange}) => {
        return (
            <UnitInput
                unit='em'
                step={0.05}
                defaultValue={currentLetterSpacing}
                getValue={onChange}
            />
        );
    };

    return LetterSpacing;
});
