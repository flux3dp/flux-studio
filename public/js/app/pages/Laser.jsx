define([
    'jquery',
    'react',
    'jsx!views/laser/Setup-Panel',
    'jsx!pages/Holder',
    'helpers/api/config',
    'helpers/i18n',
    'helpers/nwjs/menu-factory',
], function(
    $,
    React,
    LaserSetupPanel,
    HolderGenerator,
    ConfigHelper,
    i18n,
    menuFactory
) {

    let Config = ConfigHelper(),
        lang = i18n.lang;

    'use strict';

    return function(args) {
        args = args || {};

        let Holder = HolderGenerator(args),
            nwjsMenu = menuFactory.items;

        let view = React.createClass({
                getDefaultProps: function() {
                    return {
                        page: React.PropTypes.string
                    };
                },

                getInitialState: function() {
                    return {
                        options: {
                            material: lang.laser.advanced.form.object_options.options[0],
                            objectHeight: 0,
                            heightOffset: 0,
                            isShading: false
                        }
                    };
                },

                componentDidMount: function() {
                    let options = Config.read('laser-defaults') || {};
                    if (options.material == null) {
                        options.material = lang.laser.advanced.form.object_options.options[0];
                    }

                    options.objectHeight = options.objectHeight || 0;
                    options.heightOffset = options.heightOffset || (Config.read('default-model') === 'fd1p' ? -2.3 : 0);
                    options.isShading = !!options.isShading;
                    if (!Config.read('laser-defaults')) {
                        Config.write('laser-defaults', options);
                    }
                    this.setState({options});
                    this._registerKeyEvents();
                },

                _registerKeyEvents: function() {
                    if(navigator.appVersion.indexOf('Mac') === -1) {
                        this._registerNonOsxShortcuts();
                    }
                },

                _registerNonOsxShortcuts: function() {
                    shortcuts.on(['ctrl', 'i'], () => { nwjsMenu.import.onClick(); });
                    shortcuts.on(['ctrl', 's'], () => { nwjsMenu.saveTask.onClick(); });
                    shortcuts.on(['ctrl', 'n'], () => { location.hash = '#initialize/wifi/connect-machine'; });
                    shortcuts.on(['ctrl', 'shift', 'x'], () => { nwjsMenu.clear.onClick(); });
                },

                _fetchFormalSettings: function(holder) {
                    let options = Config.read('laser-defaults') || {},
                        max = lang.laser.advanced.form.power.max;

                    return {
                        object_height: options.objectHeight,
                        height_offset: options.heightOffset || 0,
                        laser_speed: options.material.data.laser_speed,
                        focus_by_color: holder.state.debug || 0,
                        power: options.material.data.power / max,
                        shading: (true === holder.refs.setupPanel.isShading() ? 1 : 0)
                    };
                },

                _renderSetupPanel: function(holder) {
                    return <LaserSetupPanel
                        page={holder.props.page}
                        className="operating-panel"
                        imageFormat={holder.state.fileFormat}
                        defaults={holder.state.panelOptions}
                        onLoadCalibrationImage = { holder._onLoadCalibrationImage }
                        ref="setupPanel"
                        onShadingChanged={holder._onShadingChanged}
                    />;
                },

                render: function() {
                    // return <div />;

                    return <Holder
                        page={this.props.page}
                        acceptFormat={'image/*'}
                        panelOptions={this.state.options}
                        fetchFormalSettings={this._fetchFormalSettings}
                        renderSetupPanel={this._renderSetupPanel}
                    />;
                }
        });

        return view;
    };
});
