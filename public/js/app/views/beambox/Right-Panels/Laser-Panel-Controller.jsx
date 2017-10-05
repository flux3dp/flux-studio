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
    

    const writeMode = function(name, val) {
        return _writeData(name, 'mode', val);
    }
    const writeSpeed = function(name, val) {
        return _writeData(name, 'speed', val);
    }
    const writeStrength = function(name, val) {
        return _writeData(name, 'strength', val);
    }
    

    class LaserPanelController {
        constructor(reactRoot) {
            this.reactRoot = reactRoot;
            this.funcs = {
                writeSpeed: writeSpeed,
                writeStrength: writeStrength,
                writeMode: writeMode
            }
        }
        
        initConfig(name) {
            writeMode(name, _defaultConfig.mode);
            writeSpeed(name, _defaultConfig.speed);
            writeStrength(name, _defaultConfig.strength);
        }

        cloneConfig(name, baseName) {
            writeMode(name, _getMode(baseName));            
            writeSpeed(name, _getSpeed(baseName));
            writeStrength(name, _getStrength(baseName));
        }

        render(name) {
            debugger;
            const speed = _getSpeed(name);
            const strength = _getStrength(name);
            const mode = _getMode(name);
            
            React.render(
                <LaserPanel
                    layerName={name}
                    speed={speed}
                    strength={strength}
                    mode={mode}
                    funcs={this.funcs}
                />
                ,this.reactRoot
            );
        }
    }


    return LaserPanelController;
});