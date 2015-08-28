define([
    'jquery',
    'helpers/file-system',
    'helpers/display',
    'helpers/websocket',
    'helpers/api/3d-print-slicing',
    'threeOrbitControls',
    'threeTrackballControls',
    'threeTransformControls',
    'threeSTLLoader',
    'threeCircularGridHelper',
    'plugins/file-saver/file-saver.min'

], function($, fileSystem, display, websocket, printSlicing) {
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

    var movingOffsetX, movingOffsetY;

    var responseMessage, responseBlob,
        blobExpired = true,
        transformMode = false,
        shiftPressed = false,
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
        scalePrecision: 1 // decimal places
    };

    var advancedParameters = ['layerHeight', 'infill', 'travelingSpeed', 'extrudingSpeed', 'temperature', 'advancedSettings'];

    function init(src) {

        reactSrc = src;
        container = document.getElementById('model-displayer');

        camera = new THREE.PerspectiveCamera( 60, (container.offsetWidth) / container.offsetHeight, 1, 30000 );
        camera.position.set(100, 100, 100);
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
        scene.add(circularGridHelper);

        var geometry = new THREE.CircleGeometry( s.radius, 80 ),
            material = new THREE.MeshBasicMaterial( { color: 0xCCCCCC, transparent: true } ),
            refMesh  = new THREE.Mesh( geometry, material );

        refMesh.up = new THREE.Vector3(0,0,1);
        refMesh.visible = false;
        scene.add(refMesh);
        referenceMeshes.push(refMesh);

        // Lights
        scene.add(new THREE.AmbientLight(0x777777));

        addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        addShadowedLight(0.5, 1, -1, 0xffaa00, 1);
        addShadowedLight(-1, -1, -1, 0xffffff, 1.35);
        addShadowedLight(-0.5, -1, 1, 0xffaa00, 1);

        // renderer
        renderer = new THREE.WebGLRenderer({
            // antialias: true
        });
        renderer.setClearColor( 0xE0E0E0, 1 );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);

        orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControl.maxPolarAngle = Math.PI/2;
        orbitControl.maxDistance = 1000;
        orbitControl.noKeys = true;
        // orbitControl.momentumDampingFactor = 100;
        // orbitControl.momentumScalingFactor = 0.005;
        orbitControl.addEventListener('change', render);

        // orbitControl = new THREE.TrackballControls( camera );
        // orbitControl.dynamicDampingFactor = 0.1;
        // orbitControl.rotateSpeed = 4.0;
        // orbitControl.addEventListener('change', function(e) {
        //     console.log('changing');
        // });

        transformControl = new THREE.TransformControls(camera, renderer.domElement);
        transformControl.addEventListener('change', render);
        transformControl.addEventListener('mouseDown', transform);
        transformControl.addEventListener('mouseUp', transform);
        transformControl.addEventListener('objectChange', transform);

        // testing lines
        // var lineMaterial1 = new THREE.LineBasicMaterial({
        //     color: 0xff0000,
        //     linewidth: 10
        // });
        // var lineMaterial2 = new THREE.LineBasicMaterial({
        //     color: 0x00ff00,
        //     linewidth: 100,
        //     vertexColors: 0xff0000
        // });
        // var lineGeometry = new THREE.Geometry();
        // lineGeometry.vertices.push(new THREE.Vector3(-10, 0, 0));
        // lineGeometry.vertices.push(new THREE.Vector3(0, 10, 0));
        // lineGeometry.vertices.push(new THREE.Vector3(10, 0, 0));
        // lineGeometry.vertices.push(new THREE.Vector3(-15, 0, 0));
        // lineGeometry.vertices.push(new THREE.Vector3(0, 15, 0));
        // lineGeometry.vertices.push(new THREE.Vector3(15, 0, 0));
        //
        // var line1 = new THREE.Line(lineGeometry, lineMaterial1, THREE.LinePieces);
        //
        // var lineGeometry2 = new THREE.Geometry();
        // lineGeometry2.vertices.push(new THREE.Vector3(0, 10, 0));
        // lineGeometry2.vertices.push(new THREE.Vector3(10, 0, 0));
        // lineGeometry2.vertices.push(new THREE.Vector3(-15, 0, 0));
        // lineGeometry2.vertices.push(new THREE.Vector3(0, 15, 0));
        //
        // var line2 = new THREE.Line(lineGeometry2, lineMaterial2, THREE.LinePieces);
        //
        // scene.add(line1);
        // scene.add(line2);




        // var points = [
        //     {t: 1, v: [-5,0,0]},
        //     {t: 1, v: [0,-5,0]},
        //     {t: 1, v: [5,0,0]},
        //     {t: 1, v: [0,5,0]},
        //     {t: 1, v: [-10,0,0]},
        //     {t: 1, v: [0,-10,0]}
        // ];
        //
        // var colors = [];
        // var g = new THREE.Geometry();
        //
        // for(var i = 0; i < points.length; i++) {
        //     g.vertices.push(new THREE.Vector3(points[i].v[0], points[i].v[1], points[i].v[2]));
        // }
        //
        // colors[0] = new THREE.Color( 0x000000 );
        // colors[1] = new THREE.Color( 0xffff00 );
        // colors[2] = new THREE.Color( 0xff0000 );
        // colors[3] = new THREE.Color( 0xff0ff0 );
        // colors[4] = new THREE.Color( 0xfffff0 );
        // colors[5] = new THREE.Color( 0x0fffff );
        //
        // g.colors = colors;
        //
        // var m = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 10, linewidth: 10000, vertexColors: THREE.VertexColors } );
        // var line = new THREE.Line(g, m);
        //
        // scene.add(line);



        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener("keydown", onKeyPress, false);
        window.addEventListener("keyup", onKeyPress, false);
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onMouseUp, false);

        renderer.setSize(container.offsetWidth, container.offsetHeight);

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
            });

            geometry.center();

            // normalize - resize, align
            var box = new THREE.Box3().setFromObject(mesh);
            var scale = getScaleDifference(getLargestPropertyValue(box.size()));

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

            mesh.geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
            mesh.name = 'custom';

            selectObject(mesh);
            alignCenter();

            scene.add(mesh);
            objects.push(mesh);

            render();
        });
    }

    function onMouseDown(e) {
        e.preventDefault();
        adjustMousePosition(e);

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
        adjustMousePosition(e);

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

            // if(!transformMode) {
            //     scene.add(boundingBox);
            // }

            scene.add(boundingBox);
        }
        else {
            transformMode = false;
            // removeFromScene('TransformControl');
            // render();
        }
        reactSrc.setState({ modelSelected: SELECTED.uuid ? SELECTED : null });

        render();
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

    function adjustMousePosition(e) {
        var offx = 0,
            offy = 0;

        mouse.x = ((e.offsetX - offx) / container.offsetWidth) * 2 - 1;
        mouse.y = -((e.offsetY - offy) / container.offsetHeight) * 2 + 1;
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
            while(!done) {
                if(value * scale > s.diameter) {
                    done = true;
                }
                else {
                    scale = scale * 10;
                }
            }
            return scale * 0.1;
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

    function addShadowedLight(x, y, z, color, intensity) {

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

    function render(e) {
        if(SELECTED) {
            updateFromScene('BoundingBoxHelper');
            updateFromScene('TransformControl');
        }
        // orbitControl.update();
        renderer.render(scene, camera);
    }

    function transform(e) {
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
                    // console.log(SELECTED.scale.x, SELECTED.scale.y, SELECTED.scale.z);
                _dx = _dx >= 0 ? _dx : (360 - Math.abs(_dx));
                _dy = _dy >= 0 ? _dy : (360 - Math.abs(_dy));
                _dz = _dz >= 0 ? _dz : (360 - Math.abs(_dz));
                rotate(_dx, _dy, _dz, false);
                setScale(_sx, _sy, _sz, false, false);
                render();
                groundIt(SELECTED);
                break;
            case 'objectChange':
                // console.log(updateScaleWithStep(SELECTED.scale.x), SELECTED.scale.x);

                // console.log('hi');
                break;
        }
        // transformMode = e.type === 'mouseDown';
        // console.log(e);
    }

    // events
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

    function rotate(x, y, z, render) {
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
            // render();
        }
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

    function readyGCode() {
        var d = $.Deferred();
        syncObjectParameter(objects, 0).then(function() {
            d.resolve('');
        });
        return d.promise();
    }

    function syncObjectParameter(objects, index) {
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
                    return d.resolve(syncObjectParameter(objects, index + 1));
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

    function downloadGCode(fileName) {
        var d = $.Deferred();
        getGCode().then(function(blob) {
            console.log('downloading ', blob);
            d.resolve(saveAs(blob, fileName));
        });
        return d.promise();
    }

    function getGCode(callback) {
        var d = $.Deferred();
        var ids = [];
        objects.forEach(function(obj) {
            ids.push(obj.uuid);
        });

        readyGCode().then(
            function() {
                return printController.go(ids);
            }
        ).then(function(result) {
            if(result instanceof Blob) {
                console.log('blob ready');
                blobExpired = false;
                d.resolve(result);
            }
            else {
                console.log('error: ', result);
                responseMessage = result;
                // todo: error logging
            }
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

    function getSelectedObjectSize() {
        if(!$.isEmptyObject(SELECTED)) {
            boundingBox = new THREE.BoundingBoxHelper(SELECTED, s.colorSelected);
            boundingBox.update();
            return boundingBox;
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
    }

    return {
        init                    : init,
        appendModel             : appendModel,
        rotate                  : rotate,
        setScale                : setScale,
        alignCenter             : alignCenter,
        removeSelected          : removeSelected,
        readyGCode              : readyGCode,
        getSelectedObjectSize   : getSelectedObjectSize,
        downloadGCode           : downloadGCode,
        setRotateMode           : setRotateMode,
        setScaleMode            : setScaleMode,
        setAdvanceParameter     : setAdvanceParameter,
        setParameter            : setParameter,
        getGCode                : getGCode
    };
});
