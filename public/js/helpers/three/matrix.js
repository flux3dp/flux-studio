define(['threejs'], function() {
    'use strict';

    return function(model) {
        var rotation = model.rotation,
            box = new THREE.Box3().setFromObject(model),
            center = box.center(),
            size = box.size();

        return {
            position: {
                center: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                },
                x: model.position.x,
                y: model.position.y,
                z: model.position.z
            },
            scale: model.scale,
            size: {
                x: size.x,
                y: size.y,
                z: size.z
            },
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z
            }
        };
    };
});