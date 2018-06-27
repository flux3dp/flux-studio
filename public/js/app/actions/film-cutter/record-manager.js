define([
    'helpers/api/config',
], function(Config) {

    const DEFAULT_RECORD = {
        // string
        'account': '+886952611152',
        'password': '123',
        'film_secret_key': 'd19d47bb5033126e3961084ccb6ed6d6',
        'machine_stm32_serial_number': '',
        'machine_pi_serial_number': '',
        'last_name': '',
        'first_name': '',
        'shop_name': '',
        'shop_address': '',
        'should_init_usage_cut_from_machine': 'yes',

        // int
        'usage_cut_recorded': 0,
        'usage_cut_overall_on_cloud': 0,
        'usage_cut_used_on_cloud': 0,

        // time in millisecond
        'usage_download': 1539129600000,
        'last_connect_to_cloud': 0,
        'last_sync_film_data': 0,
    };

    const config = Config();

    class RecordManager {
        constructor() {
            // set default preference if key or even film-cutter-record doesn't exist
            let pref = config.read('film-cutter-record');
            pref = pref === '' ? {} : pref;
            const fullPref = Object.assign(DEFAULT_RECORD, pref);
            config.write('film-cutter-record', fullPref);
        }

        read(key) {
            const val =  config.read('film-cutter-record')[key];
            switch (key) {
                // string
                case 'account':
                case 'password':
                case 'film_secret_key':
                case 'machine_stm32_serial_number':
                case 'machine_pi_serial_number':
                case 'last_name':
                case 'first_name':
                case 'shop_name':
                case 'shop_address':
                case 'should_init_usage_cut_from_machine':
                    return val;

                // int
                case 'usage_cut_recorded':
                case 'usage_cut_overall_on_cloud':
                case 'usage_cut_used_on_cloud':
                case 'usage_download':
                case 'last_connect_to_cloud':
                case 'last_sync_film_data':
                    return Number(val);

                default:
                    throw new Error('key invalid');
            }
        }

        write(key, value) {
            let val = '';
            switch (key) {
                // string
                case 'account':
                case 'password':
                case 'film_secret_key':
                case 'machine_stm32_serial_number':
                case 'machine_pi_serial_number':
                case 'last_name':
                case 'first_name':
                case 'shop_name':
                case 'shop_address':
                case 'should_init_usage_cut_from_machine':
                    val = value;
                    break;
                // int
                case 'usage_cut_recorded':
                case 'usage_cut_overall_on_cloud':
                case 'usage_cut_used_on_cloud':
                case 'usage_download':
                case 'last_connect_to_cloud':
                case 'last_sync_film_data':
                    val = Number(value);
                    break;
                default:
                    throw new Error('key invalid');
            }

            const pref = config.read('film-cutter-record');
            pref[key] = val;
            config.write('film-cutter-record', pref);
        }
    }

    const instance = new RecordManager();
    return instance;
});
