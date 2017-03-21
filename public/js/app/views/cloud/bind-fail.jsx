define([
    'jquery',
    'react',
    'helpers/device-master',
    'helpers/device-error-handler'
], function(
    $,
    React,
    DeviceMaster,
    DeviceErrorHandler
) {
    'use strict';

    return React.createClass({

        _handleBackToList: function() {
            this.props.clear();
            setTimeout(() => {
                location.hash = '#studio/cloud/bind-machine';
            }, 10);
        },

        _handleCancel: function() {
            location.hash = '#studio/print';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud,
                { error } = this.props,
                message;

            message = Boolean(error) ?
                DeviceErrorHandler.translate(error) :
                lang.binding_error_description;

            return(
                <div className="cloud bind-success">
                    <div className="container">
                        <div className="title">
                            <h3>{lang.binding_fail}</h3>
                            <label>{message}</label>
                        </div>
                        <div className="icon">
                            <img src="img/error-icon.svg" />
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                        <button className="btn btn-cancel" onClick={this._handleCancel}>{lang.cancel}</button>
                            <button className="btn btn-default" onClick={this._handleBackToList}>{lang.back_to_list}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
