define([
    'react',
    'jsx!views/beambox/Right-Panels/Laser-Panel',
], function(
    React,
    LaserPanel
){

    const _defaultConfig = {
        speed: 100,
        strength: 50,
        mode: 'ENGRAVE' //CUT, ENGRAVE
    }

    const _getLayer = function(name) {
        const layer = $('#svgcontent').find('g.layer').filter(function(){
            return $(this).find('title').text() === name;
        });
        return layer;
    }
    const _getData = function(name, attr) {
        let val = _getLayer(name).attr('data-' + attr);
        val = val||_writeData(name, attr, _defaultConfig[attr]);
        return val;
    }
    const _writeData = function(name, attr, val) {
        return _getLayer(name).attr('data-' + attr, val);
    }

    const _getMode = function(name) {
        return _getData(name, 'mode');
    }
    const _getSpeed = function(name) {
        return _getData(name, 'speed');
    }
    const _getStrength = function(name) {
        return _getData(name, 'strength');
    }
    const _getStoredStrength = function(name) {
        return _getData(name, 'storedStrength');
    }
    

    const writeMode = function(name, val) {
        const prevMode = _getMode(name);
        if(prevMode==='ENGRAVE' && val==='CUT') {
            _writeStoredStrength(name, _getStrength(name));
            writeStrength(name, 100);
        } else if(prevMode==='CUT' && val==='ENGRAVE') {
            writeStrength(name, _getStoredStrength(name));
        }
        return _writeData(name, 'mode', val);
    }
    const writeSpeed = function(name, val) {
        return _writeData(name, 'speed', val);
    }
    const writeStrength = function(name, val) {
        return _writeData(name, 'strength', val);
    }
    const _writeStoredStrength = function(name, val) {
        return _writeData(name, 'storedStrength', val);
    }
    

    class LaserPanelController {
        constructor() {
            this.reactRoot = '';
            this.funcs = {
                writeSpeed: writeSpeed,
                writeStrength: writeStrength,
                writeMode: writeMode
            }
        }
        init(reactRoot) {
            this.reactRoot = reactRoot;
        }

        initConfig(name) {
            writeSpeed(name, _defaultConfig.speed);
            writeStrength(name, _defaultConfig.strength);
            writeMode(name, _defaultConfig.mode);
        }

        cloneConfig(name, baseName) {
            writeSpeed(name, _getSpeed(baseName));
            writeStrength(name, _getStrength(baseName));
            writeMode(name, _getMode(baseName));            
        }

        render(name) {
            const mode = _getMode(name);
            const speed = _getSpeed(name);
            const strength = _getStrength(name);
            
            React.render(
                <LaserPanel
                    layerName={name}
                    mode={mode}
                    speed={speed}
                    strength={strength}
                    funcs={this.funcs}
                />
                ,document.getElementById(this.reactRoot)
            );
        }
    }

    const instance = new LaserPanelController();

    return instance;
});