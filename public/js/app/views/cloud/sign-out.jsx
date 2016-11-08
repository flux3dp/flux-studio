define([
    'jquery',
    'react',
    'helpers/api/cloud'
], function(
    $,
    React,
    CloudApi
) {
    'use strict';

    return React.createClass({

        componentDidMount: function() {
            CloudApi.signOut().then(r => {
                location.hash = '#/studio/cloud';
            });
        },

        render: function() {
            return <div></div>;
        }
    });
});
