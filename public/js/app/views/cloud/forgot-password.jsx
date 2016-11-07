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

        getInitialState: function() {
            return {
                email: ''
            }
        },

        _handleEnterEmail: function(e) {
            console.log(e.target.value);
            this.setState({ email: e.target.value });
        },

        _handleBack: function() {
            location.hash = '#studio/cloud/sign-in';
        },

        _handleNext: function() {
            let lang = this.props.lang.settings.flux_cloud;
            CloudApi.resetPassword(this.state.email).then(response => {
                if(response.ok) {
                    location.hash = '#studio/cloud/email-sent';
                }
                else {
                    alert(lang.contact_us);
                }
            })

        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud;
            return(
                <div className="cloud">
                    <div className="container forgot-password">
                        <div className="middle">
                            <div className="description">
                                <h3>{lang.enter_email}</h3>
                            </div>
                            <div className="controls">
                                <div className="control">
                                    <input type="text" placeholder="Email" onBlur={this._handleEnterEmail} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={this._handleBack}>{lang.back}</button>
                            <button className="btn btn-default" onClick={this._handleNext}>{lang.next}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
