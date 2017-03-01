define([
    'jquery',
    'helpers/display',
    'helpers/websocket',
    'helpers/api/3d-print-slicing',
    'helpers/api/fcode-reader',
    'app/actions/alert-actions',
    'app/actions/progress-actions',
    'app/stores/progress-store',
    'app/constants/global-constants',
    'app/constants/device-constants',
    'app/constants/progress-constants',
    'app/constants/error-constants',
    'helpers/packer',
    'helpers/i18n',
    'helpers/api/config',
    'helpers/nwjs/menu-factory',
    'app/actions/global-actions',
    'helpers/sprintf',
    'helpers/packer',
    'Rx',
    'app/app-settings',
    'helpers/local-storage',
    'helpers/socket-master',
    // non-return value
    'threeOrbitControls',
    'threeTrackballControls',
    'threeTransformControls',
    'threeSTLLoader',
    'threeOBJLoader',
    'threeCircularGridHelper',
    'plugins/file-saver/file-saver.min',
    'lib/Canvas-To-Blob',
    'helpers/object-assign',
], function(
    $,
    display,
    websocket,
    printSlicing,
    fcodeReader,
    AlertActions,
    ProgressActions,
    ProgressStore,
    GlobalConstants,
    DeviceConstants,
    ProgressConstants,
    ErrorConstants,
    Packer,
    I18n,
    Config,
    MenuFactory,
    GlobalActions,
    Sprintf,
    packer,
    Rx,
    Settings,
    localStorage,
    SocketMaster
) {
    'use strict';

    let THREE = window.THREE || {},
        container, slicer, fcodeConsole;

    let camera, scene, outlineScene;
    let orbitControl, transformControl, reactSrc;

    let objects = [],
        referenceMeshes = [],
        fullSliceParameters = {settings: {}},
        lastSliceParams = '',
        enableAntiAlias = localStorage.get('antialiasing') === '1';

    let raycaster = new THREE.Raycaster(),
        mouse = new THREE.Vector2(),
        renderer = new THREE.WebGLRenderer({ antialias: enableAntiAlias });

    let circularGridHelper, mouseDown, SELECTED;

    let movingOffsetX, movingOffsetY, panningOffset, originalCameraPosition, originalCameraRotation,
        scaleBeforeTransformX, scaleBeforeTransformY, scaleBeforeTransformZ;

    let _id = 'PRINT.JS',
        responseBlob, printPath,
        previewScene,
        previewColors = [],
        previewUrl = '',
        blobExpired = false,
        transformMode = false,
        shiftPressed = false,
        previewMode = false,
        showStopButton = true,
        willReslice = false,
        importFromFCode = false,
        importFromGCode = false,
        needToShowMonitor = false,
        hasPreviewImage = false,
        ddHelper = 0,
        defaultFileName = '',
        cameraLight,
        slicingTimmer,
        slicingWaitTime = 3000,
        stlTimmer,
        changeRenderThrottle,
        transformAxisChanged = '',
        slicingReport = {},
        slicingStatus = {},
        importedFCode = {},
        importedScene = {},
        objectBeforeTransform = {},
        slicingStatusStream,
        sliceMaster,
        uploadProgress,
        fineSettings = {},
        history = [],
        lang = I18n.get();

    let s = {
        diameter: 170,
        radius: 85,
        height: 180,
        step: 10,
        upVector: new THREE.Vector3(0, 0, 1),
        color: Settings.print_config.color_base_plate,
        opacity: 0.7,
        text: true,
        textColor: '#FFFFFF',
        textPosition: 'center',
        colorOutside: Settings.print_config.color_border_out_side,
        colorSelected: Settings.print_config.color_border_selected,
        objectColor: Settings.print_config.color_object,
        degreeStep: 5,
        scalePrecision: 1,  // decimal places,
        allowedMin: 1       // (mm)
    };

    let commonMaterial = new THREE.MeshPhongMaterial({
        color: s.objectColor,
        specular: Settings.print_config.color_object,
        shininess: 1
    });

    let slicingType = {
        F: 'f',
        G: 'g'
    };

    let models = [];

    previewColors[0] = new THREE.Color(Settings.print_config.color_default);
    previewColors[1] = new THREE.Color(Settings.print_config.color_infill);
    previewColors[2] = new THREE.Color(Settings.print_config.color_perimeter);
    previewColors[3] = new THREE.Color(Settings.print_config.color_support);
    previewColors[4] = new THREE.Color(Settings.print_config.color_move);
    previewColors[5] = new THREE.Color(Settings.print_config.color_skirt);
    previewColors[6] = new THREE.Color(Settings.print_config.color_innerwall);
    previewColors[7] = new THREE.Color(Settings.print_config.color_raft);
    previewColors[8] = new THREE.Color(Settings.print_config.color_skin);
    previewColors[9] = new THREE.Color(Settings.print_config.color_highlight);


    let emphasizeLineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 5,
        vertexColors: THREE.VertexColors
    });

    function init(src) {

        reactSrc = src;
        container = document.getElementById('model-displayer');

        let width = container.offsetWidth, height = container.offsetHeight;

        if (Config().read('camera-projection') === 'Orthographic') {
            camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
            camera.position.set(0, -200, 100);
            camera.zoom = 4;
            camera.updateProjectionMatrix();
        } else {
            camera = new THREE.PerspectiveCamera(60, width/height, 1, 30000);
            camera.position.set(0, -200, 100);
        }
        camera.up = new THREE.Vector3(0, 0, 1);

        scene = new THREE.Scene();
        outlineScene = new THREE.Scene();

        // circular grid helper
        circularGridHelper = new CircularGridHelper(
            s.diameter,
            s.step,
            s.upVector,
            s.color,
            s.opacity,
            s.text,
            s.textColor,
            s.textPosition
        );
        circularGridHelper.name = 'circularGridHelper';
        scene.add(circularGridHelper);
        previewScene = scene.clone();

        let geometry = new THREE.PlaneBufferGeometry( 250, 250, 0, 0 ),
            material = new THREE.MeshBasicMaterial({
                color: 0xE0E0E0,
                wireframe: true
            }),
            refMesh = new THREE.Mesh(geometry, material);

        material.depthWrite = false;

        refMesh.up = new THREE.Vector3(0, 0, 1);
        refMesh.visible = true;
        refMesh.name = 'reference';
        scene.add(refMesh);
        referenceMeshes.push(refMesh);

        // Lights
        scene.add(new THREE.AmbientLight(0x777777));

        _addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        _addShadowedLight(0.5, 1, -1, 0xffffff, 1);
        _addShadowedLight(-1, -1, -1, 0xffffff, 1.35);
        _addShadowedLight(-0.5, -1, 1, 0xffffff, 1);

        cameraLight = new THREE.PointLight( 0xFFFFFF, 0.8, 300 );
        cameraLight.position.set(0,0,0);
        scene.cameraLight = cameraLight;
        scene.add(cameraLight);

        // renderer
        renderer.autoClear = false;
        renderer.setClearColor(0xE0E0E0, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);

        orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControl.maxPolarAngle = Math.PI / 4 * 3;
        orbitControl.maxDistance = 1000;
        orbitControl.enableKeys = false;
        orbitControl.addEventListener('change', updateOrbitControl);

        transformControl = new THREE.TransformControls(camera, renderer.domElement);
        transformControl.addEventListener('change', onTransformChange);
        transformControl.addEventListener('mouseDown', onObjectTransform);
        transformControl.addEventListener('mouseUp', onObjectTransform);
        transformControl.addEventListener('objectChange', onObjectTransform);

        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('keydown', onKeyPress, false);
        window.addEventListener('keyup', onKeyPress, false);
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onMouseUp, false);

        renderer.setSize(container.offsetWidth, container.offsetHeight);

        originalCameraPosition = camera.position.clone();
        originalCameraRotation = camera.rotation.clone();

        panningOffset = new THREE.Vector3();

        render();
        setImportWindowPosition();

        // init print controller
        slicingStatusStream = new Rx.Subject();
        slicingStatus.inProgress = false;
        slicingStatusStream.onNext(slicingStatus);

        if(!sliceMaster) {
            sliceMaster = new SocketMaster();
            sliceMaster.setWebSocket(printSlicing());
        }

        registerDragToImport();
        reactSrc.setState({
            camera: camera,
            updateCamera: true
        });
    }

    function uploadStl(name, file, ext) {
        // pass to slicer
        let d = $.Deferred();
        let uploadCaller = file.path ?
            sliceMaster.addTask('upload_via_path', name, file, ext, file.path)
            :
            sliceMaster.addTask('upload', name, file, ext);

        uploadCaller.then((result) => {
            ProgressActions.updating(lang.print.finishingUp, 100);
            d.resolve(result);
        }).progress(
            displayProgress
        ).fail((error) => {
            d.reject(error);
        });
        return d.promise();
    }

    function appendModel(binary, file, ext, callback) {
        if(binary.byteLength === 0) {
            ProgressActions.close();
            AlertActions.showPopupError('', lang.message.empty_file);
            return;
        }
        let stlLoader = new THREE.STLLoader(),
            objLoader = new THREE.OBJLoader();

        callback = callback || function() {};

        let loadGeometry = (geometry) => {
            if(geometry.vertices) {
                if(geometry.vertices.length === 0) {
                    ProgressActions.close();
                    reactSrc.setState({
                        openImportWindow: true,
                        openObjectDialogue: false
                    });
                    AlertActions.showPopupError('', lang.message.invalidFile);
                    return;
                }
            }
            let mesh = new THREE.Mesh(geometry, commonMaterial);
            mesh.up = new THREE.Vector3(0, 0, 1);

            setTimeout(() => {
                console.log('New Mesh:: Py Processing meshes');
                ProgressActions.updating('Processing meshes', 50);
            }, 1);

            uploadStl(mesh.uuid, file, ext).then(() => {
                addToScene();
                callback();
            }).progress((steps, total) => {
                console.log(steps, total);
            }).fail((error) => {
                reactSrc.setState({
                    openImportWindow: true,
                    openObjectDialogue: false
                }, () => {
                    ProgressActions.close();
                });
                processSlicerError(error);
                return;
            });

            const addToScene = () => {
                geometry.center();

                // normalize - resize, align
                let box = new THREE.Box3().setFromObject(mesh),
                    enlarge = parseInt(box.getSize().x) !== 0 && parseInt(box.getSize().y) !== 0 && parseInt(box.getSize().z) !== 0,
                    scale = 1;

                mesh.scale.set(scale, scale, scale);
                mesh.scale._x = scale;
                mesh.scale._y = scale;
                mesh.scale._z = scale;

                mesh.rotation.order = 'ZYX';

                /* customized properties */
                mesh.scale.enteredX = 1;
                mesh.scale.enteredY = 1;
                mesh.scale.enteredZ = 1;
                mesh.scale.locked = true;
                mesh.rotation.enteredX = 0;
                mesh.rotation.enteredY = 0;
                mesh.rotation.enteredZ = 0;
                mesh.position.isOutOfBounds = false;
                mesh.scale.locked = true;
                /* end customized property */

                mesh.name = 'custom';
                mesh.file = file;
                mesh.fileName = file.name;
                setTimeout(() => {
                    console.log('New Mesh:: Calculating boundary');
                    ProgressActions.updating('Calculating boundary', 50);
                }, 1);

                mesh.plane_boundary = planeBoundary(mesh);

                setTimeout(() => {
                    ProgressActions.updating('Arranging position', 80);
                }, 1);

                autoArrange(mesh);
                addSizeProperty(mesh);

                setTimeout(() => {
                    console.log('New Mesh:: Grounding');
                    ProgressActions.updating('Grouding', 85);
                }, 1);

                groundIt(mesh);
                selectObject(mesh);

                setTimeout(() => {
                    ProgressActions.updating('Creating outline', 90);
                }, 1);

                createOutline(mesh);

                setTimeout(() => {
                    ProgressActions.updating('Adding to scene', 95);
                }, 1);

                scene.add(mesh);
                outlineScene.add(mesh.outlineMesh);
                objects.push(mesh);
                reactSrc.setState({
                    hasObject: true
                });
                addHistory('ADD', mesh);

                setDefaultFileName();
                setTimeout(() => {
                    ProgressActions.close();
                }, 1);

                render();
            };
        };

        reactSrc.setState({
            openImportWindow: false
        });

        if(ext === 'obj') {
            objLoader.load(binary, (object) => {
                let meshes = object.children.filter(c => c instanceof THREE.Mesh);
                if(meshes.length > 0) {
                    loadGeometry(new THREE.Geometry().fromBufferGeometry(meshes[0].geometry));
                }
                // loadGeometry(new THREE.Geometry().fromBufferGeometry(.geometry))
            });
        }
        else {
            stlLoader.load(binary, (geometry) => {
                loadGeometry(geometry);
            }, function() { }, (error) => {
                throw error;
                // on error
                // loadGeometry({vertices: []});
            });
        }
    }

    function appendModels(files, index, callback) {
        ProgressActions.open(
            ProgressConstants.STEPPING,
            lang.print.importingModel,
            lang.print.wait,
            !showStopButton
        );

        let file = files.item ? files.item(index) : files[index];
        let ext = file.name.split('.').pop().toLowerCase();

        models.push(file);
        if(ext === 'stl' || ext === 'obj') {
            let fr = new FileReader();
            fr.addEventListener('load', (e) => {
                ProgressActions.updating('Loading as ' + ext, 10);
                appendModel(fr.result, file, ext, function(err) {
                    if(!err) {
                        if(files.length > index + 1) {
                            appendModels(files, index + 1, callback);
                        } else {
                            startSlicing(slicingType.F);
                            callback();
                        }
                    }
                });
            });
            ProgressActions.updating('Start Loading', 5);
            fr.readAsArrayBuffer(file);
        }
        else if (ext === 'fc' || ext === 'gcode') {
            slicingStatus.isComplete = true;
            importedFCode = files.item(0);
            importFromFCode = ext === 'fc';
            setDefaultFileName(importedFCode.name);
            if(objects.length === 0) {
                doFCodeImport(ext);
            }
            else {
                ProgressActions.close();
                AlertActions.showPopupYesNo(
                    GlobalConstants.IMPORT_FCODE,
                    lang.message.confirmFCodeImport, '', ext);
            }
            callback();
        }
        else if (ext === 'fsc') {
            importedScene = files.item(0);
            setDefaultFileName(importedScene.name);
            if(objects.length === 0) {
                _handleLoadScene(importedScene);
            }
            else {
                ProgressActions.close();
                AlertActions.showPopupYesNo(
                    GlobalConstants.IMPORT_SCENE,
                    lang.message.confirmSceneImport
                );
            }
            callback();
        }
        else {
            ProgressActions.close();
            AlertActions.showPopupError('', lang.monitor.extensionNotSupported);
            callback();
        }

    }

    function appendPreviewPath(file, callback, isGcode) {
        let metadata,
            reader = new FileReader();

        reader.addEventListener('load', function() {
            fcodeConsole.upload(reader.result, isGcode).then(() => {
                fcodeConsole.getMetadata().then((data) => {
                    processMetadata(data);
                });
            }).fail((response) => {
                // out of bound, can still preview
                if(response.error === ErrorConstants.GCODE_AREA_TOO_BIG) {
                    // disable go button
                    reactSrc.setState({ hasObject: false });
                    if(previewMode) {
                        fcodeConsole.getPath().then((r) => {
                            if(r.error) {
                                processSlicerError(r);
                            }
                            printPath = r;
                            processPath(r);
                            _drawPath().then(function() {
                                _resetPreviewLayerSlider();
                                ProgressActions.close();
                                slicingStatus.showProgress = false;
                            });
                        });
                    }

                    // notify gcode too big, only previewing
                    AlertActions.showPopupError('', lang.message.gcode_area_too_big);
                }
                else {
                    _closeWait();
                    AlertActions.showPopupError('fcode-error', lang.slicer.error[response.error] || response.info);
                    cancelPreview();
                }
            });
        });

        let processMetadata = function(m) {
            metadata = m;
            let fcodeType = m.metadata.HEAD_TYPE;
            if(fcodeType === 'EXTRUDER') {
                fcodeConsole.getPath().then((result) => {
                    if(result.error) {
                        processSlicerError(result);
                        return;
                    }
                    processPath(result);
                });
            }
            else {
                let message = fcodeType === 'LASER' ? lang.message.fcodeForLaser : lang.message.fcodeForPen;
                ProgressActions.close();
                importFromFCode = false;
                importFromGCode = false;
                previewMode = false;
                _exitImportFromFCodeMode();
                AlertActions.showPopupInfo('', message);
            }
        };

        let processPath = function(path) {
            previewMode = true;
            printPath = path;
            _drawPathFromFCode();
            _resetPreviewLayerSlider();

            // update the preview image
            getBlobFromScene().then((blob) => {
                if(blob instanceof Blob) {
                    previewUrl = URL.createObjectURL(blob);
                    fcodeConsole.changeImage(blob).then(() => {
                        blobExpired = false;
                        responseBlob = new Blob([reader.result]);
                        GlobalActions.sliceComplete(metadata);
                    }).fail((error) => {
                        // TODO: log error
                    });
                }
            });
        };

        reader.readAsArrayBuffer(file);
    }

    function startSlicing(type) {
        slicingStatus.inProgress    = true;
        slicingStatus.hasError      = false;
        slicingStatus.isComplete    = false;
        blobExpired                 = true;
        willReslice                 = false;

        // disable go buttons, only enable when slice complete
        reactSrc.setState({ disableGoButtons: true });

        slicingStatusStream.onNext(slicingStatus);

        if(objects.length === 0 || !blobExpired) { return; }

        let ids = objects.filter(v => !v.position.isOutOfBounds).map(v => v.uuid);

        if(previewMode) {
            _clearPath();
            _showPreview();
        }

        syncObjectParameter().then(() => {
            return stopSlicing();
        }).then(() => {
            // set again because stop slicing set inProgress to false
            slicingStatus.inProgress = true;
            slicingStatusStream.onNext(slicingStatus);

            sliceMaster.addTask('beginSlicing', ids, slicingType.F).then(() => {
                slicingStatus.percentage = 0.05;
                reactSrc.setState({slicingPercentage: 0.05});
                getSlicingReport(function(report) {
                    if (report.status !== 'ok') {
                        slicingStatus.lastReport = report;
                    }
                    updateSlicingProgressFromReport(slicingStatus.lastReport);
                });
            }).fail((error) => {
                processSlicerError(error);
                return;
            });
        });
    }

    function takeSnapShot() {
        let d = $.Deferred(),
            wasInPreviewMode = false;

        _checkNeedToShowProgress();
        if(importFromGCode || importFromFCode) {
            d.resolve();
            return d.promise();
        }

        if(previewMode) {
            togglePreview();
            wasInPreviewMode = true;
        }

        getBlobFromScene().then((blob) => {
            if(wasInPreviewMode) {
                togglePreview();
            }
            previewUrl = URL.createObjectURL(blob);

            let t = setInterval(() => {
                if(slicingStatus.isComplete) {
                    slicingStatus.showProgress = false;
                    clearInterval(t);
                    if(slicingStatus.hasError) {
                        return;
                    }
                    sliceMaster.addTask('uploadPreviewImage', blob).then(() => {
                        sliceMaster.addTask('getSlicingResult').then((result) => {
                            responseBlob = result;
                            d.resolve(blob);
                        }).fail((error) => {
                            processSlicerError(error);
                        });
                    }).fail((error) => {
                        processSlicerError(error);
                    });
                }
            }, 100);
        });
        return d.promise();
    }

    function doSlicing() {
        // Check if slicing is necessary
        fullSliceParameters.objs = {};
        objects.forEach((o) => {
            fullSliceParameters.objs[o.uuid] = [
                o.position.x,
                o.position.y,
                o.position.z,
                o.rotation.x,
                o.rotation.y,
                o.rotation.z,
                o.scale.x,
                o.scale.y,
                o.scale.z
            ];
        });

        let sliceParams = JSON.stringify(fullSliceParameters, (key, val) => {
            // Fix precision to .00001
            return val.toFixed ? Number(val.toFixed(5)) : val;
        });
        if (sliceParams === lastSliceParams) {
            console.log('Begin Slice:: Skipping redundant slicing');
            return;
        } else {
            console.log('Begin Slice:: Remove sliced results');
            lastSliceParams = sliceParams;
        }

        _clearPath();
        blobExpired = true;
        hasPreviewImage = false;
        willReslice = true;

        if(slicingStatus.inProgress) {
            clearTimeout(slicingTimmer);
            stopSlicing();
            startSlicing(slicingType.F);
        }
        else {
            startSlicing(slicingType.F);
        }
    }

    function updateSlicingProgressFromReport(report) {
        if(!report) { return; }
        slicingStatus.inProgress = true;
        slicingStatus.error = null;
        slicingStatusStream.onNext(slicingStatus);

        if (slicingStatus.needToCloseWait) {
            ProgressActions.close();
            slicingStatus.needToCloseWait = false;
        }

        let progress = `${lang.slicer[report.slice_status]} - ${'\n' + parseInt(report.percentage * 100)}% - ${report.message}`,
            complete = lang.print.finishingUp,
            show = slicingStatus.showProgress,
            monitorOn = $('.flux-monitor').length > 0;

        if (report.slice_status === 'complete') {
            report.percentage = 1;
            // enable go buttons
            reactSrc.setState({
                disableGoButtons: false,
                hasOutOfBoundsObject: false
            });
        }
        if (report.percentage !== slicingStatus.percentage) {
            slicingStatus.percentage = report.percentage;
            reactSrc.setState({slicingPercentage: slicingStatus.percentage});
        }
        console.log(report);
        slicingStatus.lastProgress = progress;

        if(monitorOn) {
            GlobalActions.closeMonitor();
            needToShowMonitor = true;
        }

        if(show) {
            ProgressActions.open(
                ProgressConstants.STEPPING,
                lang.print.rendering,
                lang.print.savingFilePreview,
                showStopButton
            );
        }

        if(report.slice_status === 'error') {
            clearInterval(slicingStatus.reporter);

            slicingStatus.lastReport.info = lang.slicer.error[report.error] || report.info;
            slicingStatus.lastReport.caption = lang.alert.error;
            slicingStatus.hasError = true;

            if(report.error === '6') {
                slicingStatus.error = report;
                if(previewMode) {
                    sliceMaster.addTask('getPath').then((result) => {
                        if(result.error) {
                            processSlicerError(result);
                        }
                        printPath = result;
                        _drawPath().then(function() {
                            _resetPreviewLayerSlider();
                            slicingStatus.showProgress = false;

                        });
                    });
                }

                ProgressActions.close();
                AlertActions.showPopupError('', report.info, report.caption);
                reactSrc.setState({
                    hasOutOfBoundsObject: true,
                    slicingPercentage: 0
                });
                slicingStatus.isComplete = true;
                blobExpired = false;
            }
            else {
                if(show || previewMode) {
                    setTimeout(() => {
                        ProgressActions.close();
                    }, 0);
                    if(previewMode) {
                        _closePreview();
                        togglePreview();
                    }
                }
                AlertActions.showPopupError('', slicingStatus.lastReport.info, slicingStatus.lastReport.caption);
                slicingStatus.lastProgress = '';
                reactSrc.setState({ hasOutOfBoundsObject: true });
            }
        }
        else if(report.slice_status === 'warning') {
            AlertActions.showWarning(report.message);
        }
        else if(report.slice_status !== 'complete') {
            if(show) {
                if(willReslice) {
                    ProgressActions.updating(lang.print.reRendering, 0);
                }
                if(report.percentage) {
                    setTimeout(() => {
                        ProgressActions.updating(progress, parseInt(report.percentage * 100));
                    }, 0);
                }
            }
        }
        else {
            GlobalActions.sliceComplete(report);
            if(show) { ProgressActions.updating(complete, 100); }
            sliceMaster.addTask('getSlicingResult').then((result) => {
                if(result.error) { return processSlicerError(result); }
                setTimeout(function() {
                    if(needToShowMonitor) {
                        reactSrc._handleDeviceSelected();
                        needToShowMonitor = false;
                    }
                }, 300);

                blobExpired = false;
                responseBlob = result;
                _handleSliceComplete();
            }).fail((error) => {
                console.log('Slicining Error:: ', error);
            });
        }
    }

    function willUnmount() {
        previewMode = false;
        importFromFCode = false;
        importFromGCode = false;
    }

    function registerDragToImport() {
        if(window.FileReader) {
            let zone = document.querySelector('.studio-container.print-studio');
            zone.addEventListener('dragenter', onDragEnter);
            zone.addEventListener('dragover', onDragEnter);
            zone.addEventListener('dragleave', onDragLeave);
            zone.addEventListener('drop', onDropFile);
        }
    }

    function unregisterDragToImport() {
        let zone = document.querySelector('.studio-container.print-studio');
        zone.removeEventListener('dragenter', onDragEnter);
        zone.removeEventListener('dragover', onDragEnter);
        zone.removeEventListener('dragleave', onDragLeave);
        zone.removeEventListener('drop', onDropFile);
    }

    function onDropFile(e) {
        e.preventDefault();
        $('.import-indicator').hide();
        if(previewMode) { return; }
        let files = e.dataTransfer.files;
        if(files.length > 0) {
            appendModels(files, 0, function() {
                e.target.value = null;
            });
        }
    }

    function onDragEnter(e) {
        e.preventDefault();
        if(previewMode) { return; }
        if(e.type === 'dragenter') {
            ddHelper++;
        }
        $('.import-indicator').show();

        return false;
    }

    function onDragLeave(e) {
        e.preventDefault();
        if(previewMode) { return; }
        ddHelper--;

        if(ddHelper === 0) {
            $('.import-indicator').hide();
        }

        return false;
    }

    // Events Section ---

    function onMouseDown(e) {
        e.preventDefault();
        if(previewMode) { return; }
        setMousePosition(e);
        mouseDown = true;

        if (previewMode) {
            return;
        }

        reactSrc.setState({
            isTransforming: true,
            updateCamera: false
        });

        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {

            let target = intersects[0].object;
            let location = getReferenceIntersectLocation(e);
            selectObject(target);

            orbitControl.enabled = false;
            mouseDown = true;
            container.style.cursor = 'move';

            movingOffsetX = location ? location.x - target.position.x : target.position.x;
            movingOffsetY = location ? location.y - target.position.y : target.position.y;

        }

        else {

            if (!transformMode) {
                selectObject(null);
                removeFromScene('TransformControl');
                transformControl.detach(SELECTED);
                transformMode = false;
                render();
            } else {
                if(SELECTED) {
                    scaleBeforeTransformX = SELECTED.scale.x;
                    scaleBeforeTransformY = SELECTED.scale.y;
                    scaleBeforeTransformZ = SELECTED.scale.z;
                }
            }
        }

        if(SELECTED.uuid) { addHistory(); }
    }

    function toggleTransformControl(hide) {
        if(!$.isEmptyObject(SELECTED)) {
            if(hide) {
                removeFromScene('TransformControl');
                SELECTED.outlineMesh.visible = false;
                render();
            }
            else {
                transformControl.attach(SELECTED);
                SELECTED.outlineMesh.visible = true;
                if(reactSrc.state.mode === 'rotate') {
                    setRotateMode();
                }
                else {
                    setScaleMode();
                }
            }
        }
    }

    function onMouseUp(e) {
        e.preventDefault();
        let o = {
            isTransforming: false,
            updateCamera: false
        };

        if(reactSrc.state.disablePreview) {
            o = Object.assign(o, { disablePreview: false });
        }

        reactSrc.setState(o);

        orbitControl.enabled = true;
        mouseDown = false;
        container.style.cursor = 'auto';
        transformAxisChanged = '';
        checkOutOfBounds(SELECTED).then(() => {
            // disable preview when object are all out of bound
            reactSrc.setState({ hasObject: !allOutOfBound()});
            if(blobExpired && objects.length > 0 && !allOutOfBound()) {
                slicingStatus.showProgress = false;
                doSlicing();
            }
        });
        render();
    }

    function onMouseMove(e) {
        e.preventDefault();
        setMousePosition(e);
        SELECTED = SELECTED || {};
        // if SELECTED and mouse down
        if (Object.keys(SELECTED).length > 0 && mouseDown) {
            if (!transformMode) {
                let location = getReferenceIntersectLocation(e);
                if (SELECTED.position && location) {
                    SELECTED.position.x = location.x - movingOffsetX;
                    SELECTED.position.y = location.y - movingOffsetY;
                    SELECTED.outlineMesh.position.x = location.x - movingOffsetX;
                    SELECTED.outlineMesh.position.y = location.y - movingOffsetY;
                    blobExpired = true;
                    hasPreviewImage = false;
                    slicingStatus.error = null;
                    setObjectDialoguePosition();
                    render();
                    return;
                }
            }
        }
    }

    function onWindowResize() {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        render();
        setImportWindowPosition();
    }

    function onKeyPress(e) {
        if (e.keyCode === 16) {
            shiftPressed = e.type === 'keydown';
        }
    }

    function onTransformChange() {
        clearTimeout(changeRenderThrottle);
        changeRenderThrottle = setTimeout(function() {
            render();
        }, 100);
    }

    function onObjectTransform(e) {
        if(previewMode || typeof SELECTED === 'undefined') { return; }
        switch (e.type) {
            case 'mouseDown':
                objectBeforeTransform = {};
                Object.assign(objectBeforeTransform, SELECTED);
                objectBeforeTransform.size = SELECTED.size.clone();
                objectBeforeTransform.scale = SELECTED.scale.clone();
                objectBeforeTransform.rotation = SELECTED.rotation.clone();
                transformMode = true;
                reactSrc.setState({
                    isTransforming: true
                });
                break;
            case 'mouseUp':
                transformMode = false;
                reactSrc.setState({
                    isTransforming: false
                });
                SELECTED.rotation.enteredX = updateDegreeWithStep(radianToDegree(SELECTED.rotation.x));
                SELECTED.rotation.enteredY = updateDegreeWithStep(radianToDegree(SELECTED.rotation.y));
                SELECTED.rotation.enteredZ = updateDegreeWithStep(radianToDegree(SELECTED.rotation.z));
                if(reactSrc.state.mode === 'scale') {
                    // check for inverse transform
                    if(SELECTED.size.x <= 0 || SELECTED.size.y <= 0 || SELECTED.size.z <= 0) {
                        setSize(objectBeforeTransform.size, false);
                        updateObjectSize(objectBeforeTransform);
                    }
                    else {
                        let s = e.target.object.size;
                        s.x = _round(s.x);
                        s.y = _round(s.y);
                        s.z = _round(s.z);
                        s.enteredX = _round(s.enteredX);
                        s.enteredY = _round(s.enteredY);
                        s.enteredZ = _round(s.enteredZ);
                        syncObjectOutline(e.target.object);

                        reactSrc.setState({
                            modelSelected: e.target.object
                        });
                    }
                }
                groundIt(SELECTED);
                break;
            case 'objectChange':
                if(reactSrc.state.mode === 'scale') {
                    updateObjectSize(e.target.object);
                }
                else {
                    updateObjectRotation(e.target.object);
                }
                break;
        }
    }

    // GET section ---

    // get ray intersect with reference mesh
    function getReferenceIntersectLocation(e) {
        e.preventDefault();
        let onClickPosition = new THREE.Vector2(),
            array = getMousePosition( container, e.clientX, e.clientY );

		onClickPosition.fromArray( array );
		let intersects = getIntersects( onClickPosition, scene.children.filter(o => o.name === 'reference') );
        if(intersects[0]) {
            return intersects[0].point;
        }

        return { x: 0, y: 0, z: 0};
    }

    // calculate the distance from reference mesh
    function getReferenceDistance(mesh) {
        if (mesh) {
            let ref = {},
                box = new THREE.Box3().setFromObject(mesh);

            ref.x = box.getCenter().x;
            ref.y = box.getCenter().y;
            ref.z = box.min.z;
            return ref;
        }
    }

    function getFCode() {
        let d = $.Deferred();

        if(importFromFCode) {
            d.resolve(responseBlob, previewUrl);
            return d.promise();
        }
        else if(importFromGCode) {
            fcodeConsole.getFCode().then((blob) => {
                d.resolve(blob, previewUrl);
            });
            return d.promise();
        }
        else if(objects.length === 0) {
            d.resolve('');
            return d.promise();
        }

        if(!blobExpired) {
            d.resolve(responseBlob, previewUrl);
            return d.promise();
        }

        let execute = () => {
            if(slicingStatus.inProgress) {
                _showWait(lang.print.gettingSlicingReport, !showStopButton);
                slicingStatus.showProgress = true;
                let subscriber = slicingStatusStream.subscribe((status) => {
                    if(status.isComplete) {
                        subscriber.dispose();
                        d.resolve(responseBlob, previewUrl);
                    }
                });
            }
            else {
                d.resolve(responseBlob, previewUrl);
            }
        };

        if(willReslice) {
            let t = setInterval(() => {
                if(slicingStatus.inProgress) {
                    clearInterval(t);
                    willReslice = false;
                    execute();
                }
            }, 500);
        }
        else {
            execute();
        }

        return d.promise();
    }

    function getSlicingReport(callback) {
        let reportTimmer = 1000; // 1 sec

        slicingStatus.reporter = setInterval(function() {
            if (!slicingStatus.pauseReport) {
                if(willReslice) {
                    return;
                }
                sliceMaster.addTask('reportSlicing').then((report) => {
                    if(!!report) {
                        if(report.slice_status === 'complete' || report.slice_status === 'error') {
                            clearInterval(slicingStatus.reporter);
                        }
                        callback(report);
                    }
                }).fail((error) => {
                    console.log('Slice report', error);
                });
            }
        }, reportTimmer);

    }

    function getModelCount() {
        return objects.length;
    }

    // SET section ---

    function resetObject() {
        if(SELECTED) {
            let s = SELECTED.scale;
            setScale(s._x, s._y, s._z, true, true);
            setRotation(0, 0, 0, true);
            groundIt(SELECTED);
            alignCenter();
            selectObject(null);
        }
    }

    function setMousePosition(e) {
        let offx = 0,
            offy = 0;

        mouse.x = ((e.offsetX - offx) / container.offsetWidth) * 2 - 1;
        mouse.y = -((e.offsetY - offy) / container.offsetHeight) * 2 + 1;
    }

    function setScale(x, y, z, isLocked, center, src) {
        src = src || SELECTED;
        let originalScaleX = src.scale._x;
        let originalScaleY = src.scale._y;
        let originalScaleZ = src.scale._z;
        if (x === '' || x <= 0) {
            x = scaleBeforeTransformX;
        }
        if (y === '' || y <= 0) {
            y = scaleBeforeTransformY;
        }
        if (z === '' || z <= 0) {
            z = scaleBeforeTransformZ;
        }
        src.scale.enteredX = x;
        src.scale.enteredY = y;
        src.scale.enteredZ = z;
        src.scale.set(
            (originalScaleX * x) || scaleBeforeTransformX, (originalScaleY * y) || scaleBeforeTransformY, (originalScaleZ * z) || scaleBeforeTransformZ
        );
        src.outlineMesh.scale.set(
            (originalScaleX * x) || scaleBeforeTransformX, (originalScaleY * y) || scaleBeforeTransformY, (originalScaleZ * z) || scaleBeforeTransformZ
        );
        src.scale.locked = isLocked;
        src.plane_boundary = planeBoundary(src);

        reactSrc.setState({
            modelSelected: src.uuid ? src : null
        });

        if (center) {
            // src.plane_boundary = planeBoundary(src);
            groundIt(src);
            checkOutOfBounds(src);
            render();
        }
    }

    function setSize(size, isLocked, src) {
        let o = { size: {} };
        Object.assign(o.size, size);

        src = src || SELECTED;
        let objectChanged = _objectChanged(src, o);
        if(objectChanged) {
            isLocked = isLocked || true;
            let sx = Math.round(size.x / src.size.originalX * 1000) / 1000,
                sy = Math.round(size.y / src.size.originalY * 1000) / 1000,
                sz = Math.round(size.z / src.size.originalZ * 1000) / 1000,
                _center = true;

            if(sx + sy + sz === 0) {
                return;
            }

            setScale(sx, sy, sz, isLocked, _center, src);

            src.size.x = size.x;
            src.size.y = size.y;
            src.size.z = size.z;

            slicingStatus.showProgress = false;

            doSlicing();
            syncObjectOutline(src);
            setObjectDialoguePosition(src);
        }
    }

    function setRotateMode() {
        setMode('rotate');
    }

    function setScaleMode() {
        setMode('scale');
    }

    function setMode(mode) {
        removeFromScene('TransformControl');
        transformControl.setMode(mode);
        reactSrc.setState({ mode: mode });
        scene.add(transformControl);
        render();
    }

    function setAdvanceParameter(settings) {
        let deferred = $.Deferred();

        sliceMaster.addTask('setParameter', 'advancedSettings', settings.custom).then(() => {
            Object.assign(fullSliceParameters.settings, settings);
            slicingStatus.showProgress = false;
            if(objects.length > 0) {
                doSlicing();
            }
            deferred.resolve('');
        }).fail((error) => {
            // Fallback to fine settings
            Object.assign(settings, fineSettings);
            processSlicerError(error);
            deferred.reject(new Error(error));
        });
        blobExpired = true;
        hasPreviewImage = false;

        return deferred.promise();
    }

    function setParameter(name, value) {
        let d = $.Deferred();
        blobExpired = true;
        hasPreviewImage = false;

        sliceMaster.addTask('setParameter', name, value).then(() => {
            fullSliceParameters.settings[name] = value;
            slicingStatus.showProgress = false;
            if(objects.length > 0) {
                doSlicing();
            }
            d.resolve('');
        }).fail((error) => {
            processSlicerError(error);
            d.resolve('');
        });

        return d.promise();
    }

    function setRotation(x, y, z, needRender, src) {
        src = src || SELECTED;
        syncObjectOutline(src);

        let _x = parseInt(x) || 0,
            _y = parseInt(y) || 0,
            _z = parseInt(z) || 0;
        src.rotation.enteredX = x;
        src.rotation.enteredY = y;
        src.rotation.enteredZ = z;
        src.rotation.x = degreeToRadian(_x);
        src.rotation.y = degreeToRadian(_y);
        src.rotation.z = degreeToRadian(_z);
        src.outlineMesh.rotation.x = degreeToRadian(_x);
        src.outlineMesh.rotation.y = degreeToRadian(_y);
        src.outlineMesh.rotation.z = degreeToRadian(_z);

        if (needRender) {
            reactSrc.setState({
                modelsrc: src.uuid ? src : null
            }, () => {
                doSlicing();
            });
            src.plane_boundary = planeBoundary(src);
            groundIt(src);
            checkOutOfBounds(src);
            render();
        }

        slicingStatus.showProgress = false;
    }

    function setImportWindowPosition() {
        if (document.getElementsByClassName('arrowBox').length > 0) {
            let position = toScreenPosition(referenceMeshes[0], camera),
                importWindow = document.getElementsByClassName('arrowBox')[0],
                importWindowWidth = parseInt($(importWindow).css('width').replace('px', '')),
                importWindowHeight = parseInt($(importWindow).css('height').replace('px', ''));

            $('.arrowBox').css({
                'top': position.y - importWindowHeight - 20,
                'left': position.x - importWindowWidth / 2
            });
        }
    }

    function setObjectDialoguePosition(obj) {
        let o = obj || SELECTED;

        if (!$.isEmptyObject(o)) {

            let box = new THREE.BoxHelper(o, s.colorSelected),
                // box = new THREE.BoundingBoxHelper(o, s.colorSelected),
                position = toScreenPosition(o, camera),
                cameraDistance = 0,
                objectDialogueDistance = 0;

            box.size = getBoundingBox(o).size;
            box.update(o);
            cameraDistance = 320 / Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2) + Math.pow(camera.position.z, 2));
            objectDialogueDistance =
                cameraDistance * 1.2 * Math.sqrt(Math.pow(box.size.x, 2) +
                Math.pow(box.size.y, 2)) + 15;
            objectDialogueDistance = parseInt(objectDialogueDistance);

            reactSrc.setState({
                modelSelected: o,
                openObjectDialogue: true
            }, function() {
                let objectDialogue = document.getElementsByClassName('object-dialogue')[0],
                    objectDialogueWidth = parseInt($(objectDialogue).width()),
                    objectDialogueHeight = parseInt($(objectDialogue).height()),
                    leftOffset = parseInt(position.x),
                    topOffset = (parseInt(position.y) - objectDialogueHeight / 2),
                    marginTop = container.offsetHeight / 2 - position.y;

                let rightLimit = container.offsetWidth - objectDialogueWidth - leftOffset,
                    topLimit = container.offsetHeight / 2 - objectDialogueHeight / 2;

                if (objectDialogueDistance > rightLimit) {
                    objectDialogueDistance = rightLimit;
                }

                if (marginTop > topLimit) {
                    topOffset = 0;
                }

                reactSrc.setState({
                    objectDialogueStyle: {
                        'left': leftOffset + 'px',
                        'top': topOffset + 'px',
                        'margin-left': objectDialogueDistance + 'px'
                    }
                });

                reactSrc.state.mode === 'rotate' ? $('.scale-content').hide() : $('.rotate-content').hide();
            });
        }
    }

    function setCameraPosition(refCamera) {
        camera.position.copy(refCamera.position.add(panningOffset));
        camera.rotation.copy(refCamera.rotation);

        render();
        setObjectDialoguePosition();
        setImportWindowPosition();
    }

    // Main Functions ---

    // select the specified object, will calculate out-of-bounds and change color accordingly
    function selectObject(obj) {
        SELECTED = obj || {};

        if (!$.isEmptyObject(obj)) {

            _enableObjectEditMenu(true);

            objects.forEach(function(o) {
                o.outlineMesh.visible = false;
            });

            if(obj.outlineMesh) {
                obj.outlineMesh.visible = true;
            }
            setObjectDialoguePosition(obj);

            transformControl.attach(obj);
            transformControl.name = 'TransformControl';

            scaleBeforeTransformX = obj.scale.x;
            scaleBeforeTransformY = obj.scale.y;
            scaleBeforeTransformZ = obj.scale.z;

            if(reactSrc.state.mode === 'rotate') {
                setRotateMode();
            }
            else {
                setScaleMode();
            }
        }
        else {
            transformMode = false;
            removeFromScene('TransformControl');
            _removeAllMeshOutline();
            _enableObjectEditMenu(false);
            reactSrc.setState({ openObjectDialogue: false });
        }
        render();
    }

    function alignCenter() {
        if (!$.isEmptyObject(SELECTED)) {
            let reference = getReferenceDistance(SELECTED);
            SELECTED.position.x -= reference.x;
            SELECTED.position.y -= reference.y;
            SELECTED.position.z -= reference.z;
            SELECTED.outlineMesh.position.x -= reference.x;
            SELECTED.outlineMesh.position.y -= reference.y;
            SELECTED.outlineMesh.position.z -= reference.z;
            blobExpired = true;
            hasPreviewImage = false;

            checkOutOfBounds(SELECTED);
            render();
        }
    }

    function groundIt(mesh) {
        mesh = mesh || SELECTED;
        if (!$.isEmptyObject(mesh)) {
            let reference = getReferenceDistance(mesh);
            mesh.position.z -= reference.z;
            if(mesh.outlineMesh) {
                mesh.outlineMesh.position.z -= reference.z;
            }
            blobExpired = true;
            hasPreviewImage = false;
        }
    }

    function setDefaultFileName(fileNameWithExtension) {
        if(typeof fileNameWithExtension === 'undefined') {
            if(objects.length) {
                defaultFileName = objects[0].fileName;
                defaultFileName = defaultFileName.split('.');
                defaultFileName.pop();
                defaultFileName = defaultFileName.join('.');
            }
        }
        else {
            let name = fileNameWithExtension.split('.');
            name.pop();
            name = name.join('.');
            defaultFileName = name;
        }
    }

    function removeSelected(addToHistory = true) {
        if (SELECTED && Object.keys(SELECTED).length > 0) {
            if(addToHistory) {
                addHistory('DELETE', SELECTED);
            }

            let index = objects.indexOf(SELECTED);

            scene.remove(SELECTED.outlineMesh);
            scene.remove(SELECTED);
            outlineScene.remove(SELECTED.outlineMesh);
            if (index > -1) {
                objects.splice(index, 1);
            } else {
                console.log('Remove:: Object cannot find' , SELECTED);
            }

            transformControl.detach(SELECTED);
            selectObject(null);

            stopSlicing();
            clearInterval(slicingStatus.reporter);
            // remove progress bar
            reactSrc.setState({ slicingPercentage: 0 });

            setDefaultFileName();
            render();
            if(objects.length === 0) {
                clearTimeout(slicingTimmer);
                registerDragToImport();
                reactSrc.setState({
                    openImportWindow: true,
                    hasObject: false
                }, function() {
                    setImportWindowPosition();
                });
            }
            else {
                doSlicing();
            }

            _clearPath();
        }
    }

    function duplicateSelected() {
        if(SELECTED) {
            let mesh = new THREE.Mesh(SELECTED.geometry, SELECTED.material);
            mesh.up = new THREE.Vector3(0, 0, 1);

            stopSlicing().then(() => {
                sliceMaster.addTask('duplicate', SELECTED.uuid, mesh.uuid).then((result) => {
                    if(result.status.toUpperCase() === DeviceConstants.OK) {
                        Object.assign(mesh.scale, SELECTED.scale);
                        mesh.rotation.enteredX = SELECTED.rotation.enteredX;
                        mesh.rotation.enteredY = SELECTED.rotation.enteredY;
                        mesh.rotation.enteredZ = SELECTED.rotation.enteredZ;
                        mesh.rotation.x = SELECTED.rotation.x;
                        mesh.rotation.y = SELECTED.rotation.y;
                        mesh.rotation.z = SELECTED.rotation.z;
                        mesh.rotation.order = 'ZYX';

                        mesh.name = 'custom';
                        mesh.plane_boundary = planeBoundary(mesh);

                        autoArrange(mesh);
                        addSizeProperty(mesh);
                        groundIt(mesh);
                        createOutline(mesh);

                        let source = objects.filter(o => o.uuid === SELECTED.uuid)[0];
                        if(typeof source !== 'undefined') {
                            mesh.file = source.file;
                        }

                        selectObject(null);
                        selectObject(mesh);

                        scene.add(mesh);
                        outlineScene.add(mesh.outlineMesh);
                        objects.push(mesh);

                        doSlicing();
                        syncObjectOutline(mesh);
                        setObjectDialoguePosition(mesh);
                        render();
                    }
                    else {
                        if(result.error === ErrorConstants.NAME_NOT_EXIST) {
                            AlertActions.showPopupError('duplicateError', lang.slicer.error[result.error]);
                        }
                        else {
                            AlertActions.showPopupError('duplicateError', result.info);
                        }
                    }
                }).fail((error) => {
                    processSlicerError(error);
                });
            });
        }
    }

    function planeBoundary(sourceMesh) {
        let transformation = JSON.stringify({ p: sourceMesh.position, s: sourceMesh.scale, r: sourceMesh.rotation}, (key, val) => {
            // Fix precision to .00001
            return val.toFixed ? Number(val.toFixed(5)) : val;
        });
        if (sourceMesh.jTransformation === transformation) {
            return sourceMesh.plane_boundary;
        }
        sourceMesh.jTransformation = transformation;
        // ref: http://www.csie.ntnu.edu.tw/~u91029/ConvexHull.html#4
        // Andrew's Monotone Chain


        // sort the index of each point in stl
        let stl_index = [];
        let boundary = [];

        if (sourceMesh.geometry.type === 'Geometry') {
            // define Cross product function on 2d plane
            let vs = sourceMesh.geometry.vertices;
            let cross = (function cross(p0, p1, p2) {
                return ((p1.x - p0.x) * (p2.y - p0.y)) - ((p1.y - p0.y) * (p2.x - p0.x));
            });

            stl_index = new Uint32Array(vs.length);

            for (let i = 0; i < vs.length; i += 1) {
                stl_index[i] = i;
            }

            stl_index.sort((a, b) => {
                let c = vs[a].y === vs[b].y;
                return c ? c : vs[a].x - vs[b].x;
            });

            // find boundary
            // compute upper hull
            for (let i = 0; i < stl_index.length; i += 1) {
                while( boundary.length >= 2 && cross(vs[boundary[boundary.length - 2]], vs[boundary[boundary.length - 1]], vs[stl_index[i]]) <= 0){
                    boundary.pop();
                }
                boundary.push(stl_index[i]);
            }
            // compute lower hull
            let t = boundary.length + 1;
            for (let i = stl_index.length - 2 ; i >= 0; i -= 1) {
                while( boundary.length >= t && cross(vs[boundary[boundary.length - 2]], vs[boundary[boundary.length - 1]], vs[stl_index[i]]) <= 0){
                    boundary.pop();
                }
                boundary.push(stl_index[i]);
            }

            // delete redundant point(i.e., starting point)
            boundary.pop();
        }
        else{
            let vs = sourceMesh.geometry.getAttribute('position');
            // define Cross product function on 2d plane for BufferGeometry
            let cross = (function cross(p0, p1, p2) {

                return ((vs[p1 * 3 + 0] - vs[p0 * 3 + 0]) *
                        (vs[p2 * 3 + 1] - vs[p0 * 3 + 1])) -
                       ((vs[p1 * 3 + 1] - vs[p0 * 3 + 1]) *
                        (vs[p2 * 3 + 0] - vs[p0 * 3 + 0]))
            });

            let meshSize = vs.count / vs.itemSize;

            stl_index = new Uint32Array(meshSize);
            for (let i = 0; i < meshSize; i += 1) {
                stl_index[i] = i;
            }

            stl_index.sort((a, b) => {
                let c = vs[a * 3 + 1] - vs[b * 3 + 1];
                return c ? c : vs[a * 3 + 0] - vs[b * 3 + 0];
            });

            // find boundary
            // compute upper hull
            for (let i = 0; i < stl_index.length; i += 1) {
                while ( boundary.length >= 2 && cross(boundary[boundary.length - 2], boundary[boundary.length - 1], stl_index[i]) <= 0) {
                    boundary.pop();
                }
                boundary.push(stl_index[i]);
            }

            // compute lower hull
            let t = boundary.length + 1;
            for (let i = stl_index.length - 2 ; i >= 0; i -= 1) {
                while( boundary.length >= t && cross(boundary[boundary.length - 2], boundary[boundary.length - 1], stl_index[i]) <= 0) {
                    boundary.pop();
                }
                boundary.push(stl_index[i]);
            }
            // delete redundant point(i.e., starting point)
            boundary.pop();
        };
        return boundary;
    }

    function checkOutOfBounds(sourceMesh) {
        let d = $.Deferred();
        if (!$.isEmptyObject(sourceMesh)) {
            let vector = new THREE.Vector3();
            sourceMesh.position.isOutOfBounds = sourceMesh.plane_boundary.some(function(v) {
                if (sourceMesh.geometry.type === 'Geometry') {
                    vector = sourceMesh.geometry.vertices[v].clone();
                }
                else{
                    vector.x = sourceMesh.geometry.attributes.position.array[v * 3 + 0];
                    vector.y = sourceMesh.geometry.attributes.position.array[v * 3 + 1];
                    vector.z = sourceMesh.geometry.attributes.position.array[v * 3 + 2];
                }

                vector.applyMatrix4(sourceMesh.matrixWorld);
                return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) > s.radius;
            });

            sourceMesh.outlineMesh.material.color.setHex(sourceMesh.position.isOutOfBounds ? s.colorOutside : s.colorSelected);

            let hasOutOfBoundsObject = objects.some(function(o) {
                return o.position.isOutOfBounds;
            });

            reactSrc.setState({
                hasOutOfBoundsObject: hasOutOfBoundsObject
            }, () => {
                d.resolve();
            });
        }
        return d.promise();
    }

    function checkCollisionWithAny(src, callback) {
        let _objects,
            collided = false,
            sourceBox = new THREE.Box3();

        _objects = objects.filter(function(o) {
            return o.uuid !== src.uuid;
        });

        sourceBox.setFromObject(src);
        // sourceBox = new THREE.BoundingBoxHelper(src, s.colorSelected);
        // sourceBox.update(src);
        // sourceBox.box.intersectsBox = function ( box ) {
        //
		// // using 6 splitting planes to rule out intersections.
        //
    	// 	if ( box.max.x < this.min.x || box.min.x > this.max.x ||
		// 		 box.max.y < this.min.y || box.min.y > this.max.y ||
		// 		 box.max.z < this.min.z || box.min.z > this.max.z ) {
        //
    	// 		return false;
    	// 	}
    	// 	return true;
    	// };

        for(let i = 0; i < _objects.length; i++) {
            if(!collided) {
                let box = new THREE.Box3();
                // let box = new THREE.BoundingBoxHelper(_objects[i], s.colorSelected);
                // box.update(_objects[i]);
                box.setFromObject(_objects[i]);
                if(sourceBox.intersectsBox(box)) {
                    collided = true;
                    callback(box);
                }
            }
        }

        if(!collided) {
            callback(null);
        }
    }

    function autoArrange(model) {
        let level = 1,
            spacing = 2,
            inserted = false,
            target = new THREE.BoxHelper(model),
            // target = new THREE.BoundingBoxHelper(model),
            mover,
            arithmetic,
            spacingX,
            spacingY,
            originalPosition,
            _model;

        originalPosition = model.position.clone();

        spacingX = function(size) {
            return level * (size.x + spacing);
        };

        spacingY = function(size) {
            return level * (size.y + spacing);
        };

        arithmetic = {
            '1': function(size) {
                model.position.x = spacingX(size);
                model.position.y = originalPosition.y;
            },
            '2': function(size) {
                model.position.x = spacingX(size);
                model.position.y = -spacingY(size);
            },
            '3': function(size) {
                model.position.x = originalPosition.x;
                model.position.y = -spacingY(size);
            },
            '4': function(size) {
                model.position.x = -spacingX(size);
                model.position.y = -spacingY(size);
            },
            '5': function(size) {
                model.position.x = -spacingX(size);
                model.position.y = originalPosition.y;
            },
            '6': function(size) {
                model.position.x = -spacingX(size);
                model.position.y = spacingY(size);
            },
            '7': function(size) {
                model.position.x = originalPosition.x;
                model.position.y = spacingY(size);
            },
            '8': function(size) {
                model.position.x = spacingX(size);
                model.position.y = spacingY(size);
            }
        };

        target.update(model);
        mover = function(ref, method) {
            let size = getBoundingBox(ref).size;
            // let size = ref.box.size();
            arithmetic[method.toString()](size);
            checkCollisionWithAny(model, function(collideObject) {
                if(collideObject !== null) {
                    if(method === Object.keys(arithmetic).length) {
                        level++;
                        method = 0;
                    }
                    mover(ref, method + 1);
                }
            });
        };

        checkCollisionWithAny(model, function(collideObject) {
            if(collideObject !== null) {
                let ref = new THREE.BoxHelper(collideObject, s.colorSelected);
                // let ref = new THREE.BoundingBoxHelper(collideObject, s.colorSelected);
                ref.update(collideObject);
                mover(ref, 1);
            }
        });

    }

    function syncObjectParameter() {
        let d = $.Deferred();
        _syncObjectParameter(objects, 0, () => {
            d.resolve('');
        });

        return d.promise();
    }

    function downloadFCode(fileName) {
        if(!fileName) {
            fileName = defaultFileName;
        }

        fileName = fileName + '.fc';

        selectObject(null);
        let d = $.Deferred();
        if(objects.length > 0) {
            if (!blobExpired) {
                if(hasPreviewImage) {
                    d.resolve(saveAs(responseBlob, fileName));
                }
                else {
                    takeSnapShot().then(() => {
                        d.resolve(saveAs(responseBlob, fileName));
                    });
                }
            }
            else {
                getFCode().then((blob) => {
                    if (blob instanceof Blob) {
                        takeSnapShot().then(() => {
                            ProgressActions.close();
                            d.resolve(saveAs(responseBlob, fileName));
                        });
                    }
                });
            }

            return d.promise();
        }
        else {
            // for importing .fc or .gcode
            if(importFromFCode || importFromGCode) {
                getFCode().then(function(blob) {
                    if (blob instanceof Blob) {
                        ProgressActions.close();
                        d.resolve(saveAs(blob, fileName));
                    }
                });
                return d.promise();
            }
        }
    }

    function getBlobFromScene() {
        let ccp = camera.position.clone(),
            ccr = camera.rotation.clone(),
            d = $.Deferred(),
            ol = _getCameraLook(camera);

        camera.position.set(0, -180, 60);
        camera.rotation.set(originalCameraRotation.x, originalCameraRotation.y, originalCameraRotation.z, originalCameraRotation.order);
        camera.lookAt(new THREE.Vector3(0,380,0));
        render();

        // let s = SELECTED;
        toggleTransformControl(true);
        renderer.domElement.toBlob(function(blob) {
            previewUrl = URL.createObjectURL(blob);
            camera.position.set(ccp.x, ccp.y, ccp.z);
            camera.rotation.set(ccr.x, ccr.y, ccr.z, ccr.order);
            camera.lookAt(ol);
            toggleTransformControl(false);
            render();
            cropImageUsingCanvas(blob).then((blob2) => {
                d.resolve(blob2);
            });
        });

        return d.promise();
    }


    function cropImageUsingCanvas(data) {
        if(data instanceof Blob) {
            console.log("Loading blob", data);
            // Blob to HTMLImage
            let newImg = document.createElement('img'),
                url = URL.createObjectURL(data),
                d = $.Deferred();

            newImg.onload = function() {
                console.log("Loaded image", url, newImg.width, newImg.height);
                URL.revokeObjectURL(url);

                cropImageUsingCanvas(newImg, true).then(function(blob) {
                    console.log("Resolved cropping", url);
                    d.resolve(blob);
                });
            };

            newImg.src = url;

            return d.promise();
        }
        //HTMLImage to Canvas, Canvas to Blob
        let width = 640, height = 640,
            canvas = document.createElement('canvas'),
            sh = data.height,
            sw = data.width,
            sx = 0,
            sy = 0,
            d = $.Deferred();

        if(data.width > data.height) {
            sx = (data.width - data.height)/2;
            sw = data.height;
        }else if(data.width < data.height) {
            sy = (data.height - data.width)/2;
            sh = data.width;
        }

        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext('2d');
        console.log("drawing image element", sx, sy, sw, sh);
        context.drawImage(data, sx, sy, sw, sh, 0, 0, width, height);
        canvas.toBlob(function(blob) {
            d.resolve(blob);
        });
        return d.promise();
    }

    function removeFromScene(name) {
        for (let i = scene.children.length - 1; i >= 0; i--) {
            if (scene.children[i].name === name) {
                scene.children.splice(i, 1);
            }
        }
    }

    function updateFromScene(name) {
        for (let i = scene.children.length - 1; i >= 0; i--) {
            if (scene.children[i].name === name) {
                scene.children[i].update();
            }
        }
    }

    function togglePreview() {
        if (objects.length === 0 || allOutOfBound()) {
            _closePreview();
            return;
        } else {
            previewMode ? _hidePreview() : _showPreview();
            previewMode = !previewMode;
            render();
        }
    }


    function changePreviewLayer(layerNumber) {

        for (let i = 1; i < previewScene.children.length; i++) {
            previewScene.children[i].visible = i <= layerNumber;
        }

        if ( previewScene.children.length > printPath.length && previewScene.children.length > 0)  {
            // let trashLine = previewScene.children[previewScene.children.length - 1]
            previewScene.children.splice( previewScene.children.length - 1, 1) ;
            // trashLine.dispose();
        }

        let g = new THREE.BufferGeometry(),
            i = 0,
            layer = printPath[layerNumber];

        if ( layer && layer.length ) {
            let positions = new Float32Array(layer.length * 3 * 2 - 6);
            let colors = new Float32Array(layer.length * 3 * 2 - 6);
            for (let p = 1; p < layer.length; p++) {
                for (let tmp = 1; tmp >= 0; tmp--) {
                    positions[i * 3] = layer[p - tmp][0];
                    positions[i * 3 + 1] = layer[p - tmp][1];
                    positions[i * 3 + 2] = layer[p - tmp][2];
                    let color = previewColors[layer[p][3]+1];
                    colors[i * 3] = Math.min(1, color.r * 0.8);
                    colors[i * 3 + 1] = Math.min(1, color.g * 0.8);
                    colors[i * 3 + 2] = Math.min(1, color.b * 0.8);
                    i++;
                }
            }

            g.addAttribute('position', new THREE.BufferAttribute(positions,3));
            g.addAttribute('color', new THREE.BufferAttribute(colors, 3));
            g.computeBoundingSphere();
        }

        let line = new THREE.Line(g, emphasizeLineMaterial); // A layer is a 'continuos line'
        line.name = 'line';
        previewScene.add(line);

        render();
    }

    function getCurrentPreviewLayer() {
        return parseInt($('.preview-panel').find('input').val());
    }

    function updateOrbitControl() {
        setObjectDialoguePosition();
        render();
        setImportWindowPosition();
        reactSrc.setState({
            camera: camera,
            updateCamera: true
        });
        panningOffset = camera.position.clone().sub(camera.position);

        if(scene.cameraLight) {
            scene.cameraLight.position.copy(camera.position);
        }
    }

    function clearSelection() {
        selectObject(null);
    }

    function render() {
        if (!$.isEmptyObject(SELECTED)) {
            updateFromScene('TransformControl');
        }

        renderer.clear();
        if (outlineScene.children.length > 0) {
            renderer.render( outlineScene, camera );
        }

        renderer.clearDepth();
        renderer.render(previewMode ? previewScene : scene, camera);
    }

    function addSizeProperty(obj) {
        if (!$.isEmptyObject(obj)) {
            let boundingBox = getBoundingBox(obj);
            // let boundingBox = new THREE.BoundingBoxHelper(obj);
            // boundingBox.update();
            obj.size = boundingBox.size;
            obj.size.enteredX = boundingBox.size.x;
            obj.size.enteredY = boundingBox.size.y;
            obj.size.enteredZ = boundingBox.size.z;

            obj.size.originalX = boundingBox.size.x;
            obj.size.originalY = boundingBox.size.y;
            obj.size.originalZ = boundingBox.size.z;

            obj.size.transformedSize = {};
            obj.size.transformedSize.x = boundingBox.size.x;
            obj.size.transformedSize.y = boundingBox.size.y;
            obj.size.transformedSize.z = boundingBox.size.z;
        }
    }

    // Helper Functions ---

    function degreeToRadian(degree) {
        return (degree / 360 * Math.PI * 2) || 0;
    }

    function radianToDegree(radian) {
        return radian * 180 / Math.PI;
    }

    function updateDegreeWithStep(degree) {
        if (degree === 0) {
            return 0;
        }
        let degreeStep = shiftPressed ? 15 : s.degreeStep;
        return (parseInt(degree / degreeStep) * degreeStep);
    }

    function updateObjectSize(src) {
        src.size.enteredX = src.scale.x * src.size.originalX;
        src.size.enteredY = src.scale.y * src.size.originalY;
        src.size.enteredZ = src.scale.z * src.size.originalZ;

        src.size.x = src.scale.x * src.size.originalX;
        src.size.y = src.scale.y * src.size.originalY;
        src.size.z = src.scale.z * src.size.originalZ;

        syncObjectOutline(src);
        setObjectDialoguePosition(src);

        reactSrc.setState({
            modelSelected: src
        });

    }

    function updateObjectRotation(src) {
        // scale lock transforming is modified in TransformControls.js source
        // search for keyword locked
        src.rotation.enteredX = updateDegreeWithStep(radianToDegree(src.rotation.x));
        src.rotation.enteredY = updateDegreeWithStep(radianToDegree(src.rotation.y));
        src.rotation.enteredZ = updateDegreeWithStep(radianToDegree(src.rotation.z));

        syncObjectOutline(src);
        setRotation(src.rotation.enteredX, src.rotation.enteredY, src.rotation.enteredZ);

        reactSrc.setState({
            modelSelected: src
        });
    }

    function toScreenPosition(obj, cam) {
        if (!$.isEmptyObject(obj)) {
            let vector = new THREE.Vector3();

            // TODO: need to update this when resize window
            let widthHalf = 0.5 * container.offsetWidth;
            let heightHalf = 0.5 * container.offsetHeight;

            obj.updateMatrixWorld();
            vector.setFromMatrixPosition(obj.matrixWorld);
            vector.project(cam);

            vector.x = (vector.x * widthHalf) + widthHalf;
            vector.y = -(vector.y * heightHalf) + heightHalf;

            return {
                x: vector.x,
                y: vector.y
            };
        }
    }

    function createOutline(mesh) {
        var outlineMaterial = new THREE.MeshBasicMaterial({
            color: s.colorSelected,
            side: THREE.BackSide
        });
    	var outlineMesh = new THREE.Mesh( mesh.geometry, outlineMaterial ),
            { x, y, z } = mesh.position;

    	outlineMesh.position.set(x, y, z);
    	outlineMesh.scale.multiplyScalar(1.05);
        outlineMesh.up = new THREE.Vector3(0, 0, 1);
        mesh.outlineMesh = outlineMesh;
    	outlineScene.add(outlineMesh);
    }

    function syncObjectOutline(src) {
        src.outlineMesh.rotation.set(src.rotation.x, src.rotation.y, src.rotation.z, 'ZYX');
        src.outlineMesh.scale.set(src.scale.x, src.scale.y, src.scale.z);
        src.outlineMesh.scale.multiplyScalar(1.05);
        render();
    }

    function displayProgress(step, total, progress) {
        if(step === total) {
            ProgressActions.updating(lang.print.uploaded, 80);
        }
        else {
            ProgressActions.updating(lang.print.uploaded, progress * 0.8);
        }
    }

    function stopSlicing() {
        let d = $.Deferred();
        clearInterval(slicingStatus.reporter);
        if(slicingStatus.inProgress) {
            sliceMaster.addTask('stopSlicing').then(() => {
                slicingStatus.inProgress = false;
                slicingStatusStream.onNext(slicingStatus);
                d.resolve('');
            });
        }
        else {
            d.resolve('');
        }
        return d.promise();
    }

    // type can be fcode ('fc') or gcode ('gcode')
    function doFCodeImport(type) {
        clearScene();
        fcodeConsole = fcodeReader();
        importFromGCode = type === 'gcode';
        importFromFCode = type === 'fc';

        previewMode = true;
        _showWait(lang.print.drawingPreview, !showStopButton);

        reactSrc.setState({
            openImportWindow: false,
            previewMode: true,
            hasObject: true,
            openObjectDialogue: false
        });

        appendPreviewPath(importedFCode, function() {
            ProgressActions.close();
            callback();
        }, importFromGCode);
    }

    function downloadScene() {
        if(objects.length === 0) { return; }

        packer.clear();

        if(objects.length > 0) {
            objects.forEach(function(model) {
                packer.addInfo({
                    size : model.size,
                    rotation : model.rotation,
                    position : model.position,
                    scale : model.scale
                });
                packer.addFile(model.file);
            });
        }

        saveAs(packer.pack());
    }

    function loadScene() {
        clearScene();
        _handleLoadScene(importedScene);
    }

    function _handleLoadScene(sceneFile) {
        let packer = require('helpers/packer');

        packer.unpack(sceneFile).then(function(_sceneFile) {
            let files = _sceneFile[0];

            sceneFile = _sceneFile;

            appendModels(files, 0, function() {
                updateObject();
            });
        });

        let updateObject = function() {
            sceneFile.shift();
            objects.forEach(function(obj, i) {
                let ref = sceneFile[i];

                obj.position.x = ref.position.x;
                obj.position.y = ref.position.y;
                obj.outlineMesh.position.x = ref.position.x;
                obj.outlineMesh.position.y = ref.position.y;

                setRotation(
                    parseInt(ref.rotation.enteredX),
                    parseInt(ref.rotation.enteredY),
                    parseInt(ref.rotation.enteredZ), true, obj);

                setSize(ref.size, true, obj);

                selectObject(null);
                render();

            });
        };

    }

    // Private Functions ---

    // sync parameters with server
    function _syncObjectParameter(o, index, callback) {
        index = index || 0;
        if (index < o.length) {
            sliceMaster.addTask(
                'set',
                o[index].uuid,
                o[index].position.x,
                o[index].position.y,
                o[index].position.z,
                o[index].rotation.x,
                o[index].rotation.y,
                o[index].rotation.z,
                o[index].scale.x,
                o[index].scale.y,
                o[index].scale.z
            ).then(() => {
                if (index < o.length) {
                    _syncObjectParameter(o, index + 1, callback);
                }
            }).fail((error) => {
                index = o.length;
                processSlicerError(error);
            });
        } else {
            callback();
        }
    }

    function _addShadowedLight(x, y, z, color, intensity) {
        let directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z);

        scene.add(directionalLight);
        directionalLight.castShadow = true;

        let d = 1;
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;

        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 4;

        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;

        directionalLight.shadow.bias = -0.005;
        // directionalLight.shadowDarkness = 0.15;

        // directionalLight.shadowCameraVisible = true;
        directionalLight.castShadow = true;
        // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
    }

    function _hidePreview() {
        // previewMode = false;
        render();
        _setProgressMessage('');
    }

    function _handleSliceComplete() {
        if(previewMode) {
            slicingStatus.isComplete = true;
            _showWait(lang.print.drawingPreview, !showStopButton);
            sliceMaster.addTask('getPath').then((result) => {
                printPath = result;
                _drawPath().then(function() {
                    _resetPreviewLayerSlider();
                    ProgressActions.close();
                    slicingStatus.showProgress = false;
                });
            }).fail((error) => {
                processSlicerError(error);
            });
        }
        else {
            slicingStatus.isComplete = true;
            ProgressActions.close();
        }

        slicingStatus.inProgress    = false;
        slicingStatus.lastProgress  = null;
        slicingStatus.lastReport    = null;
        slicingStatusStream.onNext(slicingStatus);
    }

    function cancelPreview() {
        slicingStatus.showProgress = false;
        _closePreview();

        if(importFromFCode || importFromGCode) {
            _exitImportFromFCodeMode();
        }
    }

    function addHistory(cmd, obj) {
        if(SELECTED) {
            let entry = { size: {}, rotation: {}, position: {}, scale: {} };

            if(cmd === 'DELETE' || cmd === 'ADD') {
                entry.cmd = cmd;
                entry.src = obj;
            }
            else {
                entry.uuid = SELECTED.uuid;
                Object.assign(entry.position, SELECTED.position);
                Object.assign(entry.size, SELECTED.size);
                Object.assign(entry.rotation, SELECTED.rotation);
                Object.assign(entry.scale, SELECTED.scale);
            }
            history.push(entry);
        }
    }

    function undo() {
        if(history.length > 0) {
            let entry = history.pop();
            if(entry.cmd === 'DELETE') {
                objects.push(entry.src);
                scene.add(entry.src);
                scene.add(entry.src.outlineMesh);
                outlineScene.add(entry.src.outlineMesh);
                SELECTED = entry.src;
                selectObject(SELECTED);
                reactSrc.setState({ hasObject: true });
            }
            else if(entry.cmd === 'ADD') {
                SELECTED = entry.src;
                removeSelected(false);
            }
            else {
                objects.forEach(function(model) {
                    if(model.uuid === entry.uuid) {
                        _setObject(entry, model);
                        setObjectDialoguePosition(model);
                        selectObject(model);
                    }
                });
            }
        }
    }

    function clearScene() {
        objects.length = 0;
        outlineScene.children.length = 0;
        for(let i = scene.children.length - 1; i >= 0; i--) {
            if(scene.children[i].name === 'custom') {
                scene.children.splice(i, 1);
            }
        }
        _exitImportFromFCodeMode();
        selectObject(null);
        render();
    }

    function _exitImportFromFCodeMode() {
        importFromFCode = false;
        importFromGCode = false;
        previewMode = false;
        reactSrc.setState({
            openImportWindow: objects.length === 0,
            previewMode: false,
            hasObject: false,
            previewModeOnly: false,
            leftPanelReady: true
        });
        _clearPath();
        render();
    }

    function _showPreview() {
        selectObject(null);
        // previewMode = true;
        transformControl.detach(SELECTED);
        if(slicingStatus.error) {
            AlertActions.showPopupError('', slicingStatus.error.info, slicingStatus.error.caption);
        }

        if(blobExpired) {
            let progress;
            slicingStatus.showProgress = true;
            slicingStatus.needToCloseWait = true;

            if(willReslice) {
                progress = lang.print.reRendering;
                if(!slicingStatus.isComplete) {
                    _showWait(progress, !showStopButton);
                }
            }
            else {
                updateSlicingProgressFromReport(slicingStatus.lastReport);
            }
        }
        else {
            if(!printPath || printPath.length === 0) {
                _showWait(lang.print.drawingPreview, !showStopButton);
                sliceMaster.addTask('getPath').then((result) => {
                    if(result.error) {
                        processSlicerError(result);
                    }
                    printPath = result;
                    _drawPath().then(() => {
                        _resetPreviewLayerSlider();
                        _closeWait();
                    });
                }).fail((error) => {
                    processSlicerError(error);
                }).always(() => {
                    _closeWait();
                });
            }
            else {
                _drawPath().then(function() {
                    changePreviewLayer(getCurrentPreviewLayer());
                    _closeWait();
                });
            }
        }
    }

    function _showWait(message, stopButton, onCloseFunction) {
        onCloseFunction = onCloseFunction || function() {};
        ProgressActions.close();
        ProgressActions.open(
            ProgressConstants.WAITING,
            message,
            '',
            stopButton
        );
    }

    function _closeWait() {
        ProgressActions.close();
    }

    function _closePreview() {
        previewMode = false;
        reactSrc.setState({ previewMode: false }, () => {
            $('#preview').parents('label').find('input').prop('checked',false);
        });
        render();
    }

    function _drawPath() {
        let d = $.Deferred(), lineMaterial, line;

        previewScene.children.splice(1, previewScene.children.length - 1);
        lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            opacity: 0.3,
            vertexColors: THREE.VertexColors
        });

        for (let l = 0; l < printPath.length; l++) {
            let g = new THREE.BufferGeometry(),
                i = 0,
                layer = printPath[l];

            let positions = new Float32Array(layer.length * 3 * 2 - 6);
            let colors = new Float32Array(layer.length * 3 * 2 - 6);

            for (let p = 1; p < layer.length; p++) {
                for (let tmp = 1; tmp >= 0; tmp--) {
                    positions[i * 3] = layer[p - tmp][0];
                    positions[i * 3 + 1] = layer[p - tmp][1];
                    positions[i * 3 + 2] = layer[p - tmp][2];
                    let color = previewColors[layer[p][3]+1];
                    colors[i * 3] = color.r;
                    colors[i * 3 + 1] = color.g;
                    colors[i * 3 + 2] = color.b;
                    i++;
                }
            }

            g.addAttribute('position', new THREE.BufferAttribute(positions,3));
            g.addAttribute('color', new THREE.BufferAttribute(colors, 3));
            g.computeBoundingSphere();

            line = new THREE.Line(g, lineMaterial); // A layer is a 'continuos line'
            line.name = 'line';
            previewScene.add(line);
        }
        reactSrc.setState({
            previewLayerCount: previewScene.children.length - 1
        }, function() {
            d.resolve('');
        });
        render();
        _setProgressMessage('');
        return d.promise();
    }

    function _drawPathFromFCode() {
        _drawPath().then(function() {
            $('#preview').parents('label').find('input').prop('checked', true);
            _closeWait();
            reactSrc.setState({
                leftPanelReady: false,
                previewModeOnly: true
            }, function() {
                // remove disable class for hover effect
                $('#preview').parent().removeClass('disable');
            });
        });
    }

    function _clearPath() {
        printPath = [];
        previewScene.children.splice(1, previewScene.children.length - 1);
    }

    function _resetPreviewLayerSlider() {
        $('.preview-panel').find('input').val(reactSrc.state.previewLayerCount);
        $('.preview-panel').find('.layer-count').html(reactSrc.state.previewLayerCount);
    }

    function _setProgressMessage(message) {
        reactSrc.setState({
            progressMessage: message
        });
    }

    function _removeAllMeshOutline() {
        objects.forEach(function(obj) {
            obj.outlineMesh.visible = false;
        });
    }

    function _getCameraLook(_camera) {
        let vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(_camera.rotation, _camera.rotation.order);
        return vector;
    }

    function _enableObjectEditMenu(enabled) {
        MenuFactory.items.duplicate.enabled = enabled;
        MenuFactory.items.scale.enabled = enabled;
        MenuFactory.items.rotate.enabled = enabled;
        MenuFactory.items.reset.enabled = enabled;

        MenuFactory.items.duplicate.onClick = duplicateSelected;
        MenuFactory.items.scale.onClick = setScaleMode;
        MenuFactory.items.rotate.onClick = setRotateMode;
        MenuFactory.items.reset.onClick = resetObject;
        MenuFactory.methods.refresh();
    }

    function _setObject(ref, target) {
        target.position.x = ref.position.x;
        target.position.y = ref.position.y;
        target.outlineMesh.position.x = ref.position.x;
        target.outlineMesh.position.y = ref.position.y;

        setRotation(
            parseInt(ref.rotation.enteredX),
            parseInt(ref.rotation.enteredY),
            parseInt(ref.rotation.enteredZ), true, target);

        setSize(ref.size, true, target);

        render();
    }

    function _objectChanged(ref, src) {
        if(!ref.size) { ref.size = {}; }
        if(!ref.rotation) { ref.rotation = {}; }

        let sizeChanged = (
            ref.size.x !== src.size.x ||
            ref.size.y !== src.size.y ||
            ref.size.z !== src.size.z
        );

        let rotationChanged = (
            ref.rotation.enteredX !== ref.rotation.enteredX ||
            ref.rotation.enteredY !== ref.rotation.enteredY ||
            ref.rotation.enteredZ !== ref.rotation.enteredZ
        );

        return sizeChanged || rotationChanged;
    }

    function _round(float) {
        return parseFloat((Math.round(float * 100) / 100).toFixed(2));
    }

    function _checkNeedToShowProgress() {
        if(!slicingStatus.isComplete) {
            slicingStatus.showProgress = true;

            if(!!slicingStatus.lastReport) {
                updateSlicingProgressFromReport(slicingStatus.lastReport);
            }
        }
    }

    function clear() {
        objects = [];
        referenceMeshes = [];
        renderer.clear();
        renderer.clearDepth();
    }

    function toggleScaleLock(locked) {
        if(SELECTED) {
            SELECTED.scale.locked = locked;
        }
    }

    function getSlicingStatus() {
        return slicingStatus;
    }

    function changeEngine(engine) {
        let d = $.Deferred(),
            requireReslice = slicingStatus.inProgress;

        stopSlicing().then(() => {
            sliceMaster.clearTasks();
            sliceMaster.addTask('changeEngine', engine).then((result) => {
                if(result.error) { processSlicerError(result); }
                else if(requireReslice) { startSlicing(); }
                d.resolve();
            }).fail((error) => {
                processSlicerError(error);
            });
        });

        return d.promise();
    }

    function processSlicerError(result) {

        let id = 'SLICER_ERROR',
        message = lang.slicer.error[result.error] || result.info;
        if (result.error === ErrorConstants.INVALID_PARAMETER) {
            message = `${message} ${result.info}`;
        }
        if (!message) {
            message = result.error;
        }
        AlertActions.showPopupError(id, message);
    }

    function allOutOfBound() {
        return !objects.some((o) => {
            return !o.position.isOutOfBounds;
        });
    }

    function addPoint(p) {
        let g = new THREE.BoxGeometry(1,1,1);
        let m = new THREE.MeshBasicMaterial({ color: 0x444444 });
        let cube = new THREE.Mesh(g, m);
        cube.position.x = p.x;
        cube.position.y = p.y;
        cube.position.z = 0.5;
        cube.up = new THREE.Vector3(0, 0, 1);
        scene.add(cube);
        render();
    }

    function getMousePosition( dom, x, y ) {
        let rect = dom.getBoundingClientRect();
        return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
    }

    function getIntersects( point, o ) {
        mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
        raycaster.setFromCamera( mouse, camera );
        return raycaster.intersectObjects( o );
    };

    function getBoundingBox(obj) {
        let box3 = new THREE.Box3(),
            size = new THREE.Vector3();

        let boundingBox = new THREE.BoxHelper(obj);
        box3.setFromObject(boundingBox);
        box3.getSize(size);
        return { box: box3, size };
    }

    return {
        init                : init,
        appendModel         : appendModel,
        appendModels        : appendModels,
        setRotation         : setRotation,
        setScale            : setScale,
        alignCenter         : alignCenter,
        removeSelected      : removeSelected,
        duplicateSelected   : duplicateSelected,
        setSize             : setSize,
        downloadFCode       : downloadFCode,
        setRotateMode       : setRotateMode,
        setScaleMode        : setScaleMode,
        setAdvanceParameter : setAdvanceParameter,
        setParameter        : setParameter,
        getFCode            : getFCode,
        getModelCount       : getModelCount,
        togglePreview       : togglePreview,
        changePreviewLayer  : changePreviewLayer,
        setCameraPosition   : setCameraPosition,
        clearSelection      : clearSelection,
        clear               : clear,
        toggleScaleLock     : toggleScaleLock,
        getSlicingStatus    : getSlicingStatus,
        cancelPreview       : cancelPreview,
        doFCodeImport       : doFCodeImport,
        willUnmount         : willUnmount,
        downloadScene       : downloadScene,
        loadScene           : loadScene,
        undo                : undo,
        addHistory          : addHistory,
        clearScene          : clearScene,
        changeEngine        : changeEngine,
        takeSnapShot        : takeSnapShot,
        startSlicing        : startSlicing
    };
});
