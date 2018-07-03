define([
    'react',
], function(
    React
) {
    return ({currentIsFill, onChange}) => {
        return (
            <label className='shading-checkbox' onClick={() => onChange(!currentIsFill)}>
                <i className={currentIsFill ? 'fa fa-toggle-on' : 'fa fa-toggle-off'} />
            </label>
        );
    };
});
