define([
    'jquery',
    'helpers/file-system',
    'helpers/display',
    'helpers/websocket',
    'helpers/api/3d-print-slicing',
    'helpers/api/control',
    'threeOrbitControls',
    'threeTrackballControls',
    'threeTransformControls',
    'threeSTLLoader',
    'threeCircularGridHelper',
    'plugins/file-saver/file-saver.min',
    'lib/Canvas-To-Blob'

], function($, fileSystem, display, websocket, printSlicing, printerController) {
    'use strict';

    var THREE = window.THREE || {},
        container, printController;

    var camera, scene, renderer;
    var orbitControl, transformControl, reactSrc, controls;

    var objects = [],
        referenceMeshes = [];
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(),
        offset = new THREE.Vector3(),
        circularGridHelper, mouseDown, boundingBox, SELECTED;

    var movingOffsetX, movingOffsetY, originalCameraPosition, originalCameraRotation;

    var responseMessage, responseBlob, printPath,
        previewScene,
        mainScene,
        previewColors = [],
        blobExpired = true,
        transformMode = false,
        shiftPressed = false,
        previewMode = false,
        fileExtension = '.gcode';

    var s = {
        diameter: 170,
        radius: 85,
        height: 180,
        step: 10,
        upVector: new THREE.Vector3(0, 0, 1),
        color:  0x777777,
        opacity: 0.2,
        text: true,
        textColor: '#000000',
        textPosition: 'center',
        colorOutside: 0xFF0000,
        colorSelected: 0xFFFF00,
        colorUnselected: 0x333333,
        degreeStep: 5,
        scalePrecision: 1, // decimal places,
        allowedMin: 1 // (mm)
    };

    var advancedParameters = ['layerHeight', 'infill', 'travelingSpeed', 'extrudingSpeed', 'temperature', 'advancedSettings'];

    previewColors[0] = new THREE.Color( 0x996633 ); // infill
    previewColors[1] = new THREE.Color( 0xddcc99 ); // perimeter
    previewColors[2] = new THREE.Color( 0xbbbbbb ); // support
    previewColors[3] = new THREE.Color( 0xffffff ); // move
    previewColors[4] = new THREE.Color( 0xee9966 ); // skirt

    function init(src) {

        reactSrc = src;
        container = document.getElementById('model-displayer');

        camera = new THREE.PerspectiveCamera( 60, (container.offsetWidth) / container.offsetHeight, 1, 30000 );
        camera.position.set(130, 130, 130);
        camera.up = new THREE.Vector3(0,0,1);

        scene = new THREE.Scene();

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

        var geometry = new THREE.CircleGeometry( s.radius, 80 ),
            material = new THREE.MeshBasicMaterial( { color: 0xCCCCCC, transparent: true } ),
            refMesh  = new THREE.Mesh( geometry, material );

        refMesh.up = new THREE.Vector3(0,0,1);
        refMesh.visible = false;
        scene.add(refMesh);
        referenceMeshes.push(refMesh);

        // Lights
        scene.add(new THREE.AmbientLight(0x777777));

        _addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        _addShadowedLight(0.5, 1, -1, 0xffaa00, 1);
        _addShadowedLight(-1, -1, -1, 0xffffff, 1.35);
        _addShadowedLight(-0.5, -1, 1, 0xffaa00, 1);

        // renderer
        renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true
        });
        renderer.setClearColor( 0xE0E0E0, 1 );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);

        orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControl.maxPolarAngle = Math.PI/4 * 3;
        orbitControl.maxDistance = 1000;
        orbitControl.noKeys = true;
        orbitControl.addEventListener('change', render);

        transformControl = new THREE.TransformControls(camera, renderer.domElement);
        transformControl.addEventListener('change', render);
        transformControl.addEventListener('mouseDown', onTransform);
        transformControl.addEventListener('mouseUp', onTransform);
        transformControl.addEventListener('objectChange', onTransform);

        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener("keydown", onKeyPress, false);
        window.addEventListener("keyup", onKeyPress, false);
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onMouseUp, false);

        renderer.setSize(container.offsetWidth, container.offsetHeight);

        originalCameraPosition = camera.position.clone();
        originalCameraRotation = camera.rotation.clone();

        render();

        // init print controller
        printController = printSlicing();
    }

    function uploadStl(name, file, callback) {
        // pass to slicer
        var reader = new FileReader();
        reader.onload = function(e) {
            var arrayBuffer = reader.result;
            printController.upload(name, file, callback);
        }
        reader.readAsArrayBuffer(file);
    }

    function appendModel(fileEntry, file) {
        var loader = new THREE.STLLoader();
        var model_file_path = fileEntry.toURL();

        reactSrc.setState({ openWaitWindow: true });

        loader.load(model_file_path, function(geometry) {

            var material = new THREE.MeshPhongMaterial({
                color: s.colorUnselected,
                specular: 0x111111,
                shininess: 100
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.up = new THREE.Vector3(0,0,1);

            uploadStl(mesh.uuid, file, function(result) {
                console.log(result);
                if(result.status !== 'ok') {
                    alert(result.error);
                }
                reactSrc.setState({ openWaitWindow: false });
            });

            geometry.center();

            // normalize - resize, align
            var box = new THREE.Box3().setFromObject(mesh);
            var scale = getScaleDifference(getLargestPropertyValue(box.size()));

            // alert for auto scalling
            if(scale !== 1) {
                alert('this model has been scaled for better printing ratio');
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
            /* end customized property */

            if(mesh.geometry.type !== 'Geometry') {
                mesh.geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
            }
            mesh.name = 'custom';

            selectObject(mesh);
            alignCenter();

            scene.add(mesh);
            objects.push(mesh);

            render();
        });
    }

    // Events Section ---

    function onMouseDown(e) {
        e.preventDefault();
        setMousePosition(e);

        if(previewMode) {
            return;
        }

        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( objects );
        var location = getReferenceIntersectLocation(e);
        // console.log('found',intersects.length);
        if (intersects.length > 0) {
            var target = intersects[0].object;
            selectObject(target);

            orbitControl.enabled = false;
            mouseDown = true;
            container.style.cursor = 'move';

            movingOffsetX = location ? location.x - target.position.x : target.position.x;
            movingOffsetY = location ? location.y - target.position.y : target.position.y;
        }
        else {
            if(!transformMode) {
                selectObject(null);
                removeFromScene('TransformControl');
                transformControl.detach(SELECTED);
                transformMode = false;
                render();
            }
        }

        render();
    }

    function onMouseUp(e) {
        e.preventDefault();
        orbitControl.enabled = true;
        mouseDown = false;
        container.style.cursor = 'auto';
        checkOutOfBounds(SELECTED);

        if(transformMode) {
            selectObject(transformControl.object);
        }

        render();
    }

    function onMouseMove(e) {
        event.preventDefault();
        setMousePosition(e);

        var location = getReferenceIntersectLocation(e);
        if(SELECTED && mouseDown && !transformMode)
        {
            if(!transformMode)
            if(SELECTED.position && location) {
                SELECTED.position.x = location.x - movingOffsetX;
                SELECTED.position.y = location.y - movingOffsetY;
                blobExpired = true;

                render();
                return;
            }
        }
    }

    function onWindowResize() {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        render();
    }

    function onKeyPress(e) {
        if(e.keyCode === 16) {
            shiftPressed = e.type === 'keydown';
        }
    }

    function onTransform(e) {
        switch(e.type) {
            case 'mouseDown':
                transformMode = true;
                break;
            case 'mouseUp':
                transformMode = false;
                // d = degree, s = scale
                var _dx = updateDegreeWithStep(radianToDegree(SELECTED.rotation.x)),
                    _dy = updateDegreeWithStep(radianToDegree(SELECTED.rotation.y)),
                    _dz = updateDegreeWithStep(radianToDegree(SELECTED.rotation.z)),
                    _sx = updateScaleWithStep(SELECTED.scale.x),
                    _sy = updateScaleWithStep(SELECTED.scale.y),
                    _sz = updateScaleWithStep(SELECTED.scale.z);

                _dx = _dx >= 0 ? _dx : (360 - Math.abs(_dx));
                _dy = _dy >= 0 ? _dy : (360 - Math.abs(_dy));
                _dz = _dz >= 0 ? _dz : (360 - Math.abs(_dz));
                rotate(_dx, _dy, _dz, false);
                setScale(_sx, _sy, _sz, false, false);
                render();
                groundIt(SELECTED);
                break;
            case 'objectChange':
                break;
        }
    }

    // GET section ---

    // get objects that intersects with the ray
    function getIntersects(x, y) {
        var vector = new THREE.Vector3(x, y, 0.5).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, mouse.subSelf(camera.position).normalize());
        return raycaster.intersectObjects(objects);
    }

    // get ray intersect with reference mesh
    function getReferenceIntersectLocation(e) {
        var offx = 0,
            offy = 0;

        var vector = new THREE.Vector3(
            ((e.offsetX - offx) / container.offsetWidth) * 2 - 1,
            -((e.offsetY - offy) / container.offsetHeight) * 2 + 1,
            0.5
        ).unproject(camera);

        var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
        var intersects = ray.intersectObjects( referenceMeshes );

        if ( intersects.length > 0 ) {
            return intersects[0].point;
        }
    }

    // calculate the distance from reference mesh
    function getReferenceDistance(mesh) {
        if(mesh) {
            var ref = {},
                box = new THREE.Box3().setFromObject(mesh);
            ref.x = box.center().x;
            ref.y = box.center().y;
            ref.z = box.min.z;
            return ref;
        }
    }

    function getFileByteArray(filePath) {
        getFileObject(filePath, function (fileObject) {
             var reader = new FileReader();

             reader.onload = function(e) {
                 var arrayBuffer = reader.result;
                 console.log(arrayBuffer);
             }

             reader.readAsArrayBuffer(fileObject);
        });
    }

    // compare and return the largest axis value (for scaling)
    function getLargestPropertyValue(obj) {
        var v = 0;
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if(obj[property] > v) {
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
        if(value < s.diameter) {
            if(value * scale < s.allowedMin) {
                scale = scale * 10;
            }
            return scale;
        }
        // if loaded object exceed printed area, shrink it (no offset)
        else {
            while(!done) {
                if(value / scale < s.diameter) {
                    done = true;
                }
                else {
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

        _setProgressMessage('Saving File Preview');
        saveSceneAsFileIcon().then(function(blob) {
            return printController.uploadPreviewImage(blob);
        }).then(function(result) {
            if(result.status === 'ok') {
                sendGCodeParameters().then(function() {
                    printController.go(ids, function(result) {
                        if(result instanceof Blob) {
                            blobExpired = false;
                            responseBlob = result;
                            _setProgressMessage('');
                            d.resolve(result);
                        }
                        else {
                            if(result.status !== 'error') {
                                console.log(result);
                                var serverMessage   = `${result.status}: ${result.message} (${parseInt(result.percentage * 100)}%)`,
                                    drawingMessage  = `FInishing up... (100%)`,
                                    message         = result.status !== 'complete' ? serverMessage : drawingMessage;
                                _setProgressMessage(message);
                            }
                            else {
                                _setProgressMessage('');
                            }
                        }
                    });
                });
            }
            // error
            else {
                _setProgressMessage('');
                d.resolve(result);
            }
        });

        return d.promise();
    }

    function getSelectedObjectSize() {
        if(!$.isEmptyObject(SELECTED)) {
            boundingBox = new THREE.BoundingBoxHelper(SELECTED, s.colorSelected);
            boundingBox.update();
            return boundingBox;
        }
    }

    // SET section ---

    function setMousePosition(e) {
        var offx = 0,
            offy = 0;

        mouse.x = ((e.offsetX - offx) / container.offsetWidth) * 2 - 1;
        mouse.y = -((e.offsetY - offy) / container.offsetHeight) * 2 + 1;
    }

    function setScale(x, y, z, locked, alignCenter) {
        var originalScaleX = SELECTED.scale._x;
        var originalScaleY = SELECTED.scale._y;
        var originalScaleZ = SELECTED.scale._z;
        SELECTED.scale.enteredX = x;
        SELECTED.scale.enteredY = y;
        SELECTED.scale.enteredZ = z;
        if(x === '' || x == 0) {x = 1;}
        if(y === '' || y == 0) {y = 1;}
        if(z === '' || z == 0) {z = 1;}
        SELECTED.scale.set(
            (originalScaleX * x) || originalScaleX,
            (originalScaleY * y) || originalScaleX,
            (originalScaleZ * z) || originalScaleX
        );
        SELECTED.scale.locked = locked;
        reactSrc.setState({ modelSelected: SELECTED.uuid ? SELECTED : null });

        if(alignCenter) {
            this.alignCenter();
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
        scene.add(transformControl);
        removeFromScene('BoundingBoxHelper');
        render();
    }

    function setAdvanceParameter(settings, index) {
        index = index || 0;
        var name = advancedParameters[index],
            value = settings[name] || 'default';

        if(index < advancedParameters.length)
        {
            printController.setParameter(name, value).then(function(result) {
                if(result.status === 'error') {
                    index = advancedParameters.length;
                    // todo: error logging
                    console.log(result.error);
                }
                if(index < advancedParameters.length) {
                    setAdvanceParameter(settings, index + 1);
                }
                else {
                    return;
                }
            });
        }
        blobExpired = true;
    }

    function setParameter(name, value) {
        printController.setParameter(name, value).then(
            function(result) {
                if(result.status === 'error' || result.status === 'fatal') {
                    // todo: error logging
                }
                console.dir(result);
            }
        )
        blobExpired = true;
    }

    function setRotation(x, y, z, render) {
        SELECTED.rotation.enteredX = x;
        SELECTED.rotation.enteredY = y;
        SELECTED.rotation.enteredZ = z;
        SELECTED.rotation.x = degreeToRadian(x);
        SELECTED.rotation.y = degreeToRadian(y);
        SELECTED.rotation.z = degreeToRadian(z);

        reactSrc.setState({ modelSelected: SELECTED.uuid ? SELECTED : null });
        if(render) {
            groundIt(SELECTED);
            updateFromScene('BoundingBoxHelper');
            checkOutOfBounds(SELECTED);
        }
    }

    // Main Functions ---

    // select the specified object, will calculate out-of-bounds and change color accordingly
    function selectObject(obj) {
        SELECTED = obj || {};

        removeFromScene('BoundingBoxHelper');
        removeFromScene('TransformControl');

        if(!$.isEmptyObject(obj)) {
            boundingBox = new THREE.BoundingBoxHelper( obj, s.colorSelected );
            boundingBox.name = "BoundingBoxHelper";
            boundingBox.update();

            transformControl.attach(obj);
            transformControl.name = 'TransformControl';

            scene.add(boundingBox);
        }
        else {
            transformMode = false;
        }
        reactSrc.setState({ modelSelected: SELECTED.uuid ? SELECTED : null });

        render();
    }

    function alignCenter() {
        if(SELECTED) {
            var reference = getReferenceDistance(SELECTED);
            SELECTED.position.x -= reference.x;
            SELECTED.position.y -= reference.y;
            SELECTED.position.z -= reference.z;
            blobExpired = true;

            checkOutOfBounds(SELECTED);
            updateFromScene('BoundingBoxHelper');
            render();
        }
    }

    function groundIt(mesh) {
        var reference = getReferenceDistance(mesh);
        mesh.position.z -= reference.z;
        blobExpired = true;
    }

    function removeSelected() {
        if(SELECTED) {
            var index;
            scene.remove(SELECTED);
            index = objects.indexOf(SELECTED);
            if(index > -1) {
                objects.splice(index, 1);
            }

            // delete model in backend
            printController.delete(SELECTED.uuid, function(result) {
                console.log('delete result: ', result);
            });

            transformControl.detach(SELECTED);
            removeFromScene('BoundingBoxHelper');
            selectObject(null);
            render();
        }
    }

    function addPoint(x, y, z, r) {
        var geometry = new THREE.SphereGeometry( r || 5, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0.3} );
        var sphere = new THREE.Mesh( geometry, material );
        sphere.position.x = x;
        sphere.position.y = y;
        sphere.position.z = z;
        scene.add( sphere );
    }

    function checkOutOfBounds(sourceMesh) {
        if(!$.isEmptyObject(sourceMesh)) {
            sourceMesh.position.isOutOfBounds = sourceMesh.geometry.vertices.some(function(v) {
                var vector = v.clone();
                vector.applyMatrix4(sourceMesh.matrixWorld);
                return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) > s.radius;
            });

            boundingBox.material.color.setHex(sourceMesh.position.isOutOfBounds ? s.colorOutside : s.colorSelected);
        }
    }

    function sendGCodeParameters() {
        var d = $.Deferred();
        _syncObjectParameter(objects, 0).then(function() {
            d.resolve('');
        });
        return d.promise();
    }

    function downloadGCode(fileName) {
        var d = $.Deferred();
        if(!blobExpired) {
            d.resolve(saveAs(responseBlob, fileName));
        }
        else {
            getGCode().then(function(blob) {
                if(blob instanceof Blob) {
                    _setProgressMessage('');
                    d.resolve(saveAs(blob, fileName));
                }
            });
        }

        return d.promise();
    }

    function saveSceneAsFileIcon() {
        var ccp = camera.position.clone(),
            ccr = camera.rotation.clone(),
            d   = $.Deferred();

        camera.position.set(originalCameraPosition.x, originalCameraPosition.y, originalCameraPosition.z);
        camera.rotation.set(originalCameraRotation.x, originalCameraRotation.y, originalCameraRotation.z, originalCameraRotation.order);

        render();

        renderer.domElement.toBlob(function(blob) {
            camera.position.set(ccp.x, ccp.y, ccp.z);
            camera.rotation.set(ccr.x, ccr.y, ccr.z, ccr.order);
            render();
            d.resolve(blob);
        });

        return d.promise();
    }

    function removeFromScene(name) {
        for(var i = scene.children.length - 1; i >= 0; i--) {
            if(scene.children[i].name === name) {
                scene.children.splice(i, 1);
            }
        }
    }

    function updateFromScene(name) {
        for(var i = scene.children.length - 1; i >= 0; i--) {
            if(scene.children[i].name === name) {
                scene.children[i].update();
            }
        }
    }

    function togglePreview(isOn) {
        if(objects.length === 0) {
            return;
        }
        else {
            reactSrc.setState({ previewMode: isOn });
            previewMode = isOn;
            _setProgressMessage('generating preview...');
            isOn ? _showPreview() : _hidePreview();
        }
    }

    function changePreviewLayer (layerNumber) {
        for(var i = 1; i < previewScene.children.length; i++) {
            previewScene.children[i].visible = i - 1 < layerNumber;
        }
        render();
    }

    function executePrint(serial) {
        var go = function(blob) {
            var control_methods = printerController(serial);
            control_methods.upload(blob.size, blob);
        }

        if(!blobExpired) {
            go(responseBlob);
        }
        else {
            getGCode().then((blob) => {
                if(blob instanceof Blob) {
                    go(blob);
                }
            });
        }
    }

    function render() {
        if(SELECTED) {
            updateFromScene('BoundingBoxHelper');
            updateFromScene('TransformControl');
        }

        renderer.render(previewMode ? previewScene : scene, camera);
    }

    // Helper Functions ---

    function degreeToRadian(degree) {
        return (degree / 360 * Math.PI * 2) || 0;
    }

    function radianToDegree(radian) {
        return radian * 180 / Math.PI;
    }

    function updateDegreeWithStep(degree) {
        if(degree === 0) {return 0;}
        var degreeStep = shiftPressed ? 15 : s.degreeStep;
        return (parseInt(degree / degreeStep + 1) * degreeStep);
    }

    function updateScaleWithStep(scale) {
        // if no decimal after scale precision, ex: 1.1, not 1.143
        if(parseInt(scale * Math.pow(10, s.scalePrecision)) == scale * Math.pow(10, s.scalePrecision)) {
            return scale;
        }
        return (parseInt(scale * Math.pow(10, s.scalePrecision)) + 1) / Math.pow(10, s.scalePrecision);
    }

    // Private Functions ---

    function _syncObjectParameter(objects, index) {
        var d = $.Deferred();
        index = index || 0;
        if(index < objects.length) {
            printController.set(
                objects[index].uuid,
                objects[index].position.x,
                objects[index].position.y,
                objects[index].position.z,
                objects[index].rotation.x,
                objects[index].rotation.y,
                objects[index].rotation.z,
                objects[index].scale.x,
                objects[index].scale.y,
                objects[index].scale.z
            ).then(function(result) {
                if(result.status === 'error') {
                    index = objects.length;
                }
                if(index < objects.length) {
                    console.log('syncing parameters');
                    return d.resolve(_syncObjectParameter(objects, index + 1));
                }
            });
        }
        else {
            console.log('syncing done');
            var d = $.Deferred();
            d.resolve('');
        }
        return d.promise();
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
        render();
        _setProgressMessage('');
    }

    function _showPreview() {
        selectObject(null);

        var drawPath = function() {
            printController.getPath().then(function(result) {
                printPath = result;
                _drawPath();
            });
        }

        if(blobExpired) {
            getGCode().then(function(blob) {
                if(blob instanceof Blob) {
                    drawPath();
                }
            });
        }
        else {
            if(previewScene.children.length <= 1) {
                drawPath();
            }
            else {
                _showPath();
            }
        }
    }

    function _drawPath() {
        var color,
            g, m, line,
            type;

        previewScene.children.splice(1, previewScene.children.length - 1);
        m = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 10, linewidth: 1, vertexColors: THREE.VertexColors } );

        for(var layer = 0; layer < printPath.length; layer++) {
            g = new THREE.Geometry();
            color = [];

            // with no gradient, but 2x more points
            for(var point = 0; point < printPath[layer].length; point++) {
                type = !!printPath[layer][point + 1] ? printPath[layer][point + 1].t : printPath[layer][point].t;
                color[point] = previewColors[type];
                g.vertices.push(new THREE.Vector3(
                    printPath[layer][point].p[0],
                    printPath[layer][point].p[1],
                    printPath[layer][point].p[2]
                ));
            }

            g.colors = color;
            line = new THREE.Line(g, m);
            line.name = 'line';
            previewScene.add(line);
        }

        reactSrc.setState({
            sliderMax: previewScene.children.length - 1,
            sliderValue: previewScene.children.length - 1
        });
        _showPath();
    }

    function _showPath() {
        console.log('preview scene children count: ', previewScene.children.length);
        render();
        _setProgressMessage('');
    }

    function _setProgressMessage(message) {
        reactSrc.setState({
            progressMessage: message
        });
    }

    return {
        init                    : init,
        appendModel             : appendModel,
        setRotation             : setRotation,
        setScale                : setScale,
        alignCenter             : alignCenter,
        removeSelected          : removeSelected,
        sendGCodeParameters     : sendGCodeParameters,
        getSelectedObjectSize   : getSelectedObjectSize,
        downloadGCode           : downloadGCode,
        setRotateMode           : setRotateMode,
        setScaleMode            : setScaleMode,
        setAdvanceParameter     : setAdvanceParameter,
        setParameter            : setParameter,
        getGCode                : getGCode,
        togglePreview           : togglePreview,
        changePreviewLayer      : changePreviewLayer,
        executePrint            : executePrint
    };
});
