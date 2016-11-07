define([
    'jquery',
    'react'
], function(
    $,
    React
) {
    'use strict';

    return React.createClass({

        _handleDone: function() {
            location.hash = '#studio/cloud';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud;
            return(
                <div className="cloud">
                    <div className="container email-sent">
                        <div className="middle">
                            <div className="description">
                                <h3>{lang.check_inbox}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-default" onClick={this._handleDone}>{lang.done}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
