define([
    'jquery',
    'react',
    'helpers/sprintf',
], function(
    $,
    React,
    Sprintf
) {
    'use strict';

    return React.createClass({

        _handleCancel: function() {
            location.hash = '#studio/print';
        },

        _handleRetry: function() {
            location.hash = '#studio/cloud/sign-up';
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
                            <h2>{lang.fail}</h2>
                        </div>
                        <div className="description">
                            <div className="sign-up-description" dangerouslySetInnerHTML={
                                {__html: Sprintf(lang.try_sign_up_again, "#/studio/cloud/sign-up")}
                            }></div>
                            {/* <label>{lang.pleaseSignIn}</label> */}
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                        <button className="btn btn-cancel" onClick={this._handleCancel}>{lang.cancel}</button>
                            <button className="btn btn-default" onClick={this._handleRetry}>{lang.try_again}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
