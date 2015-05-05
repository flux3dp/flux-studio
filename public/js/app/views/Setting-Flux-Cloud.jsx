define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'css!cssHome/pages/settings'
], function($, React, i18n, SelectView) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div className="form">
                            <h1>{lang.settings.flux_cloud.caption}</h1>
                            <h2>{lang.settings.flux_cloud.line1}</h2>
                            <button className="btn">{lang.settings.flux_cloud.start_to_use}</button>
                            <button className="btn btn-link">{lang.settings.flux_cloud.i_have_an_account}</button>
                        </div>
                    )
                },

                getInitialState: function() {
                    return args.state;
                }

            });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code],
                selected: lang_code === i18n.getActiveLang()
            });
        }

        return View;
    };
});