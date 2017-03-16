define([
    'jquery',
    'react',
    'jsx!views/holder/Setup-Panel',
    'jsx!pages/Holder'
], function(
    $,
    React,
    HolderSetupPanel,
    HolderGenerator
) {
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

                renderSetupPanel: function(holder) {
                    return <HolderSetupPanel
                        page={holder.props.page}
                        className="operating-panel"
                        imageFormat={holder.state.fileFormat}
                        defaults={holder.state.setupPanelDefaults}
                        ref="setupPanel"
                    />;
                },

                render: function() {
                    console.log('Load Holder', Holder);
                    // return <div />;
                    
                    return <Holder page={this.props.page} renderSetupPanel={this.renderSetupPanel} />;
                }
        });

        return view;
    };
});