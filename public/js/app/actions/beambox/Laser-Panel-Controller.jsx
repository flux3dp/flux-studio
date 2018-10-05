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
        configName: '',
        speed: 50,
        strength: 15,
        repeat: 1
    }

    const _tracedImageConfig = {
        configName: '',
        speed: 200,
        strength: 20,
        repeat: 1
    }

    const _tracedPathConfig = {
        configName: '',
        speed: 5,
        strength: 70,
        repeat: 1
    }

    const _getConfig = function(name) {
        switch (name) {
            case 'Traced Image':
                return _tracedImageConfig;
            case 'Traced Path':
                return _tracedPathConfig;
            default:
                return _defaultConfig;
        }
    }

    const _getLayer = function(name) {
        const layer = $('#svgcontent').find('g.layer').filter(function(){
            return $(this).find('title').text() === name;
        });
        return layer;
    }
    const _getData = function(name, attr) {
        let val = _getLayer(name).attr('data-' + attr);
        val = val || _writeData(name, attr, _getConfig(name)[attr]);
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

    const getConfigName = function(name) {
        return _getData(name, 'configName');
    }

    const resetConfigName = function(name) {
        return _writeData(nane, '', val);
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

    const writeConfigName = function(name, val) {
        return _writeData(name, 'configName', val);
    }

    class LaserPanelController {
        constructor() {
            this.reactRoot = '';
            this.funcs = {
                writeSpeed: writeSpeed,
                writeStrength: writeStrength,
                writeRepeat: writeRepeat,
                writeConfigName: writeConfigName
            }
        }
        init(reactRoot) {
            this.reactRoot = reactRoot;
        }

        initConfig(name) {
            _getSpeed(name, _getConfig(name).speed);
            _getStrength(name, _getConfig(name).strength);
            _getRepeat(name, _getConfig(name).repeat);
        }

        cloneConfig(name, baseName) {
            writeSpeed(name, _getSpeed(baseName));
            writeStrength(name, _getStrength(baseName));
            writeRepeat(name, _getRepeat(baseName));
            writeConfigName(name, getConfigName(baseName));
        }

        render(name) {
            const speed = _getSpeed(name);
            const strength = _getStrength(name);
            const repeat = _getRepeat(name);
            const configName = getConfigName(name);

            ReactDOM.render(
                <LaserPanel
                    configName={configName}
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
