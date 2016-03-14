define([
    'jquery',
    'helpers/three/threex.domevents',
    'threeOrbitControls'
], function ($) {
    'use strict';

    var THREE = window.THREE || {},
        container,
        reactSrc;

    var controllerWidth = 165,
        controllerHeight = 150;

    var camera, scene, renderer;
    var orbitControl,
        defaultDistance, offsetRatio;

    function init(src) {
        reactSrc = src;
        container = document.getElementById('cameraViewController');

        camera = new THREE.PerspectiveCamera(65, controllerWidth / controllerHeight, 1, 30000);
        camera.position.set(0, -300, 110);
        camera.up = new THREE.Vector3(0, 0, 1);
        defaultDistance = camera.position.length();
        offsetRatio = Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2) + Math.pow(camera.position.z, 2)) / defaultDistance;

        scene = new THREE.Scene();

        var geometry = new THREE.BoxGeometry(200, 200, 200),
            material = {},
            meshFaceMaterial,
            domEvents,
            cube;

        material.front      = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-front.png') });
        material.back       = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-back.png') });
        material.left       = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-left.png') });
        material.right      = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-right.png') });
        material.bottom     = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-bottom.png') });
        material.top        = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-top.png') });
        material.hover      = [
            new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-right-hover.png') }),
            new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-left-hover.png') }),
            new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-back-hover.png') }),
            new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-front-hover.png') }),
            new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-top-hover.png') }),
            new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('img/pc-bottom-hover.png') })
        ];
        meshFaceMaterial    = new THREE.MeshFaceMaterial([material.right, material.left, material.back, material.front, material.top, material.bottom]);

        cube = new THREE.Mesh(geometry, meshFaceMaterial);
        scene.add(cube);

        THREE.DefaultLoadingManager.onLoad = function () {
            render();
        };

        scene.add(new THREE.AmbientLight(0x777777));
        _addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        _addShadowedLight(0.5, 1, -1, 0xffaa00, 1);
        _addShadowedLight(-1, -1, -1, 0xffffff, 1.35);
        _addShadowedLight(-0.5, -1, 1, 0xffaa00, 1);

        // renderer
        renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
            alpha: true
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(controllerWidth, controllerHeight);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);

        domEvents = new THREEx.DomEvents(camera, renderer.domElement);

        orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControl.maxPolarAngle = Math.PI / 4 * 3;
        orbitControl.maxDistance = 300;
        orbitControl.noKeys = true;
        orbitControl.noZoom = true;
        orbitControl.noPan = true;
        orbitControl.addEventListener('change', updateMainOrbitControl);

        var resetMeshMaterial = function() {
            cube.material.materials = [material.right, material.left, material.back, material.front, material.top, material.bottom];
        };

        domEvents.addEventListener(cube, 'mousemove', function(event) {
            var faceIndex = event.intersect.face.materialIndex;
            resetMeshMaterial();
            cube.material.materials[faceIndex] = material.hover[faceIndex];
            render();
        });

        domEvents.addEventListener(cube, 'mouseout', function() {
            resetMeshMaterial();
            render();
        });

        render();
    }

    function setCameraPosition(refCamera) {
        if (!$.isEmptyObject(refCamera)) {
            var p = refCamera.position.raw,
                r = refCamera.rotation;

            offsetRatio = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2) + Math.pow(p.z, 2)) / defaultDistance;
            offsetRatio *= 1.1;
            camera.position.set(p.x / offsetRatio, p.y / offsetRatio, p.z / offsetRatio);
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

    function updateMainOrbitControl(e) {
        var c = camera.clone();
        c.position.set(
            c.position.x * offsetRatio,
            c.position.y * offsetRatio,
            c.position.z * offsetRatio
        );
        reactSrc._updateCamera(c);
    }

    function render() {
        renderer.render(scene, camera);
    }

    return {
        init: init,
        setCameraPosition: setCameraPosition
    };
});
