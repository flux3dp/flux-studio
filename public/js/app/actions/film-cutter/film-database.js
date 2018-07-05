define([
    'app/actions/film-cutter/record-manager',
    'app/actions/film-cutter/film-cutter-cloud',
    'lib/untar',
    'app/actions/film-cutter/aes-cipher',
], function(
    RecordManager,
    FilmCutterCloud,
    Untar,
    AESCipher
) {

    const ipc = electron.ipc;
    const events = electron.events;

    const readBlobAsArrayBuffer = (blob) => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(blob);
    });

    const chunkArray = (array, chunkSize) => {
        return array.reduce((all,one,i) => {
            const ch = Math.floor(i/chunkSize);
            all[ch] = [].concat((all[ch]||[]),one);
            return all;
        }, []);
    };

    class FilmDatabase {
        set(path, data) {
            ipc.sendSync(events.FILE_WRITE, {
                filePath: `${path}`,
                data: data
            });
        }
        get(type, brand, model, category) {
            const enc = ipc.sendSync(events.FILE_READ, {
                filePath: `${type}/${brand}/${model}/${category}.enc`,
            });
            const svg = AESCipher.decryptUint8Array(new Uint8Array(enc.data));
            return svg;
        }
        ls(type, brand, model) {
            const dirPath = [type, brand, model].filter(x => !!x).join('/');
            return ipc.sendSync(events.FILE_LS, { dirPath });
        }
        reset() {
            ipc.sendSync(events.FILE_RESET);
            RecordManager.write('last_sync_film_data', 0);
        }
        async syncWithCloud() {
            const last_sync_film_data = RecordManager.read('last_sync_film_data');
            const {info, synchronize_time} = await FilmCutterCloud.newFilmInfo(last_sync_film_data);

            const flatIds = info.map(x => x.id);
            const chunkSize = 30;
            // split ids into chunk, will not receive all data once. need to request multiple times
            await Promise.all(
                chunkArray(flatIds, chunkSize).map(async ids => {
                    const blob = await FilmCutterCloud.newFilm(ids, synchronize_time);
                    const arrayBuffer = await readBlobAsArrayBuffer(blob);
                    const extractedFiles = await Untar(arrayBuffer);
                    await Promise.all(
                        extractedFiles.map(async file => {
                            const name = decodeURIComponent(escape(file.name)).replace('film_files/', '');
                            const content = await readBlobAsArrayBuffer(file.blob);
                            this.set(name, Buffer.from(content));
                        })
                    );
                })
            );

            RecordManager.write('last_sync_film_data', synchronize_time);
        }
        validateUsageDownload() {
            const expiry_time = RecordManager.read('usage_download');
            return (Date.now() > expiry_time );
        }
    };
    if (!window.electron) {
        return {
            get: () => {},
            set: () => {},
            ls: () => {},
            reset: () => {},
            syncWithCloud: () => {}
        };
    }
    return new FilmDatabase();
});