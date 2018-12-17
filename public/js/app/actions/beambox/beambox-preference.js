define([
    'helpers/api/config',
], function(Config) {

    const DEFAULT_PREFERENCE = {
        'should_remind_calibrate_camera': true,
        'mouse_input_device': (process.platform === 'darwin') ? 'TOUCHPAD' : 'MOUSE',
        'model': 'fbb1b',
        'show_guides': false,
        'guide_x0': 0,
        'guide_y0': 0,
        'engrave_dpi': 'medium' // low, medium, high
    };

    const config = Config();

    class BeamboxPreference {
        constructor() {
            // set default preference if key or even beambox-preference doesn't exist
            let pref = config.read('beambox-preference');
            pref = pref === '' ? {} : pref;
            const fullPref = Object.assign(DEFAULT_PREFERENCE, pref);
            config.write('beambox-preference', fullPref);
        }

        read(key) {
            return config.read('beambox-preference')[key];
        }

        write(key, value) {
            const pref = config.read('beambox-preference');
            pref[key] = value;
            config.write('beambox-preference', pref);
        }
    }

    const instance = new BeamboxPreference();
    return instance;
});
