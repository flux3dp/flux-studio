define([
    'jquery',
    'react',
    'jsx!views/cutter/Setup-Panel',
    'jsx!pages/Holder',
    'helpers/api/config',
    'helpers/i18n',
], function(
    $,
    React,
    HolderSetupPanel,
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
                            zOffset: 0.1,
                            overcut: 2,
                            speed: 20,
                            bladeRadius: 0.24
                        }
                    };
                },

                componentDidMount: function() {
                    let options = Config.read('cut-defaults') || {};
                    options = {
                        zOffset: options.zOffset || 0.1,
                        overcut: options.overcut || 2,
                        speed: options.speed || 10,
                        bladeRadius: options.bladeRadius || 0.24,
                    };
                    if (!Config.read('cut-defaults')) {
                        Config.write('cut-defaults', options);
                    }
                    this.setState({options});
                },

                _fetchFormalSettings: function() {
                    let options = Config.read('cut-defaults') || {};
                    return {
                        zOffset: options.zOffset || 0.1,
                        overcut: options.overcut || 2,
                        speed: options.speed || 10,
                        bladeRadius: options.bladeRadius || 0.24,
                    };
                },

                _renderSetupPanel: function(holder) {
                    return <HolderSetupPanel
                        page={holder.props.page}
                        className="operating-panel"
                        imageFormat={holder.state.fileFormat}
                        defaults={holder.state.panelOptions}
                        ref="setupPanel"
                    />;
                },

                render: function() {
                    console.log('Load Holder', Holder);
                    // return <div />;
                    
                    return <Holder
                        page={this.props.page}
                        acceptFormat={'image/svg'}
                        panelOptions={this.state.options}
                        fetchFormalSettings={this._fetchFormalSettings}
                        renderSetupPanel={this._renderSetupPanel}
                    />;
                }
        });

        return view;
    };
});