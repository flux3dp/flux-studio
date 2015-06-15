define([
    'jquery',
    'helpers/file-system',
    'helpers/display',
    'threeTransformControls',
    'threeSTLLoader'
], function($, fileSystem, display) {
    'use strict';

    var container, stats;

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

            mesh.position.set(0, 1, 0);
            mesh.scale.set(2, 2, 2);

            scene.add(mesh);

            objects.push(mesh);
        });
    }

    function init() {

        container = document.getElementById('model-displayer');

        camera = new THREE.PerspectiveCamera( 70, container.offsetWidth / container.offsetHeight, 1, 3000 );
        camera.position.set(200, 100, 200);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        scene = new THREE.Scene();

        // grid helper
        var gridHelper = new THREE.GridHelper( 500, 50 );
        scene.add( gridHelper );

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

        //
        control = new THREE.TransformControls( camera, renderer.domElement );
        control.addEventListener( 'change', render );

        window.addEventListener('resize', onWindowResize, false);

        window.addEventListener( 'keydown', function ( event ) {
            switch ( event.keyCode ) {
            case 81: // Q
                control.setSpace( control.space == "local" ? "world" : "local" );
                break;
            case 87: // W
                control.setMode( "translate" );
                break;
            case 68: // D
                if ('undefined' !== typeof SELECTED) {
                    scene.remove(SELECTED);
                    control.detach(SELECTED);
                    scene.remove(control);
                }
                break;
            case 69: // E
                control.setMode( "rotate" );
                break;
            case 82: // R
                control.setMode( "scale" );
                break;
            case 187:
            case 107: // +,=,num+
                control.setSize( control.size + 0.1 );
                break;
            case 189:
            case 10: // -,_,num-
                control.setSize( Math.max(control.size - 0.1, 0.1 ) );
                break;
            }
        });

        renderer.domElement.addEventListener(
            'mousedown',
            function(e) {
                SELECTED = onDocumentMouseDown(e);
            },
            false
        );
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
        //requestAnimationFrame(animate);
        render();
    }

    function render() {
        control.update();
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

            scene.add(control);
            selected = intersects[0].object;
            control.attach(selected);

        }

        return selected;
    }

    return function(args) {
        init();
        animate();

        var $uploader = $('#uploader'),
            $uploader_file_control = $uploader.find('[type="file"]'),
            $print_mode = $('[name="print-mode"]'),
            toggleMode = function() {
                switch ($('[name="print-mode"]:checked').val()) {
                case 'expert':
                    require(['jsx!views/print-operating-panels/Expert'], function(view) {
                        display(view, args, $('#operating-panel')[0]);
                    });
                    break;
                case 'beginner':
                    require(['jsx!views/print-operating-panels/Beginner'], function(view) {
                        display(view, args, $('#operating-panel')[0]);
                    });
                    break;
                }
            },
            readfiles = function(files) {
                for (var i = 0; i < files.length; i++) {
                    fileSystem.writeFile(
                        files.item(i),
                        {
                            onComplete: function(e, fileEntry) {
                                appendModel(fileEntry.toURL());
                            }
                        }
                    );

                }

                toggleMode();
            };

        $uploader_file_control.on('change', function(e) {
            readfiles(this.files);
        });

        $uploader.on('dragover dragend', function() {
            return false;
        });

        $uploader.on('drop', function(e) {
            e.preventDefault();
            readfiles(e.originalEvent.dataTransfer.files);
        });

        $print_mode.on('click', function(e) {
            toggleMode();
        });
    };
});