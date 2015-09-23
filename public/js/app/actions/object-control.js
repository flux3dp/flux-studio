define([
    'jquery',
    'threeOrbitControls',

], function ($) {
    'use strict';

    var THREE = window.THREE || {},
        container
    reactSrc;

    var controllerWidth = 275,
        controllerHeight = 100;

    var camera, scene, renderer;
    var orbitControl, transformControl, reactSrc, controls;

    function init(src) {
        reactSrc = src;
        container = document.getElementById('cameraViewController');

        camera = new THREE.PerspectiveCamera(60, controllerWidth / controllerHeight, 1, 30000);
        camera.position.set(0, -300, 110);
        camera.up = new THREE.Vector3(0, 0, 1);

        scene = new THREE.Scene();

        var geometry = new THREE.BoxGeometry(150, 150, 150);
        var material = new THREE.MeshBasicMaterial({
            color: 0xAAAAAA,
            wireframe: true
        });
        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        _addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        _addShadowedLight(0.5, 1, -1, 0xffaa00, 1);
        _addShadowedLight(-1, -1, -1, 0xffffff, 1.35);
        _addShadowedLight(-0.5, -1, 1, 0xffaa00, 1);

        // renderer
        renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true
        });
        renderer.setClearColor(0xE0E0E0, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(controllerWidth, controllerHeight);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);

        orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControl.maxPolarAngle = Math.PI / 4 * 3;
        orbitControl.maxDistance = 1000;
        orbitControl.noKeys = true;
        orbitControl.noZoom = true;
        orbitControl.addEventListener('change', updateOrbitControl);

        render();
    }

    function setCameraPosition(refCamera) {
        if (!$.isEmptyObject(refCamera)) {
            var p = refCamera.position,
                r = refCamera.rotation;

            camera.position.set(p.x, p.y, p.z);
            camera.rotation.set(r.x, r.y, r.z);
            render();
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

    function updateOrbitControl(e) {
        reactSrc._updateCamera(camera);
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

    return {
        init: init,
        setCameraPosition: setCameraPosition
    };
});
