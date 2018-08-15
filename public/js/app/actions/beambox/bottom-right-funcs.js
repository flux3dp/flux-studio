define([
    'helpers/device-master',
    'helpers/i18n',
    'app/actions/beambox/beambox-preference',
    'app/actions/film-cutter/aes-cipher',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'app/actions/beambox/font-funcs',
    'helpers/api/svg-laser-parser',
    'app/actions/alert-actions',
    'app/actions/global-actions',
], function (
    DeviceMaster,
    i18n,
    BeamboxPreference,
    AESCipher,
    ProgressActions,
    ProgressConstants,
    FontFuncs,
    svgLaserParser,
    AlertActions,
    GlobalActions
) {
    const lang = i18n.lang;
    const svgeditorParser = svgLaserParser({ type: 'svgeditor' });

    const fetchThumbnail = async () => {
        function cloneAndModifySvg($svg) {
            const $clonedSvg = $svg.clone(false);

            $clonedSvg.find('text').remove();
            $clonedSvg.find('#selectorParentGroup').remove();
            $clonedSvg.find('#canvasBackground image#background_image').remove();
            $clonedSvg.find('#canvasBackground #previewBoundary').remove();
            $clonedSvg.find('#canvasBackground #guidesLines').remove();

            return $clonedSvg;
        }

        async function DOM2Image($svg){
            return await new Promise((resolve)=>{
                const img  = new Image();
                img.onload = () => resolve(img);

                const $modifiedSvg = cloneAndModifySvg($svg);
                const svgString = new XMLSerializer().serializeToString($modifiedSvg.get(0));
                img.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgString);
            });
        }

        function cropAndDrawOnCanvas(img) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            //cropping
            const ratio = img.width / $('#svgroot').width();
            const W = ratio * $('#svgroot').width();
            const H = ratio * $('#svgroot').height();
            const w = ratio * $('#canvasBackground').attr('width');
            const h = ratio * $('#canvasBackground').attr('height');
            const x = - (W - w) / 2;
            const y = - (H - h) / 2;

            canvas.width = w;
            canvas.height = h;

            ctx.drawImage(img, x, y, img.width, img.height);
            return canvas;
        }

        const $svg = cloneAndModifySvg($('#svgroot'));
        const img = await DOM2Image($svg);
        const canvas = cropAndDrawOnCanvas(img);

        return await new Promise((resolve)=>{
            canvas.toBlob(function (blob) {
                resolve([canvas.toDataURL(), URL.createObjectURL(blob)]);
            });
        });
    };

    //return {uploadFile, thumbnailBlobURL}
    const prepareFileWrappedFromSvgStringAndThumbnail = async () => {
        const [thumbnail, thumbnailBlobURL] = await fetchThumbnail();
        const svgString = svgCanvas.getSvgString();

        const blob = new Blob([thumbnail, svgString], { type: 'application/octet-stream' });
        const reader = new FileReader();
        const uploadFile = await new Promise((resolve) => {
            reader.onload = function () {
                //not sure whether all para is needed
                const file = {
                    data: reader.result,
                    name: 'svgeditor.svg',
                    uploadName: thumbnailBlobURL.split('/').pop(),
                    extension: 'svg',
                    type: 'application/octet-stream',
                    size: blob.size,
                    thumbnailSize: thumbnail.length,
                    index: 0,
                    totalFiles: 1
                };
                resolve(file);
            };
            reader.readAsArrayBuffer(blob);
        });

        return {
            uploadFile: uploadFile,
            thumbnailBlobURL: thumbnailBlobURL
        };
    };

    const fetchFcode = async () => {
        ProgressActions.open(ProgressConstants.WAITING, lang.beambox.bottom_right_panel.convert_text_to_path_before_export);
        await FontFuncs.convertTextToPathAmoungSvgcontent();
        ProgressActions.close();
        const { uploadFile, thumbnailBlobURL } = await prepareFileWrappedFromSvgStringAndThumbnail();
        await svgeditorParser.uploadToSvgeditorAPI([uploadFile], {
            model: BeamboxPreference.read('model'),
            engraveDpi: BeamboxPreference.read('engrave_dpi'),
            containPhoneFilm: document.querySelector('[data-phone-film="true"]') ? true : false
        });
        const fcodeBlob = await new Promise((resolve) => {
            const names = []; //don't know what this is for
            svgeditorParser.getTaskCode(
                names,
                {
                    onProgressing: (data) => {
                        ProgressActions.open(ProgressConstants.STEPPING);
                        ProgressActions.updating(data.message, data.percentage * 100);
                    },
                    onFinished: function (blob, fileName, fileTimeCost) {
                        GlobalActions.sliceComplete({ time: fileTimeCost });
                        ProgressActions.updating(lang.message.uploading_fcode, 100);
                        resolve(blob);
                    },
                    fileMode: '-f',
                    model: BeamboxPreference.read('model')
                }
            );
        });
        return {
            fcodeBlob: fcodeBlob,
            thumbnailBlobURL: thumbnailBlobURL
        };
    };


    return {
        uploadFcode: async function (device) {
            const { fcodeBlob, thumbnailBlobURL } = await fetchFcode();
            const encryptedBlob = await AESCipher.encryptBlob(fcodeBlob);
            await DeviceMaster.select(device)
                .done(() => {
                    GlobalActions.showMonitor(device, encryptedBlob, thumbnailBlobURL, 'LASER');
                })
                .fail((errMsg) => {
                    AlertActions.showPopupError('menu-item', errMsg);
                });

            ProgressActions.close();
        },

        exportFcode: async function () {
            const { fcodeBlob } = await fetchFcode();
            const defaultFCodeName = svgCanvas.getLatestImportFileName() || 'untitled';
            ProgressActions.close();
            saveAs(fcodeBlob,  defaultFCodeName + '.fc');
        },
    };
});
