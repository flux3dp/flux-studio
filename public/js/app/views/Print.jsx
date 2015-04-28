define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    return function(args) {
        args = args || {};

        var PrintPlatform = React.createClass({
                el : '.wrapper',
                render : function() {
                    return (
                        <div id="model-displayer" className="model-player">
                        <p>{this.props.params.foo}</p>
                        <p>{this.props.lang.foo}</p>
                        </div>
                    )
                },
                getInitialState: function() {
                    console.log('getInitialState');
                    return args;
                }

            });

        return PrintPlatform;
    };
});