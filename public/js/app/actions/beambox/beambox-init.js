define([
    'helpers/api/config',
    'app/actions/beambox/beambox-preference',
    'app/actions/beambox/constant',
    'app/actions/film-cutter/film-cutter-cloud',
    'app/actions/film-cutter/record-manager',
    'app/actions/film-cutter/helper-functions',
    'app/actions/alert-actions',
    'jsx!app/actions/beambox/Object-Panels-Controller',
    'jsx!app/actions/beambox/Laser-Panel-Controller'
], function (
    ConfigHelper,
    BeamboxPreference,
    Constant,
    FilmCutterCloud,
    RecordManager,
    HelperFunctions,
    AlertActions,
    ObjectPanelsController,
    LaserPanelController
) {
    const handleOnline = async () => {
        await FilmCutterCloud.login().then(
            () => HelperFunctions.toggleLoginMenu({signIn: false, myAccount: true, signOut: true}),
            () => HelperFunctions.toggleLoginMenu({signIn: true, myAccount: false, signOut: false})
        );
        await FilmCutterCloud.sync().catch(console.log);
        const {info} = await FilmCutterCloud.newFilmInfo();
        if (info.length) {
            AlertActions.showPopupInfo('init', `您有 ${info.length} 個新手機膜可供更新`);
        }
    };

    const handleOffline = () => {
        HelperFunctions.toggleLoginMenu({myAccount: true, signIn: false, signOut: false});
    };

    return {
        async init() {
            ObjectPanelsController.init('object-panels-placeholder');
            LaserPanelController.init('layer-laser-panel-placeholder');

            if (navigator.onLine) {
                await handleOnline();
            } else {
                handleOffline();
            }

            const lastConnectToCloud = RecordManager.read('last_connect_to_cloud');
            const maxOfflineDays = 3;
            const hoursRemain = Math.floor(24 * maxOfflineDays - (Date.now() - lastConnectToCloud)/1000/60/60);
            if (0 < hoursRemain && hoursRemain <= maxOfflineDays * 24 - 10) {
                AlertActions.showPopupInfo('init', `機器離線${maxOfflineDays}天後，將無法使用。請於${hoursRemain}小時內連網。`);
            } else if (hoursRemain <= 0) {
                AlertActions.showPopupInfo('init', `機器已離線${maxOfflineDays}天，請連網並登入帳號後，方可使用。`);
            }
        },
        displayGuides() {
            const guidesLines = (() => {
                const svgdoc = document.getElementById('svgcanvas').ownerDocument;
                const NS = svgedit.NS;
                const linesGroup = svgdoc.createElementNS(NS.SVG, 'svg');
                const lineVertical = svgdoc.createElementNS(NS.SVG, 'line');
                const lineHorizontal = svgdoc.createElementNS(NS.SVG, 'line');

                svgedit.utilities.assignAttributes(linesGroup, {
                    'id': 'guidesLines',
                    'width': '100%',
                    'height': '100%',
                    'x': 0,
                    'y': 0,
                    'viewBox': `0 0 ${Constant.dimension.width} ${Constant.dimension.height}`,
                    'style': 'pointer-events: none'
                });

                svgedit.utilities.assignAttributes(lineHorizontal, {
                    'id': 'horizontal_guide',
                    'x1': 0,
                    'x2': Constant.dimension.width,
                    'y1': BeamboxPreference.read('guide_y0') * 10,
                    'y2': BeamboxPreference.read('guide_y0') * 10,
                    'stroke': '#000',
                    'stroke-width': '2',
                    'stroke-opacity': 0.8,
                    'stroke-dasharray': '5, 5',
                    'vector-effect': 'non-scaling-stroke',
                    fill: 'none',
                    style: 'pointer-events:none'
                });

                svgedit.utilities.assignAttributes(lineVertical, {
                    'id': 'vertical_guide',
                    'x1': BeamboxPreference.read('guide_x0') * 10,
                    'x2': BeamboxPreference.read('guide_x0') * 10,
                    'y1': 0,
                    'y2': Constant.dimension.height,
                    'stroke': '#000',
                    'stroke-width': '2',
                    'stroke-opacity': 0.8,
                    'stroke-dasharray': '5, 5',
                    'vector-effect': 'non-scaling-stroke',
                    fill: 'none',
                    style: 'pointer-events:none'
                });

                linesGroup.appendChild(lineHorizontal);
                linesGroup.appendChild(lineVertical);
                return linesGroup;
            })();

            $('#canvasBackground').get(0).appendChild(guidesLines);
        },
    };
});
