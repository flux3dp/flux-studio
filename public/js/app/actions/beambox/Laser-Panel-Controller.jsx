define([
    'react',
    'jsx!views/beambox/Right-Panels/Laser-Panel',
], function(
    React,
    LaserPanel
){

    const _defaultConfig = {
        speed: 150,
        strength: 15
        ,
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
    const writeSpeed = function(name, val) {
        return _writeData(name, 'speed', val);
    }
    const writeStrength = function(name, val) {
        return _writeData(name, 'strength', val);
    }
    

    class LaserPanelController {
        constructor() {
            this.reactRoot = '';
            this.funcs = {
                writeSpeed: writeSpeed,
                writeStrength: writeStrength,
            }
        }
        init(reactRoot) {
            this.reactRoot = reactRoot;
        }

        initConfig(name) {
            writeSpeed(name, _defaultConfig.speed);
            writeStrength(name, _defaultConfig.strength);
        }

        cloneConfig(name, baseName) {
            writeSpeed(name, _getSpeed(baseName));
            writeStrength(name, _getStrength(baseName));
        }

        render(name) {
            const speed = _getSpeed(name);
            const strength = _getStrength(name);
            
            React.render(
                <LaserPanel
                    layerName={name}
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