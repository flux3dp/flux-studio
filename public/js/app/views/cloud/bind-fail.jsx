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

        _handleBackToList: function() {
            location.hash = '#studio/cloud/bind-machine';
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
                        </div>
                        <div className="icon">
                            <img src="http://placehold.it/150x150" />
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
