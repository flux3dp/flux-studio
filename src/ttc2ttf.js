const fs = require('fs');
const os = require('os');
const path = require('path');
const bufferpack = require('bufferpack');
const fontkit = require('fontkit');

const unpack = bufferpack.unpack.bind(bufferpack);
const packTo = bufferpack.packTo.bind(bufferpack);

const tmpFontCachePath = os.tmpdir();
console.log('tmpFontCachePath: ', tmpFontCachePath);

const ttc2ttf = async (_ttcFontPath, _postscriptName = '') => {
    if (!isTTC(_ttcFontPath)) {
        return false;
    }
    const hashPath = path.join(tmpFontCachePath, getHashCode(_ttcFontPath, _postscriptName) + '.ttf');
    try {
        fs.accessSync(hashPath);
    } catch (error) {
        console.log(`catch ${error.name}: ${error.message}`);
        await devideTTC(_ttcFontPath);
    }
    return hashPath;

};

const isTTC = (_fontPath) => {
    const buf = fs.readFileSync(_fontPath);
    const fileType = unpack('4c', buf, 0x00).join('');
    if (fileType !== 'ttcf') {
        console.log('This is not ttcf format. %s is %s', _fontPath, fileType);
        return false;
    }
    return true;
};

const getHashCode = (_ttcPath, _postscriptName) => {
    const str = [path.normalize(_ttcPath), _postscriptName].join('+');
    let hash = 0;
    if (str.length == 0) { return hash; }
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
};

const devideTTC = async (_ttcFontPath) => {
    const buf = fs.readFileSync(_ttcFontPath);
    const ttf_count = unpack('!L', buf, 0x08)[0];
    const ttf_offset_array = unpack('!' + ttf_count + 'L', buf, 0x0C);
    for (let i = 0; i < ttf_count; i++) {

        const table_header_offset = ttf_offset_array[i];

        const table_count = unpack('!H', buf, table_header_offset + 0x04)[0];
        const header_length = 0x0C + table_count * 0x10;

        let table_length = 0;
        for (let j = 0; j < table_count; j++) {
            const length = unpack('!L', buf, table_header_offset + 0x0C + 0x0C + j * 0x10)[0];
            table_length += ceil4(length);
        }
        const total_length = header_length + table_length;

        const new_buf = new Buffer(total_length);
        const header = unpack(header_length + 'c', buf, table_header_offset);
        packTo(header_length + 'c', new_buf, 0, header);
        let current_offset = header_length;

        for (let j = 0; j < table_count; j++) {
            const offset = unpack('!L', buf, table_header_offset + 0x0C + 0x08 + j * 0x10)[0];
            const length = unpack('!L', buf, table_header_offset + 0x0C + 0x0C + j * 0x10)[0];
            packTo('!L', new_buf, 0x0C + 0x08 + j * 0x10, [current_offset]);
            const current_table = unpack(length + 'c', buf, offset);
            packTo(length + 'c', new_buf, current_offset, current_table);

            current_offset += ceil4(length);
        }

        const ttfFont = fontkit.create(new_buf);
        const postscriptName = ttfFont.postscriptName.toString();
        const ttfPath = path.join(tmpFontCachePath, `${getHashCode(_ttcFontPath, postscriptName)}.ttf`);

        console.log('fullName: ', ttfFont.fullName.toString());
        console.log('\tpostscriptName: ', postscriptName);
        console.log('\tttfPath: ', ttfPath);

        fs.writeFileSync(ttfPath, new_buf);
    }
};


function ceil4(n) {
    return (n + 3) & ~3;
}

module.exports = ttc2ttf;
