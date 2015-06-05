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
                    var lang = args.state.lang;

                    return (
                        <div className="form cloud">
                            <img src="/img/img-cloud.png" width="320" />
                            <div className="description">
                                <div className="font1">{lang.settings.flux_cloud.caption}</div>
                                <div className="font2">{lang.settings.flux_cloud.line1}</div>
                                <div className="actions">
                                    <div><a href="#studio/settings/setting-create-account" className="btn btn-default-dark btn-start">{lang.settings.flux_cloud.start_to_use}</a></div>
                                    <div><a href="javascript:void(0);" className="font4 link-account">{lang.settings.flux_cloud.i_have_an_account}</a></div>
                                </div>
                            </div>
                        </div>
                    );
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