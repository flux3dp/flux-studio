define(['jquery', 'threejs'], function($) {
    'use strict';

    return function (obj, camera, container) {
        if (!$.isEmptyObject(obj)) {
            var vector = new THREE.Vector3(),
                widthHalf = 0.5 * container.offsetWidth,
                heightHalf = 0.5 * container.offsetHeight;

            obj.updateMatrixWorld();
            vector.setFromMatrixPosition(obj.matrixWorld);
            vector.project(camera);

            vector.x = (vector.x * widthHalf) + widthHalf;
            vector.y = -(vector.y * heightHalf) + heightHalf;

            return {
                x: vector.x,
                y: vector.y
            };
        }
        else {
            return {
                x: undefined,
                y: undefined
            };
        }
    };
});