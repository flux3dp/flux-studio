define([
    'jquery',
    'helpers/file-system',
    'helpers/display',
    'threeOrbitControls',
    'threeSTLLoader',
    'threeCircularGridHelper'

], function($, fileSystem, display) {
    'use strict';

    var THREE = window.THREE || {},
        container, stats;

    var camera, camera2, scene, outScene, renderer, composer;
    var plane, control, controls, reactSrc;

    var objects = [],
        referenceMeshes = [];
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(),
        offset = new THREE.Vector3(),
        myMesh, circularGridHelper, mouseDown, SELECTED;

    var oldx, oldy;

    var s = {
        diameter: 1700,
        step: 115,
        upVector: new THREE.Vector3(0, 1, 0),
        color:  0x777777,
        opacity: 0.2,
        text: true,
        textColor: '#000000',
        textPosition: 'center'
    }

    function init(src) {

        reactSrc = src;
        container = document.getElementById('model-displayer');

        camera = new THREE.PerspectiveCamera( 70, container.offsetWidth / container.offsetHeight, 1, 30000 );
        camera.position.set(850, 800, 850);

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

        var geometry = new THREE.BoxGeometry( 1700, 0, 1700 );
        var material = new THREE.MeshBasicMaterial( { color: 0xCCCCCC, transparent: true } );
        myMesh = new THREE.Mesh( geometry, material );
        myMesh.visible = false;
        scene.add( myMesh );
        referenceMeshes.push(myMesh);

        // Lights
        scene.add(new THREE.AmbientLight(0x777777));

        addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        addShadowedLight(0.5, 1, -1, 0xffaa00, 1);

        // renderer
        renderer = new THREE.WebGLRenderer({
            // antialias: true
        });
        renderer.setClearColor( 0xE0E0E0, 1 );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.offsetWidth, window.innerHeight);
        renderer.sortObjects = false;

        container.appendChild(renderer.domElement);

        control = new THREE.OrbitControls( camera, renderer.domElement );
        control.maxPolarAngle = Math.PI/2;
        control.noKeys = true;
        control.addEventListener( 'change', render );

        window.addEventListener('resize', onWindowResize, false);


        renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
        renderer.domElement.addEventListener('mousedown', onMouseDown, false);
        renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );

        render();
    }

    function appendModel(model_file_path) {
        var loader = new THREE.STLLoader();
        loader.load(model_file_path, function(geometry) {

            var material = new THREE.MeshPhongMaterial({
                color: 0x333333,
                specular: 0x111111,
                shininess: 100
            });
            var mesh = new THREE.Mesh(geometry, material);

            // normalize - resize, align
            var box = new THREE.Box3().setFromObject(mesh);
            var v = getLargestPropertyValue(box.size());
            var s = getScaleDifference(v);
            console.log(box.size());
            console.log(s);
            selectObject(mesh);
            mesh.scale.set(s, s, s);
            mesh.scale._x = s;
            mesh.scale._y = s;
            mesh.scale._z = s;
            mesh.scale.enteredX = 1;
            mesh.scale.enteredY = 1;
            mesh.scale.enteredZ = 1;
            mesh.rotation.enteredX = 0;
            mesh.rotation.enteredY = 0;
            mesh.rotation.enteredZ = 0;
            alignCenter();

            scene.add(mesh);
            objects.push(mesh);
            render();
        });
    }

    function onMouseDown(e) {
        e.preventDefault();
        adjustMousePosition(e);
        var selected = {};
        var intersects = getIntersects(mouse.x, mouse.y);

        if (intersects.length > 0) {
            var target = intersects[0].object;
            control.enabled = false;
            selectObject(target);
            mouseDown = true;
            container.style.cursor = 'move';
        }
        else {
            selectObject(null);
        }

        render();
    }

    function onMouseUp(e) {
        e.preventDefault();
        control.enabled = true;
        mouseDown = false;
        container.style.cursor = 'auto';
    }

    function onMouseMove(e) {
        event.preventDefault();
        adjustMousePosition(e);

        var location = getIntersectLocation(e);
        if(SELECTED && mouseDown)
        {
            if(SELECTED.position && location) {
                SELECTED.position.x = location.x;
                SELECTED.position.z = location.z;
                render();
                return;
            }
        }

    }

    // get objects that intersects with the ray
    function getIntersects(x, y) {
        var vector = new THREE.Vector3(x, y, 0.1).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        return raycaster.intersectObjects(objects);
    }

    // get ray intersect with reference mesh
    function getIntersectLocation(e) {
        var offx = e.clientX - 100,
            offy = e.clientY - 50;
        var vector = new THREE.Vector3( (
            offx / container.offsetWidth ) * 2 - 1,
            - ( offy / container.offsetHeight ) * 2 + 1,
            0.5
        );
        vector.unproject(camera);

        var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
        var intersects = ray.intersectObjects( referenceMeshes );

        if ( intersects.length > 0 ) {
            return intersects[ 0 ].point
        }
    }

    // select the specified object and change its color
    function selectObject(obj) {
        SELECTED = obj || {};
        reactSrc.setState({ modelSelected: SELECTED.uuid ? SELECTED : null });
        objects.forEach(function(object) {
            if(object.uuid == SELECTED.uuid) {
                object.material.color.setHex(0xFFCC00);
            }
            else {
                object.material.color.setHex(0x333333);
            }
        });
    }

    // calculate the distance from reference mesh
    function getReferenceDistance(mesh) {
        if(mesh) {
            var ref = {},
                box = new THREE.Box3().setFromObject(mesh);
            var v = getLargestPropertyValue(box.size()),
                s = getScaleDifference(v);
            ref.x = box.center().x;
            ref.y = box.min.y;
            ref.z = box.center().z;
            return ref;
        }
    }

    function adjustMousePosition(e) {
        var offx = e.offsetX - 28,
            offy = e.offsetY + 9;

        mouse.x = (offx / container.offsetWidth) * 2 - 1;
        mouse.y = -(offy / container.offsetHeight) * 2 + 1;
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

    }

    function render() {
        renderer.render(scene, camera);
    }

    // events
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    function rotate(x, y, z) {
        SELECTED.rotation.enteredX = x;
        SELECTED.rotation.enteredY = y;
        SELECTED.rotation.enteredZ = z;
        SELECTED.rotation.x = (x / 360 * Math.PI * 2) || 0;
        SELECTED.rotation.y = (y / 360 * Math.PI * 2) || 0;
        SELECTED.rotation.z = (z / 360 * Math.PI * 2) || 0;
        reactSrc.setState({ modelSelected: SELECTED.uuid ? SELECTED : null });
        render();
    }

    function setScale(x, y, z, locked) {
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
            originalScaleX * x,
            originalScaleY * y,
            originalScaleZ * z
        );
        SELECTED.scale.locked = locked;
        reactSrc.setState({ modelSelected: SELECTED.uuid ? SELECTED : null });
        render();
    }

    function alignCenter() {
        if(SELECTED) {
            var reference = getReferenceDistance(SELECTED);
            SELECTED.position.x -= reference.x;
            SELECTED.position.y -= reference.y;
            SELECTED.position.z -= reference.z;
            render();
        }
    }

    function removeSelected() {
        if(SELECTED) {
            var index;
            scene.remove(SELECTED);
            index = objects.indexOf(SELECTED);
            if(index > -1) {
                objects.splice(index, 1);
            }
            SELECTED = null;
            render();
        }
    }

    return {
        init: init,
        appendModel: appendModel,
        rotate: rotate,
        setScale: setScale,
        alignCenter: alignCenter,
        removeSelected: removeSelected
    };
});
