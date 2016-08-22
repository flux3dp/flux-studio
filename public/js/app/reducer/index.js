define([
    'Redux',
    './monitor',
    './device'
], (
    Redux,
    Monitor,
    Device
) => {
    const { combineReducers } = Redux;

    return combineReducers({
        Monitor,
        Device
    });
});
