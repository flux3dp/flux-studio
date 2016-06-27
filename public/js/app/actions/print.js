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
    'helpers/packer',
    'helpers/i18n',
    'helpers/nwjs/menu-factory',
    'app/actions/global-actions',
    'helpers/sprintf',
    'helpers/packer',
    'Rx',
    'app/app-settings',
    // non-return value
    'threeOrbitControls',
    'threeTrackballControls',
    'threeTransformControls',
    'threeSTLLoader',
    'threeOBJLoader',
    'threeCircularGridHelper',
    'plugins/file-saver/file-saver.min',
    'lib/Canvas-To-Blob',
    'helpers/object-assign'
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
    Packer,
    I18n,
    MenuFactory,
    GlobalActions,
    Sprintf,
    packer,
    Rx,
    Settings
) {
    'use strict';

    var THREE = window.THREE || {},
        container, slicer, fcodeConsole;

    var camera, scene, outlineScene;
    var orbitControl, transformControl, reactSrc;

    var objects = [],
        referenceMeshes = [];

    var raycaster = new THREE.Raycaster(),
        mouse = new THREE.Vector2(),
        renderer = new THREE.WebGLRenderer();

    var circularGridHelper, mouseDown, SELECTED;

    var movingOffsetX, movingOffsetY, panningOffset, originalCameraPosition, originalCameraRotation,
        scaleBeforeTransformX, scaleBeforeTransformY, scaleBeforeTransformZ;

    var _id = 'PRINT.JS',
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
        history = [],
        lang = I18n.get();

    var s = {
        diameter: 170,
        radius: 85,
        height: 180,
        step: 10,
        upVector: new THREE.Vector3(0, 0, 1),
        color: Settings.print_config.color_base_plate,
        opacity: 0.2,
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

    var commonMaterial = new THREE.MeshPhongMaterial({
        color: s.objectColor,
        specular: Settings.print_config.color_object,
        shininess: 1
    });

    var slicingType = {
        F: 'f',
        G: 'g'
    };

    var models = [];

    previewColors[0] = new THREE.Color(Settings.print_config.color_infill);
    previewColors[1] = new THREE.Color(Settings.print_config.color_perimeter);
    previewColors[2] = new THREE.Color(Settings.print_config.color_support);
    previewColors[3] = new THREE.Color(Settings.print_config.color_move);
    previewColors[4] = new THREE.Color(Settings.print_config.color_skirt);
    previewColors[5] = new THREE.Color(Settings.print_config.color_perimeter);

    function init(src) {

        reactSrc = src;
        container = document.getElementById('model-displayer');

        camera = new THREE.PerspectiveCamera(60, (container.offsetWidth) / container.offsetHeight, 1, 30000);
        camera.position.set(0, -200, 100);
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

        var geometry = new THREE.CircleGeometry(s.radius, 80),
            material = new THREE.MeshBasicMaterial({
                color: 0xCCCCCC,
                transparent: true
            }),
            refMesh = new THREE.Mesh(geometry, material);

        refMesh.up = new THREE.Vector3(0, 0, 1);
        refMesh.visible = false;
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
        // renderer = new THREE.WebGLRenderer();
        renderer.autoClear = false;
        renderer.setClearColor(0xE0E0E0, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);

        orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControl.maxPolarAngle = Math.PI / 4 * 3;
        orbitControl.maxDistance = 1000;
        orbitControl.noKeys = true;
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
        slicingStatus.canInterrupt = true;
        slicingStatus.inProgress = false;
        slicingStatusStream.onNext(slicingStatus);

        if(!slicer) {
            slicer = printSlicing();
        }

        registerDragToImport();
        reactSrc.setState({
            camera: camera,
            updateCamera: true
        });
    }

    function uploadStl(name, file, ext) {
        // pass to slicer
        var d = $.Deferred();
        slicer.upload(name, file, ext, displayProgress).then((result) => {
            ProgressActions.updating('finishing up', 100);
            d.resolve(result);
        });
        return d.promise();
    }

    function appendModel(fileUrl, file, ext, callback) {
        if(file.size === 0) {
            AlertActions.showPopupError('', lang.message.invalidFile);
            return;
        }
        var stlLoader = new THREE.STLLoader(),
            objLoader = new THREE.OBJLoader(),
            model_file_path = fileUrl;

        callback = callback || function() {};

        var loadGeometry = function(geometry) {
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
            var mesh = new THREE.Mesh(geometry, commonMaterial);
            mesh.up = new THREE.Vector3(0, 0, 1);

            slicingStatus.pauseReport = true;
            uploadStl(mesh.uuid, file, ext).then(function(result) {
                slicingStatus.pauseReport = false;
                if (result.status !== 'ok') {
                    ProgressActions.close();
                    reactSrc.setState({
                        openImportWindow: true,
                        openObjectDialogue: false
                    });
                    AlertActions.showPopupError('', result.error);
                    return;
                }
                if(slicingStatus.canInterrupt) {
                    startSlicing(slicingType.F);
                }
                ProgressActions.close();
                callback();
            });

            geometry.center();

            // normalize - resize, align
            var box = new THREE.Box3().setFromObject(mesh),
                enlarge = parseInt(box.size().x) !== 0 && parseInt(box.size().y) !== 0 && parseInt(box.size().z) !== 0,
                scale;

            scale = getScaleDifference(
                enlarge ?
                getLargestPropertyValue(box.size()) :
                getSmallestPropertyValue(box.size())
            );

            // alert for auto scalling
            if(scale === Infinity) {
                reactSrc.setState({
                    openImportWindow: true,
                    openObjectDialogue: false
                }, function() {
                    AlertActions.showPopupError('', lang.message.slicingFailed);
                });
                return;
            }
            else if (scale !== 1) {
                console.log('this model has been scaled for better printing ratio');
            }

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

            if (mesh.geometry.type !== 'Geometry') {
                mesh.geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
            }

            mesh.name = 'custom';
            mesh.file = file;
            mesh.fileName = file.name;
            mesh.plane_boundary = planeBoundary(mesh);

            autoArrange(mesh);
            addSizeProperty(mesh);
            groundIt(mesh);
            selectObject(mesh);
            createOutline(mesh);

            scene.add(mesh);
            outlineScene.add(mesh.outlineMesh);
            objects.push(mesh);
            reactSrc.setState({
                hasObject: true
            });

            setDefaultFileName();
            render();
        }

        reactSrc.setState({
            openImportWindow: false
        });

        if(ext === 'obj') {
            objLoader.load(model_file_path, (object) => {
                var meshes = object.children.filter(c => c instanceof THREE.Mesh);
                if(meshes.length > 0) {
                    loadGeometry(new THREE.Geometry().fromBufferGeometry(meshes[0].geometry))
                }
                // loadGeometry(new THREE.Geometry().fromBufferGeometry(.geometry))
            });
        }
        else {
            stlLoader.load(model_file_path, (geometry) => {
                loadGeometry(geometry);
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

        var t = setInterval(function() {
            if(slicingStatus.canInterrupt) {
                clearInterval(t);
                var file = files.item ? files.item(index) : files[index];
                models.push(file);
                slicingStatus.canInterrupt = false;
                var ext = file.name.split('.').pop().toLowerCase();
                if(ext === 'stl' || ext === 'obj') {
                    var reader  = new FileReader();
                    reader.addEventListener('load', function () {
                        appendModel(reader.result, file, ext, function() {
                            slicingStatus.canInterrupt = true;
                            if(files.length > index + 1) {
                                appendModels(files, index + 1, callback);
                            }
                            else {
                                slicingStatus.canInterrupt = true;
                                startSlicing(slicingType.F);
                                callback();
                            }
                        });
                    }, false);

                    reader.readAsDataURL(file);
                }
                else if (ext === 'fc' || ext === 'gcode') {
                    slicingStatus.canInterrupt = true;
                    slicingStatus.isComplete = true;
                    importedFCode = files.item(0);
                    importFromFCode = true;
                    setDefaultFileName(importedFCode.name)
                    if(objects.length === 0) {
                        doFCodeImport(ext);
                    }
                    else {
                        AlertActions.showPopupYesNo(
                            GlobalConstants.IMPORT_FCODE,
                            lang.message.confirmFCodeImport);
                    }
                    callback();
                }
                else if (ext === 'fsc') {
                    slicingStatus.canInterrupt = true;
                    importedScene = files.item(0);
                    setDefaultFileName(importedScene.name);
                    if(objects.length === 0) {
                        _handleLoadScene(importedScene);
                    }
                    else {
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
                    slicingStatus.canInterrupt = true;
                    callback();
                }
            }
        });
    }

    function appendPreviewPath(file, callback, isGcode) {
        var metadata,
            reader = new FileReader();

        reader.addEventListener('load', function() {
            fcodeConsole.upload(reader.result, file.size, function(result) {
                // if there's a result
                if(!!result) {
                    if(!!result.error) {
                        if(result.error === 'gcode area too big') {
                            // disable go button
                            reactSrc.setState({ hasObject: false });
                        }
                        else {
                            AlertActions.showPopupError('fcode-error', Sprintf(lang.message.brokenFcode, file.name));
                            cancelPreview();
                        }
                    }
                }
                fcodeConsole.getMetadata(processMetadata);
            }, isGcode);
        });

        var processMetadata = function(m) {
            metadata = m;
            var fcodeType = m.metadata.HEAD_TYPE;
            if(fcodeType === 'EXTRUDER') {
                fcodeConsole.getPath().then(processPath);
            }
            else {
                var message = fcodeType === 'LASER' ? lang.message.fcodeForLaser : lang.message.fcodeForPen;
                ProgressActions.close();
                importFromFCode = false;
                importFromGCode = false;
                previewMode = false;
                _exitImportFromFCodeMode();
                AlertActions.showPopupInfo('', message);
            }
        };

        var processPath = function(path) {
            previewMode = true;
            printPath = path;
            _drawPathFromFCode();

            // update the preview image
            getBlobFromScene().then((blob) => {
                if(blob instanceof Blob) {
                    previewUrl = URL.createObjectURL(blob);
                    var d = fcodeConsole.changeImage(blob);

                    d.then(() => {
                        blobExpired = false;
                        responseBlob = new Blob([reader.result]);
                        GlobalActions.sliceComplete(metadata);
                    });

                    d.catch((error) => {
                        console.log('error from change image', error);
                    });
                }
            });
        };

        reader.readAsArrayBuffer(file);
    }

    function startSlicing(type) {
        slicingStatus.inProgress    = true;
        slicingStatus.canInterrupt  = false;
        slicingStatus.pauseReport   = true;
        slicingStatus.hasError      = false;
        slicingStatus.isComplete    = false;
        blobExpired                 = true;
        willReslice                 = false;

        slicingStatusStream.onNext(slicingStatus);

        if(objects.length === 0 || !blobExpired) { return; }
        var ids = [];
        objects.forEach(function(obj) {
            if(!obj.position.isOutOfBounds) {
                ids.push(obj.uuid);
            }
        });

        if(previewMode) {
            _clearPath();
            _showPreview();
        }

        syncObjectParameter().then(function() {
            return stopSlicing();
        }).then(function() {
            // set again because stop slicing set inProgress to false
            slicingStatus.inProgress = true;
            slicingStatusStream.onNext(slicingStatus);
            slicer.beginSlicing(ids, slicingType.F).then(function(response) {
                slicingStatus.canInterrupt = true;
                slicingStatus.pauseReport = false;
                if(response.status === 'fatal') {
                    AlertActions.showPopupError('slicingFatalError', lang.message.slicingFatalError);
                    return;
                }
                getSlicingReport(function(report) {
                    slicingStatus.lastReport = report;
                    updateSlicingProgressFromReport(report);
                });
            });
        });
    }

    function takeSnapShot() {
        var d = $.Deferred(),
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

            var t = setInterval(() => {
                if(slicingStatus.canInterrupt && slicingStatus.isComplete) {
                    slicingStatus.showProgress = false;
                    slicingStatus.canInterrupt = false;
                    clearInterval(t);
                    slicer.uploadPreviewImage(blob).then(() => {
                        slicingStatus.canInterrupt = true;
                        return slicer.getSlicingResult();
                    }).then((r) => {
                        responseBlob = r;
                        d.resolve(blob);
                    });
                }
            }, 500);
        });
        return d.promise();
    }

    function doSlicing() {
        _clearPath();
        blobExpired = true;
        hasPreviewImage = false;
        willReslice = true;

        if(slicingStatus.inProgress) {
            clearTimeout(slicingTimmer);
            slicingTimmer = setTimeout(function() {
                var t = setInterval(function() {
                    if(slicingStatus.canInterrupt) {
                        clearInterval(t);
                        slicingStatus.isComplete = false;
                        startSlicing(slicingType.F);
                    }
                }, 500);
            }, slicingWaitTime);
        }
        else {
            var t = setInterval(function() {
                if(slicingStatus.canInterrupt) {
                    clearInterval(t);
                    slicingStatus.isComplete = false;
                    startSlicing(slicingType.F);
                }
            }, 500);
        }
    }

    function updateSlicingProgressFromReport(report) {
        slicingStatus.inProgress = true;
        slicingStatusStream.onNext(slicingStatus);

        if(slicingStatus.needToCloseWait) {
            ProgressActions.close();
            slicingStatus.needToCloseWait = false;
        }

        var progress = `${lang.slicer[report.slice_status]} - ${'\n' + parseInt(report.percentage * 100)}% - ${report.message}`,
            complete = lang.print.finishingUp,
            show = slicingStatus.showProgress,
            monitorOn = $('.flux-monitor').length > 0;

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

            if(report.error === 'gcode area too big') {
                slicingStatus.lastReport.error = lang.message.gCodeAreaTooBigMessage;
                slicingStatus.lastReport.caption = lang.message.gCodeAreaTooBigCaption;
            }
            else {
                slicingStatus.lastReport.caption = lang.alert.error;
            }

            if(show || previewMode) {
                setTimeout(() => {
                    ProgressActions.close();
                }, 0);
                if(previewMode) {
                    _closePreview();
                    togglePreview();
                }
            }
            slicingStatus.hasError = true;
            AlertActions.showPopupError('', slicingStatus.lastReport.error, slicingStatus.lastReport.caption);
            slicingStatus.lastProgress = '';
            reactSrc.setState({ hasOutOfBoundsObject: true });
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
            if(show) {
                ProgressActions.updating(complete, 100);
            }
            slicingStatus.canInterrupt = false;
            slicer.getSlicingResult().then(function(r) {
                slicingStatus.canInterrupt = true;
                setTimeout(function() {
                    if(needToShowMonitor) {
                        reactSrc._handleDeviceSelected();
                        needToShowMonitor = false;
                    }
                }, 1000);

                blobExpired = false;
                responseBlob = r;
                _handleSliceComplete();

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
            var zone = document.querySelector('.studio-container.print-studio');
            zone.addEventListener('dragenter', onDragEnter);
            zone.addEventListener('dragover', onDragEnter);
            zone.addEventListener('dragleave', onDragLeave);
            zone.addEventListener('drop', onDropFile);
        }
    }

    function unregisterDragToImport() {
        var zone = document.querySelector('.studio-container.print-studio');
        zone.removeEventListener('dragenter', onDragEnter);
        zone.removeEventListener('dragover', onDragEnter);
        zone.removeEventListener('dragleave', onDragLeave);
        zone.removeEventListener('drop', onDropFile);
    }

    function onDropFile(e) {
        e.preventDefault();
        $('.import-indicator').hide();
        if(previewMode) { return; }
        var files = e.dataTransfer.files;
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
        var intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {

            var target = intersects[0].object;
            var location = getReferenceIntersectLocation(e);
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

        if(SELECTED.uuid) {
            addHistory();
        }
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
        reactSrc.setState({
            isTransforming: false,
            updateCamera: false
        });
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
                var location = getReferenceIntersectLocation(e);
                if (SELECTED.position && location) {
                    SELECTED.position.x = location.x - movingOffsetX;
                    SELECTED.position.y = location.y - movingOffsetY;
                    SELECTED.outlineMesh.position.x = location.x - movingOffsetX;
                    SELECTED.outlineMesh.position.y = location.y - movingOffsetY;
                    blobExpired = true;
                    hasPreviewImage = false;
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
        if(previewMode) { return; }
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
                        var s = e.target.object.size;
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
        var offx = 0,
            offy = 0;

        var vector = new THREE.Vector3(
            ((e.offsetX - offx) / container.offsetWidth) * 2 - 1, -((e.offsetY - offy) / container.offsetHeight) * 2 + 1,
            0.5
        ).unproject(camera);

        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = ray.intersectObjects(referenceMeshes);

        if (intersects.length > 0) {
            return intersects[0].point;
        }
    }

    // calculate the distance from reference mesh
    function getReferenceDistance(mesh) {
        if (mesh) {
            var ref = {},
                box = new THREE.Box3().setFromObject(mesh);
            ref.x = box.center().x;
            ref.y = box.center().y;
            ref.z = box.min.z;
            return ref;
        }
    }

    function getFileByteArray(filePath) {
        getFileObject(filePath, function(fileObject) {
            var reader = new FileReader();

            reader.onload = function(e) {
                var arrayBuffer = reader.result;
            };

            reader.readAsArrayBuffer(fileObject);
        });
    }

    // compare and return the largest axis value (for scaling)
    function getLargestPropertyValue(obj) {
        var v = 0;
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (obj[property] > v) {
                    v = obj[property];
                }
            }
        }
        return v;
    }

    function getSmallestPropertyValue(obj) {
        var v = 1;
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (obj[property] < v) {
                    v = obj[property];
                }
            }
        }
        return v;
    }

    // return the scale to fit the area
    function getScaleDifference(value) {
        var done = false,
            scale = 1;

        // if loaded object is smaller, enlarge it. offset by *10
        if (value < s.diameter) {
            while(!done) {
                if (value * scale < s.allowedMin) {
                    scale = scale * 10;
                }
                else {
                    done = true;
                }
            }

            return scale;
        }
        // if loaded object exceed printed area, shrink it (no offset)
        else {
            while (!done) {
                if (value / scale < s.diameter) {
                    done = true;
                } else {
                    scale = scale * 10;
                }
            }
            return 1 / scale;
        }
    }

    function getGCode() {
        var d = $.Deferred();
        var ids = [];

        objects.forEach(function(obj) {
            ids.push(obj.uuid);
        });

        ProgressActions.open(
            ProgressConstants.STEPPING,
            lang.monitor.processing,
            lang.monitor.savingPreview,
            !showStopButton
        );

        getBlobFromScene().then(function(blob){
            cropImageUsingCanvas(blob).then(function(blob) {
                reactSrc.setState({ previewUrl: URL.createObjectURL(blob) });
                return slicer.uploadPreviewImage(blob);
            }).then(function(response) {
                if (response.status === 'ok') {
                    syncObjectParameter().then(function() {
                        return slicer.goG(ids);
                    }).then((result) => {
                        if (result instanceof Blob) {
                            blobExpired = false;
                            responseBlob = result;
                            ProgressActions.close();
                            d.resolve(result);
                        }
                        else {
                            if (result.status !== 'error') {
                                var serverMessage = `${result.status}: ${result.message} (${parseInt(result.percentage * 100)}%)`,
                                    drawingMessage = `Finishing up... (100%)`,
                                    message = result.status !== 'complete' ? serverMessage : drawingMessage;
                                if(!willReslice) {
                                    ProgressActions.updating(message, parseInt(result.percentage * 100));
                                }
                            }
                            else {
                                ProgressActions.close();
                            }
                        }
                    });
                }
                // error
                else {
                    _setProgressMessage('');
                    d.resolve(result);
                }
            });
        });

        return d.promise();
    }

    function getFCode() {
        console.log('get fcode');
        var d = $.Deferred();

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

        var execute = () => {
            if(slicingStatus.inProgress) {
                _showWait(lang.print.gettingSlicingReport, !showStopButton);
                slicingStatus.showProgress = true;
                var subscriber = slicingStatusStream.subscribe((status) => {
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
            var t = setInterval(() => {
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
        var reportTimmer = 1000; // 1 sec

        slicingStatus.reporter = setInterval(function() {
            if(!slicingStatus.pauseReport) {
                if(willReslice) {
                    return;
                }
                if(slicingStatus.canInterrupt) {
                    slicingStatus.canInterrupt = false;
                    slicingStatus.pauseReport = true;
                    slicer.reportSlicing(function(report) {
                        slicingStatus.canInterrupt = true;
                        slicingStatus.pauseReport = false;
                        if(!report) { return; }
                        if(report.slice_status === 'complete') {
                            clearInterval(slicingStatus.reporter);
                            slicingStatus.isComplete = true;
                            blobExpired = false;
                            callback(report);
                        }
                        else if(report.slice_status !== 'ok') {
                            callback(report);
                        }
                    });
                }
            }
        }, reportTimmer);

    }

    function getModelCount() {
        return objects.length;
    }

    // SET section ---

    function resetObject() {
        if(SELECTED) {
            var s = SELECTED.scale;
            setScale(s._x, s._y, s._z, true, true);
            setRotation(0, 0, 0, true);
            groundIt(SELECTED);
            alignCenter();
            selectObject(null);
        }
    }

    function setMousePosition(e) {
        var offx = 0,
            offy = 0;

        mouse.x = ((e.offsetX - offx) / container.offsetWidth) * 2 - 1;
        mouse.y = -((e.offsetY - offy) / container.offsetHeight) * 2 + 1;
    }

    function setScale(x, y, z, isLocked, center, src) {
        src = src || SELECTED
        var originalScaleX = src.scale._x;
        var originalScaleY = src.scale._y;
        var originalScaleZ = src.scale._z;
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
            src.plane_boundary = planeBoundary(src);
            groundIt(src);
            checkOutOfBounds(src);
            render();
        }
    }

    function setSize(size, isLocked, src) {
        // if(!mouseDown) {
        //     addHistory();
        // }

        var o = { size: {} };
        Object.assign(o.size, size);

        src = src || SELECTED;
        var objectChanged = _objectChanged(src, o);
        if(objectChanged) {
            isLocked = isLocked || true;
            var sx = Math.round(size.x / src.size.originalX * 1000) / 1000,
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
        var d = $.Deferred();
        slicingStatus.pauseReport = true;

        var t = setInterval(function() {
            if(slicingStatus.canInterrupt) {
                clearInterval(t);
                slicingStatus.canInterrupt = false;
                slicer.setParameter('advancedSettings', settings.custom).then(function(result, errors) {
                    slicingStatus.canInterrupt = true;
                    slicingStatus.showProgress = false;
                    slicingStatus.pauseReport = false;
                    if(objects.length > 0) {
                        doSlicing();
                    }
                    if(errors.length > 0) {
                        AlertActions.showPopupError(_id, errors.join('\n'));
                    }
                    d.resolve('');
                });
                blobExpired = true;
                hasPreviewImage = false;
                slicingStatus.pauseReport = false;
            }
        }, 500);

        return d.promise();
    }

    function setParameter(name, value) {
        slicingStatus.pauseReport = true;
        var d = $.Deferred();
        blobExpired = true;
        hasPreviewImage = false;

        var t = setInterval(function() {
            if(slicingStatus.canInterrupt) {
                clearInterval(t);
                slicer.setParameter(name, value).then(function() {
                    slicingStatus.showProgress = false;
                    slicingStatus.pauseReport = false;
                    if(objects.length > 0) {
                        doSlicing();
                    }
                    d.resolve('');
                });
            }
        }, 500);

        return d.promise();
    }

    function setRotation(x, y, z, needRender, src) {
        src = src || SELECTED;
        syncObjectOutline(src);

        var _x = parseInt(x) || 0,
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
            var position = toScreenPosition(referenceMeshes[0], camera),
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
        var o = obj || SELECTED;

        if (!$.isEmptyObject(o)) {

            var box = new THREE.BoundingBoxHelper(o, s.colorSelected),
                position = toScreenPosition(o, camera),
                cameraDistance = 0,
                objectDialogueDistance = 0;

            box.update();
            cameraDistance = 320 / Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2) + Math.pow(camera.position.z, 2));
            objectDialogueDistance = cameraDistance * 1.2 * Math.sqrt(Math.pow(box.box.size().x, 2) + Math.pow(box.box.size().y, 2)) + 15;
            objectDialogueDistance = parseInt(objectDialogueDistance);

            reactSrc.setState({
                modelSelected: o,
                openObjectDialogue: true
            }, function() {
                var objectDialogue = document.getElementsByClassName('object-dialogue')[0],
                    objectDialogueWidth = parseInt($(objectDialogue).width()),
                    objectDialogueHeight = parseInt($(objectDialogue).height()),
                    leftOffset = parseInt(position.x),
                    topOffset = (parseInt(position.y) - objectDialogueHeight / 2),
                    marginTop = container.offsetHeight / 2 - position.y;

                var rightLimit = container.offsetWidth - objectDialogueWidth - leftOffset,
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
            var reference = getReferenceDistance(SELECTED);
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
            var reference = getReferenceDistance(mesh);
            mesh.position.z -= reference.z;
            if(mesh.outlineMesh) {
                mesh.outlineMesh.position.z -= reference.z;
            }
            blobExpired = true;
            hasPreviewImage = false;
        }
    }

    function setDefaultFileName(fileNameWithExtension) {
        if(!fileNameWithExtension) {
            if(objects.length) {
                defaultFileName = objects[0].fileName;
                defaultFileName = defaultFileName.split('.');
                defaultFileName.pop();
                defaultFileName = defaultFileName.join('.');
            }
        }
        else {
            var name = fileNameWithExtension.split('.');
            name.pop();
            name = name.join('.');
            defaultFileName = name;
        }
    }

    function removeSelected() {
        if (SELECTED && Object.keys(SELECTED).length > 0) {
            var index,
                uuid = SELECTED.uuid;

            scene.remove(SELECTED.outlineMesh);
            scene.remove(SELECTED);
            outlineScene.remove(SELECTED.outlineMesh);
            index = objects.indexOf(SELECTED);
            if (index > -1) {
                objects.splice(index, 1);
            }

            transformControl.detach(SELECTED);
            selectObject(null);

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
            var mesh = new THREE.Mesh(SELECTED.geometry, SELECTED.material);
            mesh.up = new THREE.Vector3(0, 0, 1);

            slicer.duplicate(SELECTED.uuid, mesh.uuid).then(function(result) {
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

                    selectObject(null);
                    selectObject(mesh);

                    scene.add(mesh);
                    outlineScene.add(mesh.outlineMesh);
                    objects.push(mesh);

                    render();
                    doSlicing();
                }
                else {
                    AlertActions.showPopupError('duplicateError', result.error);
                }
            });
        }
    }

    function planeBoundary(sourceMesh) {
        // ref: http://www.csie.ntnu.edu.tw/~u91029/ConvexHull.html#4
        // Andrew's Monotone Chain


        // sort the index of each point in stl
        var stl_index = [];
        var boundary = [];
        if (sourceMesh.geometry.type === 'Geometry') {
            // define Cross product function on 2d plane
            var cross = (function cross(p0, p1, p2) {
                return ((p1.x - p0.x) * (p2.y - p0.y)) - ((p1.y - p0.y) * (p2.x - p0.x));
            });

            for (var i = 0; i < sourceMesh.geometry.vertices.length; i += 1) {
              stl_index.push(i);
            }
            stl_index.sort(function(a, b) {
                if (sourceMesh.geometry.vertices[a].y === sourceMesh.geometry.vertices[b].y) {
                    return sourceMesh.geometry.vertices[a].x - sourceMesh.geometry.vertices[b].x;
                }
                return sourceMesh.geometry.vertices[a].y - sourceMesh.geometry.vertices[b].y;
            });

            // find boundary

            // compute upper hull
            for (var i = 0; i < stl_index.length; i += 1) {
              while( boundary.length >= 2 && cross(sourceMesh.geometry.vertices[boundary[boundary.length - 2]], sourceMesh.geometry.vertices[boundary[boundary.length - 1]], sourceMesh.geometry.vertices[stl_index[i]]) <= 0){
                boundary.pop();
              }
                boundary.push(stl_index[i]);
            }
            // compute lower hull
            var t = boundary.length + 1;
            for (var i = stl_index.length - 2 ; i >= 0; i -= 1) {
                while( boundary.length >= t && cross(sourceMesh.geometry.vertices[boundary[boundary.length - 2]], sourceMesh.geometry.vertices[boundary[boundary.length - 1]], sourceMesh.geometry.vertices[stl_index[i]]) <= 0){
                    boundary.pop();
                }
                boundary.push(stl_index[i]);
            }
            // delete redundant point(i.e., starting point)
            boundary.pop();
        }
        else{
            // define Cross product function on 2d plane for buffergeometry
            var cross = (function cross(sm, p0, p1, p2) {

                return ((sm.geometry.attributes.position.array[p1 * 3 + 0] - sm.geometry.attributes.position.array[p0 * 3 + 0]) *
                        (sm.geometry.attributes.position.array[p2 * 3 + 1] - sm.geometry.attributes.position.array[p0 * 3 + 1])) -
                       ((sm.geometry.attributes.position.array[p1 * 3 + 1] - sm.geometry.attributes.position.array[p0 * 3 + 1]) *
                        (sm.geometry.attributes.position.array[p2 * 3 + 0] - sm.geometry.attributes.position.array[p0 * 3 + 0]))
            });

            for (var i = 0; i < sourceMesh.geometry.attributes.position.length / sourceMesh.geometry.attributes.position.itemSize; i += 1) {
              stl_index.push(i);
            }

            stl_index.sort(function(a, b) {
                if (sourceMesh.geometry.attributes.position.array[a * 3 + 1] === sourceMesh.geometry.attributes.position.array[b * 3 + 1]) {
                    return sourceMesh.geometry.attributes.position.array[a * 3 + 0] - sourceMesh.geometry.attributes.position.array[b * 3 + 0];
                }
                return sourceMesh.geometry.attributes.position.array[a * 3 + 1] - sourceMesh.geometry.attributes.position.array[b * 3 + 1];
            });

            // find boundary

            // compute upper hull
            for (var i = 0; i < stl_index.length; i += 1) {
              while( boundary.length >= 2 && cross(sourceMesh, boundary[boundary.length - 2], boundary[boundary.length - 1], stl_index[i]) <= 0){
                boundary.pop();
              }
                boundary.push(stl_index[i]);
            }
            // compute lower hull
            var t = boundary.length + 1;
            for (var i = stl_index.length - 2 ; i >= 0; i -= 1) {
                while( boundary.length >= t && cross(sourceMesh, boundary[boundary.length - 2], boundary[boundary.length - 1], stl_index[i]) <= 0){
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
        var d = $.Deferred();
        if (!$.isEmptyObject(sourceMesh)) {
            var vector = new THREE.Vector3();
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

            var hasOutOfBoundsObject = objects.some(function(o) {
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
        var _objects,
            collided = false,
            sourceBox;

        _objects = objects.filter(function(o) {
            return o.uuid !== src.uuid;
        });

        sourceBox = new THREE.BoundingBoxHelper(src, s.colorSelected);
        sourceBox.update();
        sourceBox.box.intersectsBox = function ( box ) {

		// using 6 splitting planes to rule out intersections.

    		if ( box.max.x < this.min.x || box.min.x > this.max.x ||
				 box.max.y < this.min.y || box.min.y > this.max.y ||
				 box.max.z < this.min.z || box.min.z > this.max.z ) {

    			return false;
    		}
    		return true;
    	};

        for(var i = 0; i < _objects.length; i++) {
            if(!collided) {
                var box = new THREE.BoundingBoxHelper(_objects[i], s.colorSelected);
                box.update();
                if(sourceBox.box.intersectsBox(box.box)) {
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
        var level = 1,
            spacing = 2,
            inserted = false,
            target = new THREE.BoundingBoxHelper(model),
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

        target.update();
        mover = function(ref, method) {
            var size = ref.box.size();
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
                var ref = new THREE.BoundingBoxHelper(collideObject, s.colorSelected);
                ref.update();
                mover(ref, 1);
            }
        });

    }

    function syncObjectParameter() {
        var d = $.Deferred();
        _syncObjectParameter(objects, 0, function() {
            d.resolve('');
        });

        return d.promise();
    }

    function downloadGCode(fileName) {
        if(!fileName) {
            fileName = defaultFileName;
        }

        fileName = fileName + '.gcode';

        blobExpired = true;
        hasPreviewImage = false;
        selectObject(null);
        var d = $.Deferred();
        if(objects.length > 0) {
            if (!blobExpired) {
                d.resolve(saveAs(responseBlob, fileName));
            } else {
                getGCode().then(function(blob) {
                    if (blob instanceof Blob) {
                        _setProgressMessage('');
                        d.resolve(saveAs(blob, fileName));
                    }
                });
            }

            return d.promise();
        }
        else {
            d.resolve('');
            return d.promise();
        }
    }

    function downloadFCode(fileName) {
        if(!fileName) {
            fileName = defaultFileName;
        }

        fileName = fileName + '.fc';

        selectObject(null);
        var d = $.Deferred();
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
                getFCode().then(function(blob) {
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
        var ccp = camera.position.clone(),
            ccr = camera.rotation.clone(),
            d = $.Deferred(),
            ol = _getCameraLook(camera);

        camera.position.set(0, -180, 60);
        camera.rotation.set(originalCameraRotation.x, originalCameraRotation.y, originalCameraRotation.z, originalCameraRotation.order);
        camera.lookAt(new THREE.Vector3(0,380,0));
        render();

        // var s = SELECTED;
        toggleTransformControl(true);
        renderer.domElement.toBlob(function(blob) {
            previewUrl = URL.createObjectURL(blob);
            camera.position.set(ccp.x, ccp.y, ccp.z);
            camera.rotation.set(ccr.x, ccr.y, ccr.z, ccr.order);
            camera.lookAt(ol);
            toggleTransformControl(false);
            render();
            d.resolve(blob);
        });

        return d.promise();
    }


    function cropImageUsingCanvas(data, is_image){
        if(!is_image){
            var newImg = document.createElement('img'),
                url = URL.createObjectURL(blob),
                d = $.Deferred();
            newImg.onload = function() {
                URL.revokeObjectURL(url);
            };
            cropImageUsingCanvas(newImage, true).then(function(blob) {
                d.resolve(blob);
            });
            return d.promise();
        }

        var width = 640, height = 640,
            canvas = document.createElement('canvas'),
            sh = image.height,
            sw = image.width,
            sx = 0,
            sy = 0,
            d = $.Deferred();

        if(image.width > image.height){
            sx = (image.width - image.height)/2;
            sw = image.height;
        }else if(image.width < image.height){
            sy = (image.height - image.width)/2;
            sh = image.width;
        }

        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        context.drawImage(this.image, sx, sy, sw, sh, 0, 0, width, height);
        canvas.toBlob(function(blob) {
            d.resolve(blob);
        });
        return d.promise();
    }

    function removeFromScene(name) {
        for (var i = scene.children.length - 1; i >= 0; i--) {
            if (scene.children[i].name === name) {
                scene.children.splice(i, 1);
            }
        }
    }

    function updateFromScene(name) {
        for (var i = scene.children.length - 1; i >= 0; i--) {
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
        for (var i = 1; i < previewScene.children.length; i++) {
            previewScene.children[i].visible = i - 1 < layerNumber;
        }
        render();
    }

    function updateOrbitControl() {
        setObjectDialoguePosition();
        render();
        setImportWindowPosition();
        reactSrc.setState({
            camera: camera,
            updateCamera: true
        });
        panningOffset = camera.position.clone().sub(camera.position.raw);

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
        renderer.render( outlineScene, camera );

        renderer.clearDepth();
        renderer.render(previewMode ? previewScene : scene, camera);
    }

    function addSizeProperty(obj) {
        if (!$.isEmptyObject(obj)) {
            var boundingBox = new THREE.BoundingBoxHelper(obj);
            boundingBox.update();
            obj.size = boundingBox.box.size();
            obj.size.enteredX = boundingBox.box.size().x;
            obj.size.enteredY = boundingBox.box.size().y;
            obj.size.enteredZ = boundingBox.box.size().z;

            obj.size.originalX = boundingBox.box.size().x;
            obj.size.originalY = boundingBox.box.size().y;
            obj.size.originalZ = boundingBox.box.size().z;

            obj.size.transformedSize = {};
            obj.size.transformedSize.x = boundingBox.box.size().x;
            obj.size.transformedSize.y = boundingBox.box.size().y;
            obj.size.transformedSize.z = boundingBox.box.size().z;
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
        var degreeStep = shiftPressed ? 15 : s.degreeStep;
        return (parseInt(degree / degreeStep) * degreeStep);
    }

    function updateScaleWithStep(scale) {
        // if no decimal after scale precision, ex: 1.1, not 1.143
        if (parseInt(scale * Math.pow(10, s.scalePrecision)) === scale * Math.pow(10, s.scalePrecision)) {
            return scale;
        }
        return (parseInt(scale * Math.pow(10, s.scalePrecision)) + 1) / Math.pow(10, s.scalePrecision);
    }

    function updateObjectSize(src) {
        src.size.enteredX = src.scale.x * src.size.originalX;
        src.size.enteredY = src.scale.y * src.size.originalY;
        src.size.enteredZ = src.scale.z * src.size.originalZ;

        src.size.x = src.scale.x * src.size.originalX;
        src.size.y = src.scale.y * src.size.originalY;
        src.size.z = src.scale.z * src.size.originalZ;

        syncObjectOutline(src);

        reactSrc.setState({
            modelSelected: src
        });

    }

    function getLargestPropertyValue(obj) {
        var v = 0;
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (obj[property] > v) {
                    v = obj[property];
                }
            }
        }
        return v;
    }

    function updateObjectRotation(src) {
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
            var vector = new THREE.Vector3();

            // TODO: need to update this when resize window
            var widthHalf = 0.5 * container.offsetWidth;
            var heightHalf = 0.5 * container.offsetHeight;

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
            side: THREE.BackSide,
            wireframe: true,
            wireframeLinewidth: 5
        });
        var outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
        outlineMesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
        outlineMesh.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);
        outlineMesh.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
        outlineMesh.up = new THREE.Vector3(0, 0, 1);
        mesh.outlineMesh = outlineMesh;
        outlineScene.add(outlineMesh);

    }

    function syncObjectOutline(src) {
        src.outlineMesh.rotation.set(src.rotation.x, src.rotation.y, src.rotation.z, 'ZYX');
        src.outlineMesh.scale.set(src.scale.x, src.scale.y, src.scale.z);
        render();
    }

    function displayProgress(step, total) {
        if(step === total) {
            ProgressActions.updating(lang.print.uploaded, 80);
        }
    }

    function stopSlicing() {
        var d = $.Deferred();
        clearInterval(slicingStatus.reporter);
        if(slicingStatus.inProgress) {
            slicer.stopSlicing().then(function() {
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

    function downloadScene(fileName) {
        if(objects.length === 0) { return; }

        var parameter;
        packer.clear();

        if(objects.length > 0) {
            objects.forEach(function(model) {
                parameter = {};
                parameter.size = model.size;
                parameter.rotation = model.rotation;
                parameter.position = model.position;
                parameter.scale = model.scale;
                packer.addInfo(parameter);
                packer.addFile(model.file);
            });
        }
        var sceneFile = packer.pack();
        saveAs(sceneFile, fileName + '.fsc');
    }

    function loadScene() {
        clearScene();
        _handleLoadScene(importedScene);
    }

    function _handleLoadScene(sceneFile) {
        var packer = require('helpers/packer');

        packer.unpack(sceneFile).then(function(_sceneFile) {
            var files = _sceneFile[0];

            sceneFile = _sceneFile;

            appendModels(files, 0, function() {
                updateObject();
            });
        });

        var updateObject = function() {
            sceneFile.shift();
            objects.forEach(function(obj, i) {
                var ref = sceneFile[i];

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
            slicer.set(
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
            ).then(function(result) {
                if (result.status === 'error') {
                    index = o.length;
                }
                if (index < o.length) {
                    _syncObjectParameter(o, index + 1, callback);
                }
            });
        } else {
            callback();
        }
    }

    function _addShadowedLight(x, y, z, color, intensity) {
        var directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z);

        scene.add(directionalLight);
        directionalLight.castShadow = true;

        var d = 1;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;

        directionalLight.shadowCameraNear = 1;
        directionalLight.shadowCameraFar = 4;

        directionalLight.shadowMapWidth = 1024;
        directionalLight.shadowMapHeight = 1024;

        directionalLight.shadowBias = -0.005;
        directionalLight.shadowDarkness = 0.15;

        directionalLight.shadowCameraVisible = true;
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
            slicingStatus.canInterrupt = false;
            slicer.getPath().then(function(result) {
                slicingStatus.canInterrupt = true;
                printPath = result;
                _drawPath().then(function() {
                    ProgressActions.close();
                    slicingStatus.showProgress = false;
                });
            });
        }
        else {
            slicingStatus.isComplete = true;
            ProgressActions.close();
        }

        console.log('erasing last report');
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

    function addHistory() {
        if(SELECTED) {
            var entry = { size: {}, rotation: {}, position: {}, scale: {} };
            entry.uuid = SELECTED.uuid;
            Object.assign(entry.position, SELECTED.position);
            Object.assign(entry.size, SELECTED.size);
            Object.assign(entry.rotation, SELECTED.rotation);
            Object.assign(entry.scale, SELECTED.scale);
            history.push(entry);
        }
    }

    function undo() {
        if(history.length > 0) {
            var entry = history.pop();
            objects.forEach(function(model) {
                if(model.uuid === entry.uuid) {
                    _setObject(entry, model);
                    setObjectDialoguePosition(model);
                    selectObject(model);
                }
            });
        }
    }

    function clearScene() {
        objects.length = 0;
        outlineScene.children.length = 0;
        for(var i = scene.children.length - 1; i >= 0; i--) {
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
        if(slicingStatus.hasError) {
            AlertActions.showPopupError(
                '',
                slicingStatus.lastReport.error,
                slicingStatus.lastReport.caption);
            setTimeout(function() { cancelPreview(); }, 500);
            return;
        }

        selectObject(null);
        // previewMode = true;
        transformControl.detach(SELECTED);

        if(blobExpired) {
            var progress;
            slicingStatus.showProgress = true;
            slicingStatus.needToCloseWait = true;

            if(willReslice) {
                progress = lang.print.reRendering;
            }
            else {
                progress = lang.print.gettingSlicingReport;
            }

            if(!slicingStatus.isComplete) {
                _showWait(progress, !showStopButton);
            }
        }
        else {
            if(!printPath || printPath.length === 0) {
                slicingStatus.canInterrupt = false;
                slicer.getPath().then(function(result) {
                    slicingStatus.canInterrupt = true;
                    printPath = result;
                    _drawPath().then(function() {
                        _closeWait();
                    });
                });
            }
            else {
                _drawPath().then(function() {
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
    }

    function _drawPath() {
        var d = $.Deferred(),
            color,
            g, m, line,
            type;

        previewScene.children.splice(1, previewScene.children.length - 1);
        m = new THREE.LineBasicMaterial({
            color: 0xffffff,
            opacity: 10,
            linewidth: 1,
            vertexColors: THREE.VertexColors
        });

        for (var layer = 0; layer < printPath.length; layer++) {
            g = new THREE.Geometry();
            color = [];

            for (var point = 1; point < printPath[layer].length; point++) {
                for (var tmp = 1; tmp >= 0; tmp--) {
                    color.push(previewColors[printPath[layer][point][3]]);
                    g.vertices.push(new THREE.Vector3(
                        printPath[layer][point - tmp][0],
                        printPath[layer][point - tmp][1],
                        printPath[layer][point - tmp][2]
                    ));
                }
            }

            g.colors = color;
            line = new THREE.Line(g, m);
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
        var vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(_camera.rotation, _camera.eulerOrder);
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

        var sizeChanged = (
            ref.size.x !== src.size.x ||
            ref.size.y !== src.size.y ||
            ref.size.z !== src.size.z
        );

        var rotationChanged = (
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
            if(!slicingStatus.showProgress) {
                slicingStatus.showProgress = true;
            }
            updateSlicingProgressFromReport(slicingStatus.lastReport);
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

    function changeEngine(engine, path) {
        var d = $.Deferred();

        var t = setInterval(() => {
            if(slicingStatus.canInterrupt) {
                clearInterval(t);
                slicingStatus.canInterrupt = false;
                slicer.checkEngine(engine, path).then((result) => {
                    if(result.status === 'ok') {
                        return slicer.changeEngine(engine, path);
                    }
                    else {
                        d.resolve(result);
                    }
                }).then(() => {
                    slicingStatus.canInterrupt = true;
                    d.resolve();
                });
            }
        }, 500);

        return d.promise();
    }

    function allOutOfBound() {
        return !objects.some((o) => {
            return !o.position.isOutOfBounds;
        });
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
        downloadGCode       : downloadGCode,
        downloadFCode       : downloadFCode,
        setRotateMode       : setRotateMode,
        setScaleMode        : setScaleMode,
        setAdvanceParameter : setAdvanceParameter,
        setParameter        : setParameter,
        getGCode            : getGCode,
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
        takeSnapShot        : takeSnapShot
    };
});
