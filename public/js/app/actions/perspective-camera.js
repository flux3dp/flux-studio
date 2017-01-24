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
        scene = new THREE.Scene();

        var aspect = controllerWidth / controllerHeight,
            d = 200;

        camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        camera.position.set( 0, -300, 110 );
        camera.up = new THREE.Vector3(0, 0, 1);
		camera.rotation.y = - Math.PI / 4;
		camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) );

        defaultDistance = camera.position.length();
        offsetRatio = Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2) + Math.pow(camera.position.z, 2)) / defaultDistance;

        var geometry = new THREE.BoxGeometry(200, 200, 200),
            material = {},
            MultiMaterial,
            domEvents,
            cube;

        let p01 = getMaterialFromImage('img/pc-front.png'),
            p02 = getMaterialFromImage('img/pc-back.png'),
            p03 = getMaterialFromImage('img/pc-left.png'),
            p04 = getMaterialFromImage('img/pc-right.png'),
            p05 = getMaterialFromImage('img/pc-bottom.png'),
            p06 = getMaterialFromImage('img/pc-top.png'),

            p07 = getMaterialFromImage('img/pc-right-hover.png'),
            p08 = getMaterialFromImage('img/pc-left-hover.png'),
            p09 = getMaterialFromImage('img/pc-back-hover.png'),
            p10 = getMaterialFromImage('img/pc-front-hover.png'),
            p11 = getMaterialFromImage('img/pc-top-hover.png'),
            p12 = getMaterialFromImage('img/pc-bottom-hover.png');

        $.when(p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12)
        .done((front, back, left, right, bottom, top, frontOn, backOn, leftOn, rightOn, bottomOn, topOn) => {
            buildCube({
                front, back, left, right, bottom, top,
                frontOn, backOn, leftOn, rightOn, bottomOn, topOn
            });
        });


        const buildCube = (m) => {
            material.front = m.front;
            material.back = m.back;
            material.left = m.left;
            material.right = m.right;
            material.bottom = m.bottom;
            material.top = m.top;
            material.hover = [m.frontOn, m.backOn, m.leftOn, m.rightOn, m.bottomOn, m.topOn];
            MultiMaterial = new THREE.MultiMaterial([material.right, material.left, material.back, material.front, material.top, material.bottom]);

            cube = new THREE.Mesh(geometry, MultiMaterial);
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
            orbitControl.enableKeys = false;
            orbitControl.enableZoom = false;
            orbitControl.enablePan = false;
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
        };
    }

    function setCameraPosition(refCamera) {
        if (!$.isEmptyObject(refCamera)) {
            var p = refCamera.position,
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
        scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));
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
        if(renderer) {
            renderer.render(scene, camera);
        }
    }

    function getMaterialFromImage(url) {
        let d = $.Deferred();
        let loader = new THREE.TextureLoader();
        loader.load(url, (texture) => {
            d.resolve(new THREE.MeshBasicMaterial({ map: texture }));
        });
        return d.promise();
    }

    return {
        init: init,
        setCameraPosition: setCameraPosition
    };
});
