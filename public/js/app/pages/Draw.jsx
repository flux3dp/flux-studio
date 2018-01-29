define([
    'jquery',
    'react',
    'reactPropTypes',
    'jsx!views/holder/Setup-Panel',
    'jsx!pages/Holder',
    'helpers/api/config',
    'helpers/i18n',
], function(
    $,
    React,
    PropTypes,
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
                        page: PropTypes.string
                    };
                },

                getInitialState: function() {
                    return {
                        options: {
                            liftHeight: 55,
                            drawHeight: 50,
                            speed: 20
                        }
                    };
                },

                componentDidMount: function() {
                    let options = Config.read('draw-defaults') || {};
                    options = {
                        liftHeight: options.liftHeight || 55,
                        drawHeight: options.drawHeight || 50,
                        speed: options.speed || 20
                    };
                    if (!Config.read('draw-defaults')) {
                        Config.write('draw-defaults', options);
                    }
                    this.setState({options});
                },

                _fetchFormalSettings: function(holder) {
                    let options = Config.read('draw-defaults') || {};
                    return {
                        lift_height: options.liftHeight || 0.1,
                        draw_height: options.drawHeight || 0.1,
                        speed: options.speed || 20
                    };;
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