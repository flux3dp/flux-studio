define([
    'react',
    'reactDOM',
    'jsx!views/beambox/Right-Panels/Laser-Panel',
    'reactCreateReactClass'
], function(
    React,
    ReactDOM,
    LaserPanel
){

    const _defaultConfig = {
        speed: 50,
        strength: 15,
        repeat: 1
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

    const _getSpeed = function(name) {
        return _getData(name, 'speed');
    }

    const _getStrength = function(name) {
        return _getData(name, 'strength');
    }
    
    const _getRepeat = function(name) {
        return _getData(name, 'repeat');
    }

    const writeSpeed = function(name, val) {
        return _writeData(name, 'speed', val);
    }

    const writeStrength = function(name, val) {
        return _writeData(name, 'strength', val);
    }

    const writeRepeat = function(name, val) {
        return _writeData(name, 'repeat', val);
    }    

    class LaserPanelController {
        constructor() {
            this.reactRoot = '';
            this.funcs = {
                writeSpeed: writeSpeed,
                writeStrength: writeStrength,
                writeRepeat: writeRepeat,
            }
        }
        init(reactRoot) {
            this.reactRoot = reactRoot;
        }

        initConfig(name) {
            _getSpeed(name, _defaultConfig.speed);
            _getStrength(name, _defaultConfig.strength);
            _getRepeat(name, _defaultConfig.repeat);
        }

        cloneConfig(name, baseName) {
            writeSpeed(name, _getSpeed(baseName));
            writeStrength(name, _getStrength(baseName));
            writeRepeat(name, _getRepeat(baseName));
        }

        render(name) {
            const speed = _getSpeed(name);
            const strength = _getStrength(name);
            const repeat = _getRepeat(name);
            
            ReactDOM.render(
                <LaserPanel
                    layerName={name}
                    speed={speed}
                    strength={strength}
                    repeat={repeat}
                    funcs={this.funcs}
                />
                ,document.getElementById(this.reactRoot)
            );
        }
    }

    const instance = new LaserPanelController();

    return instance;
});