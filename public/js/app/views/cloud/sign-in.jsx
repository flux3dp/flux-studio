define([
    'jquery',
    'react'
], function(
    $,
    React
) {
    'use strict';

    return React.createClass({

        render: function() {
            return(
                <div className="cloud">
                    <div className="container">
                        <div className="title1">
                            <h3>SIGN IN</h3>
                            <h2>FLUX CLOUD</h2>
                        </div>
                        <div className="controls">
                            <div>
                                <input type="text" placeholder="Email" />
                            </div>
                            <div>
                                <input type="text" placeholder="Password" />
                            </div>
                            <div className="forget-password">
                                <a>Forget your password?</a>
                            </div>
                            <div className="sign-up-description">
                                If you don't have the FLUX ID, please <a>SIGN UP</a> here.
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel">CANCEL</button>
                            <button className="btn btn-default">SIGN IN</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
