define([], function(){
    return {
        'should_remind_calibrate_camera': true,
        'should_remind_power_too_high_countdown': 3,
        'mouse_input_device': (process.platform === 'darwin')?'TOUCHPAD':'MOUSE',
        'model': 'fbb1b'
    };
});
