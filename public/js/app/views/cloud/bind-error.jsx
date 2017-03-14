define([
    'jquery',
    'react',
    'helpers/device-master'
], function(
    $,
    React,
    DeviceMaster
) {
    'use strict';

    return React.createClass({

        _handleDownloadError: function(e) {
            e.preventDefault();

            DeviceMaster.downloadErrorLog().then(info => {
                saveAs(info[1], 'error-log.txt');
            });
        },

        _handleCancel: function() {
            location.hash = '#studio/print';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud;
            return(
                <div className="cloud bind-success">
                    <div className="container">
                        <div className="title">
                            <h3>{lang.binding_fail}</h3>
                            <label>{lang.binding_error_description}</label>
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
                            <button className="btn btn-default" onClick={this._handleDownloadError}>{lang.retrieve_error_log}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
