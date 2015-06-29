define([
    'jquery',
    'helpers/file-system',
    'helpers/display',
    // 'threeTransformControls',
    'threeOrbitControls',
    'threeSTLLoader',
    'threeCircularGridHelper'
], function($, fileSystem, display) {
    'use strict';

    var THREE = window.THREE || {},
        container, stats;

    var camera, cameraTarget, scene, renderer;
    var plane, control, controls;

    var objects = [];
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(),
        offset = new THREE.Vector3(),
        INTERSECTED, SELECTED;

    function appendModel(model_file_path) {
        var loader = new THREE.STLLoader();
        loader.load(model_file_path, function(geometry) {

            var material = new THREE.MeshPhongMaterial({
                color: 0xff5533,
                specular: 0x111111,
                shininess: 200
            });
            var mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(0, 2000, 0);
            //mesh.scale.set(1, 1, 1);

            scene.add(mesh);

            objects.push(mesh);
            // animate();
            render();
        });
    }

    function init() {

        container = document.getElementById('model-displayer');

        camera = new THREE.PerspectiveCamera( 70, container.offsetWidth / container.offsetHeight, 1, 300000 );
        camera.position.set(30900, 20900, 30090);
        camera.lookAt(new THREE.Vector3(10900, 10900, 10090));

        scene = new THREE.Scene();

        // circular grid helper
        var s = {
            diameter: 50000,
            step: 5000,
            upVector: new THREE.Vector3(0,1,0),
            color:  0x777777,
            opacity: 0.2,
            text: true,
            textColor: '#000000',
            textPosition: 'center'
        }
        var circularGridHelper = new CircularGridHelper(
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

        // Lights
        scene.add(new THREE.AmbientLight(0x777777));

        addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        addShadowedLight(0.5, 1, -1, 0xffaa00, 1);

        // renderer

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setClearColor( 0xE0E0E0, 1 );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.sortObjects = false;

        container.appendChild(renderer.domElement);

        control = new THREE.OrbitControls( camera, renderer.domElement );
        control.maxPolarAngle = Math.PI/2;
        control.noKeys = true;
        control.addEventListener( 'change', render );

        window.addEventListener('resize', onWindowResize, false);

        renderer.domElement.addEventListener(
            'mousedown',
            function(e) {
                SELECTED = onDocumentMouseDown(e) || SELECTED;
                if(SELECTED != null) {
                    var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
                    var outlineMesh = new THREE.Mesh(SELECTED.geomtry, outlineMaterial);
                    scene.add(outlineMesh);
                }
            },
            false
        );

        render();
    }

    function addShadowedLight(x, y, z, color, intensity) {

        var directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z);
        scene.add(directionalLight);

        directionalLight.castShadow = true;
        // directionalLight.shadowCameraVisible = true;

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

    function animate() {
        requestAnimationFrame(animate);
        control.update();
    }

    function render() {
        renderer.render(scene, camera);
    }

    // events

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);

    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

        var selected;

        mouse.x = (event.offsetX / container.offsetWidth) * 2 - 1;
        mouse.y = -(event.offsetY / container.offsetHeight) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
            selected = intersects[0].object;
        }
        render();
        return selected;
    }

    function rotate(x, y, z) {
        SELECTED.rotation.x = (x / 360 * Math.PI * 2) || 0;
        SELECTED.rotation.y = (y / 360 * Math.PI * 2) || 0;
        SELECTED.rotation.z = (z / 360 * Math.PI * 2) || 0;
        render();
    }

    function alignCenter() {
        var centerPosition = SELECTED.geometry.center();
        SELECTED.translateX(centerPosition.x);
        SELECTED.translateY(centerPosition.y);
        SELECTED.translateZ(centerPosition.z);
        render();
    }

    function removeSelected() {
        var index;
        scene.remove(SELECTED);
        index = objects.indexOf(SELECTED);
        if(index > -1) {
            objects.splice(index, 1);
        }
        SELECTED = null;
        render();
    }

    return {
        init: init,
        appendModel: appendModel,
        rotate: rotate,
        alignCenter: alignCenter,
        removeSelected: removeSelected
    };
});