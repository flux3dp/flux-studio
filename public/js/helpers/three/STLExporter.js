define(['jquery', 'threejs'], function($) {
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

        exportTo: ( function () {

            var vector = new THREE.Vector3();

            return function exportTo( geometry, fileSystem, path ) {
                console.log('exporting...');
                const d = $.Deferred();

                fileSystem.writeFileSync(path, ''); //replace old data;
                const wstream = fileSystem.createWriteStream(path);
                wstream.on('finish', ()=>{
                    d.resolve();
                })

                wstream.write('solid exported\n');

                if( geometry instanceof THREE.BufferGeometry ) {
                    geometry = new THREE.Geometry().fromBufferGeometry( geometry );

                }

                if ( geometry instanceof THREE.Geometry ) {
                    var vertices = geometry.vertices;
                    var faces = geometry.faces;

                    for ( var i = 0, l = faces.length; i < l; i ++ ) {

                        var face = faces[ i ];

                        vector.copy( face.normal );

                        wstream.write('\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n\t\touter loop\n');

                        var indices = [ face.a, face.b, face.c ];

                        for ( var j = 0; j < 3; j ++ ) {

                            vector.copy( vertices[ indices[ j ] ] );

                            wstream.write('\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n');

                        }

                        wstream.write('\t\tendloop\n\tendfacet\n');

                    }

                }

                wstream.write('endsolid exported\n');
                wstream.end();

                return d.promise();

            };

        }() )

    };

    return STLExporter;

});