define([], function(){
    return {
        'should_remind_calibrate_camera': true,
        'mouse_input_device': (process.platform === 'darwin')?'TOUCHPAD':'MOUSE'
    };
});