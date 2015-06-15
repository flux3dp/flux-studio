define([
    'jquery',
    'react',
    'helpers/i18n',
], function($, React, i18n) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                lang: React.PropTypes.object,
                onWifiSelect: React.PropTypes.func
            };
        },
        _handleWifiSelect: function(id, name) {
            this.props.onWifiSelect(id, name);
        },
        _renderWifiList: function(array) {
            return array.map(function(opt, i) {
                return (
                    <li onClick={this._handleWifiSelect.bind(null, opt.id, opt.name)}>
                        <a>
                            <span>{opt.name}</span>
                            <span className="fa fa-wifi"></span>
                            <span className="fa fa-lock"></span>
                        </a>
                    </li>
                );
            }.bind(this));
        },
        render: function() {
            var lang = this.props.lang,
                items = [];

            for (var i = 0; i < 10; i++) {
                items.push({
                    id: i,
                    name: 'test-' + i,
                    serial: i
                });
            }

            items = this._renderWifiList(items);

            return (
                <div>
                    <ul className="pure-list wifi-list clearfix">
                        {items}
                    </ul>
                </div>
            );
        }

    });
});