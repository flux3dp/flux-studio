let clib = require('./build/Release/cSTLHelper')
let face = 10000;


function toArrayBuffer() {
    var buffer = new ArrayBuffer(face * 50);
    var view = new DataView(buffer);
    for (var i = 0; i < face; ++i) {
        view.setFloat32(i * 50, i, true);
        view.setFloat32(i * 50 + 4, i, true);
        view.setFloat32(i * 50 + 8, i, true);
        for (var j = 0; j < 3; ++j) {
            view.setFloat32(i * 50 + 12 + j * 12, i + j + 1000, true);
            view.setFloat32(i * 50 + 12 + j * 12 + 4, i + j + 4 + 1000, true);
            view.setFloat32(i * 50 + 12 + j * 12 + 8, i + j + 8 + 1000, true);
        }
        view.setUint16(i * 50 + 48, 23456, true);
    }
    return buffer;
}

let ab = toArrayBuffer();
console.log(new Float32Array(ab, 0, face * 12));
console.log(clib.parseStl(ab, 0, face));