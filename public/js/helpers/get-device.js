define([
  'app/actions/initialize-machine',
  'helpers/device-master',
  'helpers/api/config'
], function(
  InitializeMachine,
  DeviceMaster,
  Config
) {
  'use strict';

  return function() {
    let selectedDevice,
        defaultDevice = InitializeMachine.defaultPrinter.get(),
        configuredDevice = {},
        firstDevice = DeviceMaster.getFirstDevice();

    const isNotEmptyObject = o => Object.keys(o).length > 0;

    if (Config().read('configured-printer') !== '') {
        configuredDevice = Config().read('configured-printer');
    }

    // determin selected Device
    if (isNotEmptyObject(defaultDevice)) {
        selectedDevice = defaultDevice;
    }
    else if (isNotEmptyObject(configuredDevice)) {
        selectedDevice = configuredDevice;
    }
    else {
        selectedDevice = firstDevice;
    }
    if (selectedDevice) {
      let model = selectedDevice.model === 'delta-1' ? 'fd1' : 'fd1p';
      Config().write('configured-model', model);
    }

    return selectedDevice;
  };
});
