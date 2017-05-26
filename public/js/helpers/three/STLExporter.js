define(['threejs'], function() {
    'use strict';

    /**
     * @author kovacsv / http://kovacsv.hu/
     * @author mrdoob / http://mrdoob.com/
     * 
     * modified by jeff
     */

    let STLExporter = function () {};

    STLExporter.prototype = {

        constructor: STLExporter,

        parse: ( function () {

            var vector = new THREE.Vector3();

            return function parse( geometry ) {

                var output = '';

                output += 'solid exported\n';

                if( geometry instanceof THREE.BufferGeometry ) {

                    geometry = new THREE.Geometry().fromBufferGeometry( geometry );

                }

                if ( geometry instanceof THREE.Geometry ) {

                    var vertices = geometry.vertices;
                    var faces = geometry.faces;

                    for ( var i = 0, l = faces.length; i < l; i ++ ) {

                        var face = faces[ i ];

                        vector.copy( face.normal );

                        output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
                        output += '\t\touter loop\n';

                        var indices = [ face.a, face.b, face.c ];

                        for ( var j = 0; j < 3; j ++ ) {

                            vector.copy( vertices[ indices[ j ] ] );

                            output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';

                        }

                        output += '\t\tendloop\n';
                        output += '\tendfacet\n';

                    }

                }

                output += 'endsolid exported\n';

                return output;

            };

        }() )

    };

    return STLExporter;

});