define([
    'helpers/api/config',
    'app/actions/beambox/default-config',
    'jsx!app/actions/beambox/Object-Panels-Controller',
    'jsx!app/actions/beambox/Laser-Panel-Controller'
], function (
    ConfigHelper,
    DefaultConfig,
    ObjectPanelsController,
    LaserPanelController
) {
    function init() {
        //init config
        const Config = ConfigHelper();
        const customConfig = Config.read('beambox-preference');
        const updatedConfig = $.extend({}, DefaultConfig, customConfig);
        Config.write('beambox-preference', updatedConfig);
        
        ObjectPanelsController.init('object-panels-placeholder');
        LaserPanelController.init('layer-laser-panel-placeholder');
    }
    return {
        init: init
    }
});