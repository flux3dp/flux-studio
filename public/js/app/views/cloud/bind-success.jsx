define([
    'jquery',
    'react'
], function(
    $,
    React
) {
    'use strict';

    return React.createClass({

        _handleBindAnother: function() {
            location.hash = '#studio/cloud/bind-machine';
        },

        _handleDone: function() {
            location.hash = '#studio/print';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud;
            return(
                <div className="cloud bind-success">
                    <div className="container">
                        <div className="title">
                            <h3>{lang.binding_success}</h3>
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
                        <button className="btn btn-cancel" onClick={this._handleBindAnother}>{lang.bind_another}</button>
                            <button className="btn btn-default" onClick={this._handleDone}>{lang.done}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
