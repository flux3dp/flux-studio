define([
    'react',
    'jsx!views/beambox/Right-Panels/Laser-Panel',
], function(
    React,
    LaserPanel
){

    const _defaultConfig = {
        speed: 100,
        strength: 50
    }

    const _getLayer = function(name) {
        const layer = $('#svgcontent').find('g.layer').filter(function(){
            return $(this).find('title').text() === name;
        });
        return layer;

    }
    const _getSpeed = function(name) {
        let speed = _getLayer(name).attr('data-speed');
        speed = speed||writeSpeed(name, _defaultConfig.speed);
        return speed;
    }
    const _getStrength = function(name) {
        let strength = _getLayer(name).attr('data-strength');
        strength = strength||writeStrength(name, _defaultConfig.strength);
        return strength;  
    }
    const writeSpeed = function(name, val) {
        return _getLayer(name).attr('data-speed', val);
    }
    const writeStrength = function(name, val) {
        return _getLayer(name).attr('data-strength', val);        
    }

    class LaserPanelController {
        constructor(reactRoot) {
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
            const funcs = {
                writeSpeed: writeSpeed,
                writeStrength: writeStrength
            }
            React.render(
                <LaserPanel
                    layerName={name}
                    speed={speed}
                    strength={strength}
                    funcs={funcs}
                />
                ,this.reactRoot
            );
        }
    }


    return LaserPanelController;
});