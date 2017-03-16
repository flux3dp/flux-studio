define([
    'jquery',
    'react',
    'jsx!views/laser/Setup-Panel',
    'jsx!pages/Holder',
    'helpers/api/config',
    'helpers/i18n',
], function(
    $,
    React,
    LaserSetupPanel,
    HolderGenerator,
    ConfigHelper,
    i18n
) {

    let Config = ConfigHelper(),
        lang = i18n.lang;

    'use strict';
    
    return function(args) {
        args = args || {};

        let Holder = HolderGenerator(args);

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
                },

                fetchFormalSettings: function(holder) {
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

                renderSetupPanel: function(holder) {
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
                    console.log('Load Holder', Holder);
                    // return <div />;
                    
                    return <Holder
                        page={this.props.page}
                        acceptFormat={'image/*'}
                        panelOptions={this.state.options}
                        fetchFormalSettings={this.fetchFormalSettings}
                        renderSetupPanel={this.renderSetupPanel}
                    />;
                }
        });

        return view;
    };
});