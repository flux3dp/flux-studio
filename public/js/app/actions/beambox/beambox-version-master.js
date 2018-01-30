define([
], function() {

    class BeamboxVersionMaster {
        async isUnusableVersion(device) {
            const unUsableVersions = await this.getUnusableVersion().catch(()=>{
                console.log('cannot request unusable beambox firmware from flux3dp.com');
                return Promise.resolve([]);
            });
            console.log('unUsableVersions: ', unUsableVersions);
            return unUsableVersions.includes(device.version);
        }

        async getUnusableVersion() {
            if (!navigator.onLine) {
                console.log('fail to get network');
                return [];
            }

            const request_data = {
                feature: 'check_update',
                key: 'unusable-beambox-firmware-version'
            };

            return await $.ajax({
                url: 'https://flux3dp.com/api_entry/',
                data: request_data
            });
        };
    }

    return new BeamboxVersionMaster();
});
