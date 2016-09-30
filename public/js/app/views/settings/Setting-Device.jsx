define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/api/config',
    'jsx!widgets/Select',
    'app/actions/alert-actions',
    'helpers/device-master',
    'jsx!widgets/Dropdown-Control',
    'jsx!widgets/Radio-Control',
    'jsx!widgets/Checkbox-Control'
], function(
    $,
    React,
    i18n,
    config,
    SelectView,
    AlertActions,
    DeviceMaster,
    DropdownControl,
    RadioControl,
    CheckboxControl
) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                lang: {},
                supported_langs: '',
                onLangChange: function() {}
            };
        },

        getInitialState: function() {
            return {
                config: {}
            }
        },

        componentDidMount: function() {
            this.t = setInterval(() => {
                this.forceUpdate();
            }, 3000);
        },

        componentWillUnmount: function() {
            clearTimeout(this.t);
        },

        _handleDeviceChange: function(dropdownId, deviceName) {
            clearTimeout(this.t);
            this._getDeviceConfig(deviceName)
        },

        _handleComponentValueChange: function(id, value, source) {
            let config = Object.assign({}, this.state.config);

            if(id === 'head_error_level') {
                let v = 'delete';
                if(source === 'delete') {
                    value = ['delete'];
                }
                else if(source === 'N') {
                    value = ['N'];
                    v = 0;
                }
                else {
                    let i = value.indexOf('delete');
                    if(i !== -1) {
                        value = value.slice(0, i).concat(value.slice(i + 1));
                    }

                    i = value.indexOf('N');
                    if(i !== -1) {
                        value = value.slice(0, i).concat(value.slice(i + 1));
                    }

                    const types = ['LASER_DOWN', 'FAN_FAILURE', 'TILT', 'SHAKE'];
                    let configInBinary = (types.map(o => value.indexOf(o) !== -1 ? '1' : '0')).join('');
                    configInBinary = configInBinary + '0000';
                    v = parseInt(configInBinary, 2);
                }

                DeviceMaster.setDeviceSetting(id, v);
            }
            else {
                DeviceMaster.setDeviceSetting(id, value);
            }

            config[id] = value;
            this.setState({ config });
        },

        _getDeviceList: function() {
            let devices = DeviceMaster.getDeviceList(),
                nameList = (Object.keys(devices)).filter(o => o !== ''),
                { lang } = this.props;

            this.devices = devices;

            if(nameList.length === 0) {
                return (
                    <div>{lang.device.please_wait}</div>
                )
            }

            nameList.unshift(lang.device.select);

            return (
                <DropdownControl
                    id="device-list"
                    label={lang.device.deviceList}
                    onChange={this._handleDeviceChange}
                    options={nameList}/>
            )
        },

        _getDeviceConfig: function(deviceName) {
            const types = ['LASER_DOWN', 'FAN_FAILURE', 'TILT', 'SHAKE'];
            const pad = (num, size) => {
                var s = num+"";
                while (s.length < size) s = "0" + s;
                return s;
            };
            const mapNumberToTypeArray = (num) => {
                let t = [],
                    configs;

                configs = pad(num.toString(2), 8).slice(0, 4).split('');
                for(let i = 0; i < types.length; i++) {
                    if(configs[i] !== '0') {
                        t.push(types[i]);
                    }
                }

                return t;
            };

            DeviceMaster.selectDevice(this.devices[deviceName]).then(() => {
                return DeviceMaster.getDeviceSettings();
            }).then((config) => {
                config.head_error_level = config.head_error_level ? null : mapNumberToTypeArray(parseInt(config.head_error_level));
                this.setState({ config });
            });
        },

        _renderCorrectionSetting: function() {
            let { lang } = this.props,
                options,
                content;

            options = [
                { id: 'A', name: lang.device.calibration.A},
                { id: 'H', name: lang.device.calibration.H},
                { id: 'N', name: lang.device.calibration.N},
                { id: 'delete', name: lang.device.calibration.byFile}
            ]

            content = (
                <div className="controls">
                    <div className="label">{lang.device.calibration.title}</div>
                    <RadioControl
                        id="correction"
                        options={options}
                        default={this.state.config['correction'] || 'delete'}
                        onChange={this._handleComponentValueChange}/>
                </div>
            )

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderDetectFilamentSetting: function() {
            let { lang } = this.props,
                options,
                content;

            options = [
                { id: 'Y', name: lang.device.detectFilament.on},
                { id: 'N', name: lang.device.detectFilament.off},
                { id: 'delete', name: lang.device.detectFilament.byFile}
            ];

            content = (
                <div className="controls">
                    <div className="label">{lang.device.detectFilament.title}</div>
                    <RadioControl
                        id="filament_detect"
                        options={options}
                        default={this.state.config['filament_detect'] || 'delete'}
                        onChange={this._handleComponentValueChange}/>
                </div>
            )

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderFilterHeadErrorSetting: function() {
            let { lang } = this.props,
                options,
                content;

            options = [
                { id: 'LASER_DOWN', name: lang.device.filterHeadError.laser_down},
                { id: 'FAN_FAILURE', name: lang.device.filterHeadError.fan_failure},
                { id: 'TILT', name: lang.device.filterHeadError.tilt},
                { id: 'SHAKE', name: lang.device.filterHeadError.shake},
                { id: 'N', name: lang.device.filterHeadError.no},
                { id: 'delete', name: lang.device.filterHeadError.byFile}
            ];

            content = (

                <div className="controls">
                    <div className="label">{lang.device.filterHeadError.title}</div>
                    <CheckboxControl
                        id="head_error_level"
                        options={options}
                        default={this.state.config['head_error_level'] || ['delete']}
                        onChange={this._handleComponentValueChange}/>
                </div>
            )

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderAutoResumeSetting: function() {
            let { lang } = this.props,
                options,
                content;

            options = [
                { id: 'Y', name: lang.device.autoresume.on},
                { id: 'N', name: lang.device.autoresume.off}
            ];

            content = (
                <div className="controls">
                    <div className="label">{lang.device.autoresume.title}</div>
                    <RadioControl
                        id="autoresume"
                        options={options}
                        default={this.state.config['autoresume'] || 'N'}
                        onChange={this._handleComponentValueChange}/>
                </div>
            )

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        _renderBroadcast: function() {
            let { lang } = this.props,
                options,
                content;

            options = [
                { id: 'L', name: lang.device.broadcast.L},
                { id: 'A', name: lang.device.broadcast.A},
                { id: 'N', name: lang.device.broadcast.N}
            ];

            content = (
                <div className="controls">
                    <div className="label">{lang.device.broadcast.title}</div>
                    <RadioControl
                        id="broadcast"
                        options={options}
                        default={this.state.config['broadcast'] || 'L'}
                        onChange={this._handleComponentValueChange}/>
                </div>
            )

            return Object.keys(this.state.config).length > 0 ? content : '';
        },

        render : function() {
            let deviceList = this._getDeviceList(),
                correction = this._renderCorrectionSetting(),
                detectFilament = this._renderDetectFilamentSetting(),
                filterHeadError = this._renderFilterHeadErrorSetting(),
                autoResume = this._renderAutoResumeSetting(),
                broadcast = this._renderBroadcast();

            return (
                <div className="form general">
                    {deviceList}
                    {correction}
                    {detectFilament}
                    {filterHeadError}
                    {autoResume}
                    {broadcast}
                </div>
            );
        }

    });

});
