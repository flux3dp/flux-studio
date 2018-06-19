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
    const readBlobAsText = (blob) => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsText(blob);
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
            const svg = AESCipher.decrypt(enc);
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
            const {info, synchronize_time} = await FilmCutterCloud
                .get('api/data/new-film-info', {last_sync_film_data})
                .then(res => res.json());

            const flatIds = info.map(x => x.id);
            const chunkSize = 30;
            // split ids into chunk, will not receive all data once. need to request multiple times
            await Promise.all(
                chunkArray(flatIds, chunkSize).map(async ids => {
                    const urlParaStr = ids.map(id => `id=${id}`)
                        .concat([`modified_before=${synchronize_time}`])
                        .join('&');

                    const blob = await FilmCutterCloud
                        .get(`api/data/new-film/?${urlParaStr}`)
                        .then(res => res.blob());

                    const arrayBuffer = await readBlobAsArrayBuffer(blob);

                    const extractedFiles = await Untar(arrayBuffer);

                    await Promise.all(
                        extractedFiles.map(async file => {
                            const name = decodeURIComponent(escape(file.name)).replace('film_files/', '');
                            const content = await readBlobAsText(file.blob);
                            this.set(name, content);
                        })
                    );
                })
            );

            RecordManager.write('last_sync_film_data', synchronize_time);
        }
    };
    if (!window.electron) {
        return {
            get: () => {},
            set: () => {},
            ls: () => {},
            reset: () => {}
        };
    }
    return new FilmDatabase();
});
