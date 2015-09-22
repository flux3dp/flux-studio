define([
    'react'
], function(React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Logo = React.createClass({
                _handleNavigation: function(address, e) {
                    location.hash = '#studio/' + address;
                },
                render : function() {


                    return (
                        <div>
                            <img src="img/logo-flux.png" />
                        </div>
                    );
                }

            });

        return Logo;
    };
});
