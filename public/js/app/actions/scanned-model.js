define([
    'jquery',
    'helpers/three/to-screen-position',
    'helpers/three/matrix',
    'threejs',
    'threeOrbitControls',
    'threeTransformControls',
    'threeCircularGridHelper',
    'threeSTLLoader'
], function($, toScreenPosition, matrix) {
    'use strict';

    var THREE = window.THREE || {},
        container, camera, scene, renderer, cylinder, orbitControl,
        MESH_CHILD_INDEX = 5,
        settings = {
            diameter: 170,
            radius: 850,
            height: 1800,
            step: 10,
            upVector: new THREE.Vector3(0, 0, 1),
            color:  0x777777,
            opacity: 0.4,
            text: true,
            textColor: '#000000',
            textPosition: 'center'
        },
        fov = 70,
        far = 3000,
        originalCameraRotation;

    function destroy() {
        camera = scene = renderer = orbitControl = cylinder = undefined;
    }

    function init() {
        container = document.getElementById('model-displayer');

        if ('undefined' === typeof scene) {
            scene = new THREE.Scene();
            window.scene = scene;

            camera = new THREE.PerspectiveCamera( fov, container.offsetWidth / container.offsetHeight, 1, far );
            camera.up = new THREE.Vector3(0, 0, 1);
            camera.position.set(-100, 100, 120);
            camera.lookAt( new THREE.Vector3( -5, -5, 0 ) );

            originalCameraRotation = camera.rotation.clone();

            scene.add(camera);

            // add circular grid helper
            addCircularGridHelper();

            // add light
            addLights();

            renderer = new THREE.WebGLRenderer({
                antialias: false
            });
            renderer.setClearColor( 0xE2E1E0, 1 );
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            container.appendChild(renderer.domElement);

            addOrbitControls();

            window.addEventListener('resize', onWindowResize, false);

            render();
        }

        return {
            scene: scene,
            renderer: renderer,
            camera: camera
        };
    }

    function loadStl(blob, callback) {
        callback = callback || function() {};

        var loader = new THREE.STLLoader(),
            url = window.URL,
            objectUrl = url.createObjectURL(blob);

        loader.load(objectUrl, function(geometry) {
            var material = new THREE.MeshPhongMaterial({
                    color: 0x333333,
                    specular: 0x888888,
                    shininess: 1
                }),
                mesh = new THREE.Mesh(geometry, material),
                wfh = new THREE.WireframeHelper( mesh, 0x0fff00 );

            if (true === window.FLUX.debug) {
                wfh.material.depthTest = false;
                wfh.material.opacity = 0.25;
                wfh.material.transparent = true;
            }

            material.side = THREE.DoubleSide;

            mesh.up = new THREE.Vector3(0, 0, 1);

            addMesh(mesh);
            callback(mesh);
            render();
        });
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

    function refreshPosition(mesh, objectChange, delay) {
        return function() {
            var matrixValue = matrix(mesh),
                timer,
                objectScreenPosition = toScreenPosition(mesh, camera, container);

            if (true === delay) {
                clearTimeout(timer);
                // delay 0.1s
                timer = setTimeout(function() {
                    objectChange(objectScreenPosition, matrixValue);
                }, 100);
            }
            else {
                objectChange(objectScreenPosition, matrixValue);
            }
        };
    }

    function attachControl(mesh, objectChange, delay) {
        delay = ('boolean' === typeof delay ? delay : true);
        objectChange = objectChange || function() {};

        var setMode = function(mode) {
                mesh = createTransformControls(mesh);
                mesh.transformControl.setMode(mode);

                render();
            },
            createTransformControls = function(mesh) {
                if ('undefined' === typeof mesh.transformControl) {
                    var transformControl = new THREE.TransformControls( camera, renderer.domElement ),
                        timer;

                    mesh.onObjectChange = refreshPosition(mesh, objectChange, delay);

                    transformControl.addEventListener('change', render);
                    transformControl.addEventListener('mouseDown', function(e) {
                        orbitControl.enabled = false;
                    });
                    transformControl.addEventListener('mouseUp', function(e) {
                        orbitControl.enabled = true;
                    });
                    transformControl.addEventListener('objectChange', function() {
                        orbitControl.enabled = false;
                        mesh.onObjectChange();
                    });
                    transformControl.setSpace('world');

                    transformControl.attach(mesh);
                    scene.add(transformControl);

                    mesh.transformControl = transformControl;
                    mesh.transform = methods;
                }

                return mesh;
            },
            methods = {
                hide: function() {
                    mesh.transformControl.visible = false;
                    // avoid overlay to other transform control even this control was visible
                    mesh.transformControl.size = 0.1;
                    render();

                    return methods;
                },
                show: function() {
                    mesh.transformControl.visible = true;
                    mesh.transformControl.size = 1;
                    render();

                    return methods;
                },
                remove: function() {
                    mesh.transformControl.detach(mesh);
                    render();

                    return methods;
                },
                scale: function() {
                    setMode('scale');
                    render();

                    return methods;
                },
                rotate: function() {
                    setMode('rotate');
                    render();

                    return methods;
                },
                translate: function() {
                    setMode('translate');
                    render();

                    return methods;
                }
            };

        // default mode
        methods.translate();

        return methods;
    }

    function createCylinder(mesh) {
        var matrixValue = matrix(mesh),
            mesh_size = matrixValue.size,
            material = new THREE.MeshLambertMaterial( { color: 0xffff00, transparent: true, opacity: 0.3 } ),
            geometry, radius;

        radius = Math.min(Math.max(mesh_size.x, mesh_size.z), settings.diameter) / 2;
        mesh_size.y = Math.min(mesh_size.z, settings.diameter);

        geometry = new THREE.CylinderGeometry( radius, radius, mesh_size.y, 32 );
        cylinder = new THREE.Mesh( geometry, material );
        cylinder.rotateX(90 * Math.PI / 180);
        cylinder.position.set(matrixValue.position.x, matrixValue.position.y, matrixValue.position.center.z);
        mesh.add(cylinder);

        attachControl(cylinder, function(objectScreenPosition, matrixValue) {
            var currentScale = {
                    x: matrixValue.scale.x,
                    y: matrixValue.scale.y,
                    z: matrixValue.scale.z
                },
                previusScale = cylinder.previusScale || currentScale;

            // fixed scale
            if (currentScale.x !== previusScale.x) {
                currentScale.z = currentScale.x;
                cylinder.scale.z = currentScale.z;
            }
            else if (currentScale.z !== previusScale.z) {
                currentScale.x = currentScale.z;
                cylinder.scale.x = currentScale.x;
            }

            cylinder.previusScale = currentScale;
        }, false).scale().show();

        cylinder.transformControl.size = 1;
        render();

        return cylinder;
    }

    function removeCylinder(mesh) {
        if ('undefined' !== typeof mesh) {
            mesh.remove(cylinder);
        }
        removeMesh(cylinder);
    }

    function removeMesh(mesh) {
        mesh = mesh || {};

        if ('undefined' !== typeof mesh.transformControl) {
            scene.remove(mesh.transformControl);
        }

        scene.remove(mesh);
        render();
    }

    function addMesh(mesh) {
        scene.add(mesh);

        if ('undefined' !== typeof mesh.transformControl) {
            scene.add(mesh.transformControl);
        }

        render();
    }

    function setupGeometry(model_data, geometry) {
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

        // refs: https://github.com/mrdoob/three.js/wiki/Migration#r56--r57
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;

        return geometry;
    }

    function appendModel(model_data) {
        var material, mesh,
            geometry = new THREE.BufferGeometry();

        setupGeometry(model_data, geometry);

        material = new THREE.PointCloudMaterial({
            size: 0.5,
            opacity: 0.6,
            transparent: true,
            vertexColors: THREE.VertexColors
        });

        mesh = new THREE.PointCloud( geometry, material );

        addMesh( mesh );

        return mesh;
    }

    function updateMesh(mesh, model_data) {
        mesh.geometry = setupGeometry(model_data, mesh.geometry);

        render();

        return mesh;
    }

    function addOrbitControls() {
        orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControl.target = new THREE.Vector3(0, 0, 35);
        orbitControl.rotateSpeed = 2.0;
        orbitControl.zoomSpeed = 1.2;
        orbitControl.panSpeed = 1.8;

        orbitControl.enableZoom = true;
        orbitControl.enabled = true;
        orbitControl.enablePan = true;
        orbitControl.enableRotate = true;
        orbitControl.maxDistance = 300;
        orbitControl.minDistance = 40;
        orbitControl.maxPolarAngle = Math.PI/2;

        orbitControl.enableDamping = true;
        orbitControl.enableKeys = true;
        orbitControl.dampingFactor = 0.3;

        orbitControl.addEventListener('change', function(e) {
            if (true === orbitControl.enabled) {
                render();

                changeObjectDialogPosition();
            }
        });
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
        if (camera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }

        renderer.setSize(window.innerWidth, window.innerHeight);

        changeObjectDialogPosition();

        render();
    }

    function changeObjectDialogPosition() {
        scene.children.forEach(function(el) {
            if ('function' === typeof el.onObjectChange) {
                el.onObjectChange();
            }
        });
    }

    function _getCameraLook(_camera) {
        let vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(_camera.rotation, _camera.rotation.order);
        return vector;
    }

    function getBlobFromScene() {
        let ccp = camera.position.clone(),
            ccr = camera.rotation.clone(),
            d = $.Deferred(),
            ol = _getCameraLook(camera);

        camera.position.set(0, -180, 60);
        camera.rotation.set(originalCameraRotation.x, originalCameraRotation.y, originalCameraRotation.z, originalCameraRotation.order);
        camera.lookAt(new THREE.Vector3(0,380,0));
        render();

        // let s = SELECTED;
        renderer.domElement.toBlob(function(blob) {
            // let previewUrl = URL.createObjectURL(blob);
            // console.log(previewUrl);
            camera.position.set(ccp.x, ccp.y, ccp.z);
            camera.rotation.set(ccr.x, ccr.y, ccr.z, ccr.order);
            camera.lookAt(ol);
            // toggleTransformControl(false);
            render();
            cropImageUsingCanvas(blob).then((blob2) => {
                // let file = new File([blob2], 'mypreview.png', {type:'image/png', lastModified:Date.now()});
                saveAs(blob2, 'mypreview.png');
                d.resolve(blob2);
            });
        });

        return d.promise();
    }

    function cropImageUsingCanvas(data) {
        if(data instanceof Blob) {
            console.log("Loading blob", data);
            // Blob to HTMLImage
            let newImg = document.createElement('img'),
                url = URL.createObjectURL(data),
                d = $.Deferred();

            newImg.onload = function() {
                console.log("Loaded image", url, newImg.width, newImg.height);
                URL.revokeObjectURL(url);

                cropImageUsingCanvas(newImg, true).then(function(blob) {
                    console.log("Resolved cropping", url);
                    d.resolve(blob);
                });
            };

            newImg.src = url;

            return d.promise();
        }
        //HTMLImage to Canvas, Canvas to Blob
        let width = 640, height = 640,
            canvas = document.createElement('canvas'),
            sh = data.height,
            sw = data.width,
            sx = 0,
            sy = 0,
            d = $.Deferred();

        if(data.width > data.height) {
            sx = (data.width - data.height)/2;
            sw = data.height;
        }else if(data.width < data.height) {
            sy = (data.height - data.width)/2;
            sh = data.width;
        }

        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext('2d');
        console.log("drawing image element", sx, sy, sw, sh);
        context.drawImage(data, sx, sy, sw, sh, 0, 0, width, height);
        canvas.toBlob(function(blob) {
            d.resolve(blob);
        });
        return d.promise();
    }

    function render() {
        renderer.render(scene, camera);

        scene.children.forEach(function(el) {
            if ('undefined' !== typeof el.transformControl) {
                el.transformControl.update();
            }
        });

        if ('undefined' !== typeof cylinder) {
            var size = new THREE.Box3().setFromObject(cylinder).size();

            cylinder.position.z = size.z / 2;
        }
    }

    return {
        init: init,
        destroy: destroy,
        appendModel: appendModel,
        updateMesh: updateMesh,
        cylinder: {
            create: createCylinder,
            remove: removeCylinder
        },
        remove: removeMesh,
        add: addMesh,
        attachControl: attachControl,
        update: render,
        loadStl: loadStl,
        render: render,
        matrix: matrix,
        getBlobFromScene: getBlobFromScene,
        toScreenPosition: function(mesh) {
            return toScreenPosition(mesh, camera, container);
        },
        clear: function() {
            for (var i = MESH_CHILD_INDEX; i < scene.children.length; i++) {
                removeMesh(scene.children[i]);
            }
        }
    };
});
