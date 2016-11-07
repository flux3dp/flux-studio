define([
    'jquery',
    'react'
], function(
    $,
    React
) {
    'use strict';

    return React.createClass({

        _handleSignIn: function() {
            location.hash = '#studio/cloud/sign-in';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud;
            return(
                <div className="cloud">
                    <div className="container">
                        <div className="icon">
                            <img src="http://placehold.it/150x150" />
                        </div>
                        <div className="title no-margin">
                            <h3>{lang.sign_up}</h3>
                            <h2>{lang.success}</h2>
                        </div>
                        <div className="description">
                            <label>{lang.pleaseSignIn}</label>
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-default" onClick={this._handleSignIn}>{lang.sign_in}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
