define([
    'app/actions/film-cutter/record-manager',
    'app/actions/film-cutter/film-cutter-cloud',
    'app/actions/film-cutter/film-cutter-manager',
    'app/actions/film-cutter/aes-cipher',
    'helpers/device-master',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'lib/untar',
], function(
    RecordManager,
    FilmCutterCloud,
    FilmCutterManager,
    AESCipher,
    DeviceMaster,
    AlertActions,
    ProgressActions,
    ProgressConstants,
    Untar
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
            const {info, synchronize_time} = await FilmCutterCloud.newFilmInfo();

            const allIds = info.map(x => x.id);
            const chunkSize = 30;
            // split ids into chunk, will not receive all data once. need to request multiple times
            const works = chunkArray(allIds, chunkSize).map(ids =>
                async () => {
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
                }
            );
            // do works
            for (const work of works) {
                await work();
            }

            RecordManager.write('last_sync_film_data', synchronize_time);
        }

        async syncWithMachine() {

            // get files to be uploaded
            const last_sync = await FilmCutterManager.getLastSyncFilmFcodes();
            const allPaths = ipc.sendSync(events.FILE_LS_FCODE_MTIME_GT, {
                modified_after: last_sync
            });
            if (allPaths.length === 0) {
                AlertActions.showPopupInfo('film-database', '機器上的手機膜檔案已是最新版');
                await FilmCutterManager.setLastSyncFilmFcodes(Date.now());
                return;
            }


            const chunkSize = 1;

            ProgressActions.open(ProgressConstants.STEPPING);
            // seperate works
            const pathsArray = chunkArray(allPaths, chunkSize);
            const works = pathsArray.map((paths, index) =>
                async () => {
                    const buffer = ipc.sendSync(events.FILE_PACK_FCODE, {paths});
                    const blob = new Blob([new Uint8Array(buffer.data)]);
                    await DeviceMaster.uploadFilmFcodeCollection(blob)
                        .progress(data => {
                            const percentage = (data.step / data.total + index) / pathsArray.length;
                            ProgressActions.updating('傳送資料中', percentage * 100);
                        });
                }
            );

            // do works
            for (const work of works) {
                await work();
            }
            ProgressActions.updating('寫入機器資訊', 100);
            await FilmCutterManager.setLastSyncFilmFcodes(Date.now());
            ProgressActions.close();
        }

        validateUsageDownload() {
            const expiry_time = RecordManager.read('usage_download');
            return (expiry_time > Date.now());
        }
    };
    if (!window.electron) {
        return {
            get: () => {},
            set: () => {},
            ls: () => {},
            reset: () => {},
            syncWithCloud: () => {},
            validateUsageDownload: () => {},

        };
    }
    return new FilmDatabase();
});
