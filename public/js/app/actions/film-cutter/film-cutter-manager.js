define([
    'helpers/device-master',
    'app/actions/film-cutter/record-manager',
], function(
    DeviceMaster,
    RecordManager
) {
    const MachineCommunicator = {
        READ_WRTIE_KEYS: [
            'film_secret_key',
            'usage_cut_recorded',
            'usage_cut_unrecorded',
            'usage_cut_max_on_machine',
            'last_sync_film_fcodes',
        ],
        READ_ONLY_KEYS: [
            'stm32_serial_number',
            'pi_serial_number',
        ],
        WRITE_ONLY_KEYS: [],
        async get(key) {
            if (!this.READ_WRTIE_KEYS.concat(this.READ_ONLY_KEYS).includes(key)) {
                throw new Error('invalid key to get');
            }
            return (await DeviceMaster.pipeTask(`get ${key}`)).value;
        },
        async set(key, val) {
            if (!this.READ_WRTIE_KEYS.concat(this.WRITE_ONLY_KEYS).includes(key)) {
                throw new Error('invalid key to set');
            }
            return await DeviceMaster.pipeTask(`set ${key} ${val}`);
        }
    };

    class FilmCutterManager {
        async getSTM32SerialNumber() {
            return await MachineCommunicator.get('stm32_serial_number');
        }

        async getPiSerialNumber() {
            return await MachineCommunicator.get('pi_serial_number');
        }

        async getLastSyncFilmFcodes() {
            return await MachineCommunicator.get('last_sync_film_fcodes');
        }
        async setLastSyncFilmFcodes(timestamp) {
            return await MachineCommunicator.set('last_sync_film_fcodes', timestamp);
        }

        async validateMachineOwnership() {
            const stm32_local = RecordManager.read('machine_stm32_serial_number');
            const pi_local = RecordManager.read('machine_pi_serial_number');
            const stm32_remote = await MachineCommunicator.get('stm32_serial_number');
            const pi_remote = await MachineCommunicator.get('pi_serial_number');
            return (stm32_local === stm32_remote && pi_local === pi_remote);
        }

        async syncWithMachine() {
            await this._syncUsageCut();
            await this._syncFilmSecretKey();
        }

        async _syncFilmSecretKey() {
            const key = RecordManager.read('film_secret_key');
            await MachineCommunicator.set('film_secret_key', key);
        }

        async _syncUsageCut() {
            await this._loadUsageCutFromMachineIfSoftwareJustInstall();
            const recorded = RecordManager.read('usage_cut_recorded');
            const unrecorded = await MachineCommunicator.get('usage_cut_unrecorded');

            const new_record = recorded + unrecorded;
            RecordManager.write('usage_cut_recorded', new_record);

            await MachineCommunicator.set('usage_cut_unrecorded', 0);
            await MachineCommunicator.set('usage_cut_recorded', new_record);

            const USAGE_CUT_MAX_ON_MACHINE = 30;
            const remain = RecordManager.read('usage_cut_overall_on_cloud') - RecordManager.read('usage_cut_recorded') - RecordManager.read('usage_cut_used_on_cloud');
            await MachineCommunicator.set('usage_cut_max_on_machine', Math.min(USAGE_CUT_MAX_ON_MACHINE, remain));
        }

        async _loadUsageCutFromMachineIfSoftwareJustInstall() {
            if (RecordManager.read('should_init_usage_cut_from_machine') !== 'yes') {
                return;
            }
            const usageCutRecordedOnMachine = await MachineCommunicator.get('usage_cut_recorded');
            RecordManager.write('usage_cut_recorded', usageCutRecordedOnMachine);
            RecordManager.write('should_init_usage_cut_from_machine', 'no');
        }
    };

    return new FilmCutterManager();
});
