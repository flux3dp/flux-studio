define([
    'threejs',
    'threeOrbitControls',
    'threeTransformControls',
    'threeCircularGridHelper'
], function() {
    'use strict';

    var THREE = window.THREE || {},
        geometry = new THREE.BufferGeometry(),
        container, camera, scene, renderer, controls, transform_control, cylinder,
        settings = {
            diameter: 170,
            radius: 850,
            height: 1800,
            step: 15,
            upVector: new THREE.Vector3(0, 0, 1),
            color:  0x777777,
            opacity: 0.2,
            text: true,
            textColor: '#000000',
            textPosition: 'center'
        };

    function init() {
        container = document.getElementById('model-displayer');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 70, container.offsetWidth / container.offsetHeight, 1, 300000 );
        camera.position.set(100, 100, 40);
        camera.lookAt( new THREE.Vector3( 0, 0, 1 ) );
        camera.up = new THREE.Vector3(0, 0, 1);

        // add circular grid helper
        addCircularGridHelper();

        // add controls
        addControls();

        // add light
        addLights();

        renderer = new THREE.WebGLRenderer({
            antialias: false
        });
        renderer.setClearColor( 0xE0E0E0, 1 );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);

        animate();
    }

    function addCircularGridHelper() {
        // circular grid helper
        var circularGridHelper = new CircularGridHelper(
            settings.diameter,
            settings.step,
            settings.upVector,
            settings.color,
            settings.opacity,
            settings.text,
            settings.textColor,
            settings.textPosition,
            0
        );
        scene.add(circularGridHelper);
    }

    function createCylinder(mesh) {
        var box = new THREE.Box3().setFromObject(mesh),
            mesh_size = box.size(),
            material = new THREE.MeshLambertMaterial( { color: 0xffff00, transparent: true, opacity: 0.3 } ),
            geometry, radius;

        radius = Math.max(mesh_size.x, mesh_size.z);

        geometry = new THREE.CylinderGeometry( radius, radius, mesh_size.y, 32 );
        cylinder = new THREE.Mesh( geometry, material );
        cylinder.rotateX(90 * Math.PI / 180);
        cylinder.position.z = mesh_size.z / 2;

        transform_control = new THREE.TransformControls( camera, renderer.domElement );

        scene.add(transform_control);

        scene.add(cylinder);

        transform_control.addEventListener('change', render);
        transform_control.attach(cylinder);
        transform_control.setMode('scale');
        transform_control.setSpace('local');

        return cylinder;
    }

    function removeCylinder(cylinder) {
        transform_control.detach(cylinder);
        scene.remove(cylinder);
    }

    function setupGeometry(model_data) {
        var SET_ELEM_NUMBER = 6,
            X = 0,
            Y = 1,
            Z = 2,
            RED = 3,
            GREEN = 4,
            BLUE = 5,
            number_sets = model_data.length / SET_ELEM_NUMBER,
            vertices = new Float32Array( number_sets * 3 ), // three components per vertex
            colors = new Float32Array( number_sets * 3 ),
            color = new THREE.Color();

        // components of the position vector for each vertex are stored
        // contiguously in the buffer.
        for ( var i = 0; i < model_data.length; i += SET_ELEM_NUMBER ) {
            vertices[ i / 2 + 0 ] = model_data[ i + X ];
            vertices[ i / 2 + 1 ] = model_data[ i + Y ];
            vertices[ i / 2 + 2 ] = model_data[ i + Z ];

            color.setRGB(
                model_data[ i + RED ],
                model_data[ i + GREEN ],
                model_data[ i + BLUE ]
            );

            colors[ i / 2 + 0 ] = color.r;
            colors[ i / 2 + 1 ] = color.g;
            colors[ i / 2 + 2 ] = color.b;
        }

        geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        geometry.addAttribute( 'color', new THREE.BufferAttribute(colors, 3));

        geometry.dynamic = true;
        geometry.computeBoundingBox();

        return geometry;
    }

    function appendModel(model_data) {
        var material, geometry, mesh;

        geometry = setupGeometry(model_data);

        material = new THREE.PointCloudMaterial({
            size: 0.01,
            vertexColors: THREE.VertexColors
        });

        mesh = new THREE.PointCloud( geometry, material );

        scene.add( mesh );

        return mesh;
    }

    function updateMesh(mesh, model_data) {
        mesh.geometry = setupGeometry(model_data);

        // refs: https://github.com/mrdoob/three.js/wiki/Migration#r56--r57
        mesh.geometry.attributes.position.needsUpdate = true;
        mesh.geometry.attributes.color.needsUpdate = true;
        render();

        return mesh;
    }

    function addControls() {
        controls = new THREE.OrbitControls( camera, container );
        controls.rotateSpeed = 2.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 1.8;

        controls.noZoom = false;
        controls.noPan = false;
        controls.noRotate = false;
        controls.maxDistance = 300;
        controls.minDistance = 40;
        controls.maxPolarAngle = Math.PI/2;
        controls.noKeys = true;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.addEventListener( 'change', render );
    }

    function addLights() {
        scene.add(new THREE.AmbientLight(0xffffff));

        var light1 = new THREE.DirectionalLight(0xffffff, 0.5);
        light1.position.set(1, 1, 1);
        scene.add(light1);

        var light2 = new THREE.DirectionalLight(0xffffff, 1.5);
        light2.position.set(0, -1, 0);
        scene.add(light2);
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();

        render();
    }

    function render() {
        renderer.render(scene, camera);

        if ('undefined' !== typeof transform_control) {
            transform_control.update();
        }

        if ('undefined' !== typeof cylinder) {
            var box = new THREE.Box3().setFromObject(cylinder).size();
            cylinder.position.z = box.z / 2;
        }
    }

    return {
        init: init,
        appendModel: appendModel,
        updateMesh: updateMesh,
        cylinder: {
            create: createCylinder,
            remove: removeCylinder
        }

    };
});