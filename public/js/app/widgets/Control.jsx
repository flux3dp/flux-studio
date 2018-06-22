define([
    'react'
], function(
    React
) {
    return ({label, children, errorMessage}) => {
        const labelField = label ? <div className="label">{label}</div> : '';
        const errorField = errorMessage ? <div className="error">{errorMessage}</div> : '';
        return (
            <div className="controls">
                {labelField}
                <div className="control">{children}</div>
                {errorField}
            </div>
        );
    };
});
