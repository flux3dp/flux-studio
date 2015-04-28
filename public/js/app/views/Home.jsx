define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    return function(args) {
        args = args || {};

        var PrintPlatform = React.createClass({
                render : function() {
                    return (
                        <div>
                            <h1>APP Name : {this.state.lang.app.name}</h1>
                        </div>
                    )
                },
                getInitialState: function() {
                    return args;
                },

                componentDidMount : function() {
                    // bind event here
                }

            });

        return PrintPlatform;
    };
});